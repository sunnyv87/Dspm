"""Celery tasks for scan execution pipeline."""

import asyncio
import logging
from uuid import UUID

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper to run async code in sync Celery tasks."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, max_retries=3)
def execute_scan(self, scan_job_id: str, connector_id: str, org_id: str):
    """Execute a full scan pipeline: discover -> classify -> risk score -> policy check -> alert."""
    run_async(_execute_scan_async(scan_job_id, connector_id, org_id))


async def _execute_scan_async(scan_job_id: str, connector_id: str, org_id: str):
    from app.core.database import async_session_factory
    from app.core.security import credential_encryptor
    from app.services.connector.service import ConnectorService
    from app.services.connector.handlers import ConnectorHandlerFactory
    from app.services.discovery.service import ScanService
    from app.services.classification.service import ClassificationService
    from app.services.inventory.service import AssetInventoryService
    from app.services.risk.service import RiskScoringService
    from app.services.policy.service import PolicyComplianceService
    from app.services.alerting.service import AlertingService
    from app.services.identity.service import IdentityAccessService
    from app.models.discovery import ScanStatus

    job_id = UUID(scan_job_id)
    conn_id = UUID(connector_id)
    o_id = UUID(org_id)

    async with async_session_factory() as session:
        scan_svc = ScanService(session)
        class_svc = ClassificationService(session)
        inv_svc = AssetInventoryService(session)
        risk_svc = RiskScoringService(session)
        policy_svc = PolicyComplianceService(session)
        alert_svc = AlertingService(session)
        conn_svc = ConnectorService(session)

        try:
            # Mark scan as running
            await scan_svc.update_scan_status(job_id, ScanStatus.RUNNING)

            # ── Phase 1: Connector-driven Discovery ──────────────────────
            connector = await conn_svc.get_connector(conn_id, o_id)
            if not connector:
                logger.error("Connector %s not found for org %s", conn_id, o_id)
                await scan_svc.update_scan_status(job_id, ScanStatus.FAILED)
                await session.commit()
                return

            handler = ConnectorHandlerFactory.get_handler(connector.connector_type.value)

            # Decrypt credentials for the handler
            credentials = {}
            for cred in connector.credentials:
                try:
                    credentials[cred.key_name] = credential_encryptor.decrypt(cred.encrypted_value)
                except Exception:
                    logger.warning("Failed to decrypt credential %s", cred.key_name)

            config = connector.config or {}

            # Discover assets via the connector handler
            try:
                raw_assets = await handler.list_assets(config, credentials)
            except NotImplementedError:
                raw_assets = []
                logger.info("Handler for %s does not implement list_assets, using existing discovered assets", connector.connector_type.value)

            # Register discovered assets
            for raw in raw_assets:
                await scan_svc.add_discovered_asset(job_id, {
                    "name": raw.get("name", ""),
                    "asset_type": raw.get("asset_type", "file"),
                    "path": raw.get("path", ""),
                    "size_bytes": raw.get("size_bytes"),
                    "metadata": raw.get("metadata"),
                })

            await scan_svc.update_progress(job_id, 0, 100)

            # ── Phase 2: Process each discovered asset ───────────────────
            discovered = await scan_svc.get_discovered_assets(job_id)
            total = len(discovered)

            for i, disc_asset in enumerate(discovered):
                # Fetch metadata from the connector
                asset_path = disc_asset.path or ""
                metadata = {}
                try:
                    metadata = await handler.fetch_metadata(config, credentials, asset_path)
                except NotImplementedError:
                    pass
                except Exception as e:
                    logger.warning("fetch_metadata failed for %s: %s", asset_path, e)

                encryption_status = metadata.get("encryption", disc_asset.encryption_status or "unknown")
                exposure = metadata.get("exposure", "private")

                # Upsert into inventory
                asset = await inv_svc.upsert_asset(o_id, {
                    "connector_id": conn_id,
                    "asset_type": disc_asset.asset_type.value if hasattr(disc_asset.asset_type, "value") else str(disc_asset.asset_type),
                    "name": disc_asset.name,
                    "path": disc_asset.path,
                    "size_bytes": disc_asset.size_bytes or metadata.get("size_bytes"),
                    "encryption_status": encryption_status,
                    "exposure_status": exposure,
                    "last_modified_at": disc_asset.last_modified_date,
                    "geo_region": metadata.get("region"),
                    "metadata": metadata,
                })

                # ── Phase 2b: Content classification ─────────────────────
                try:
                    content = await handler.scan_content(config, credentials, asset_path)
                    if content:
                        await class_svc.classify_content(content, job_id, asset.id)
                except NotImplementedError:
                    pass
                except Exception as e:
                    logger.warning("scan_content failed for %s: %s", asset_path, e)

                # ── Phase 3: Risk scoring ────────────────────────────────
                access_summary = None
                try:
                    id_svc = IdentityAccessService(session)
                    access_summary = await id_svc.get_asset_access_summary(asset.id)
                except Exception as e:
                    logger.warning(
                        "Failed to get access summary for asset %s: %s", asset.id, e
                    )

                await risk_svc.calculate_risk_score(asset, access_summary)

                # ── Phase 4: Policy evaluation ───────────────────────────
                classifications = await class_svc.get_results_for_asset(asset.id)
                violations = await policy_svc.evaluate_policies(o_id, asset, classifications)

                # ── Phase 5: Generate alerts ─────────────────────────────
                if violations:
                    await alert_svc.generate_alerts_from_violations(o_id, violations)

                await scan_svc.update_progress(job_id, i + 1, total)

            await scan_svc.update_scan_status(job_id, ScanStatus.COMPLETED)
            await session.commit()

        except Exception as e:
            logger.error("Scan %s failed: %s", scan_job_id, e, exc_info=True)
            await scan_svc.update_scan_status(job_id, ScanStatus.FAILED)
            await session.commit()
            raise
