"""Celery tasks for scan execution pipeline."""

import asyncio
from uuid import UUID

from app.workers.celery_app import celery_app


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

        try:
            # Mark scan as running
            await scan_svc.update_scan_status(job_id, ScanStatus.RUNNING)

            # Phase 1: Discovery (connector-specific asset enumeration)
            # This would call the connector handler to list assets
            # For now, we update progress
            await scan_svc.update_progress(job_id, 0, 100)

            # Phase 2: For each discovered asset, classify content
            discovered = await scan_svc.get_discovered_assets(job_id)
            total = len(discovered)

            for i, disc_asset in enumerate(discovered):
                # Upsert into inventory
                asset = await inv_svc.upsert_asset(o_id, {
                    "connector_id": conn_id,
                    "asset_type": disc_asset.asset_type.value,
                    "name": disc_asset.name,
                    "path": disc_asset.path,
                    "size_bytes": disc_asset.size_bytes,
                    "encryption_status": disc_asset.encryption_status or "unknown",
                    "last_modified_at": disc_asset.last_modified_date,
                })

                # Phase 3: Risk scoring
                access_summary = None
                try:
                    id_svc = IdentityAccessService(session)
                    access_summary = await id_svc.get_asset_access_summary(asset.id)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).warning(
                        "Failed to get access summary for asset %s: %s", asset.id, e
                    )

                await risk_svc.calculate_risk_score(asset, access_summary)

                # Phase 4: Policy evaluation
                classifications = await class_svc.get_results_for_asset(asset.id)
                violations = await policy_svc.evaluate_policies(o_id, asset, classifications)

                # Phase 5: Generate alerts
                if violations:
                    await alert_svc.generate_alerts_from_violations(o_id, violations)

                await scan_svc.update_progress(job_id, i + 1, total)

            await scan_svc.update_scan_status(job_id, ScanStatus.COMPLETED)
            await session.commit()

        except Exception as e:
            await scan_svc.update_scan_status(job_id, ScanStatus.FAILED)
            await session.commit()
            raise
