"""Reporting & Dashboard Module service (Module 3.9)."""

from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import Asset, ExposureStatus
from app.models.alerting import Alert, AlertSeverity, AlertStatus
from app.models.policy import PolicyViolation, ViolationStatus
from app.models.risk import RiskHistory
from app.models.reporting import Report, Dashboard, DashboardWidget


class ReportingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_executive_summary(self, org_id: UUID) -> dict:
        # Total assets scanned
        total_result = await self.db.execute(
            select(func.count(Asset.id)).where(Asset.org_id == org_id)
        )
        total_assets = total_result.scalar() or 0

        # Sensitive assets
        sensitive_result = await self.db.execute(
            select(func.count(Asset.id)).where(
                Asset.org_id == org_id, Asset.sensitive_data_count > 0
            )
        )
        sensitive_assets = sensitive_result.scalar() or 0

        # Critical risk
        critical_result = await self.db.execute(
            select(func.count(Asset.id)).where(
                Asset.org_id == org_id, Asset.risk_score >= 80
            )
        )
        critical_risk = critical_result.scalar() or 0

        # Publicly exposed sensitive
        public_result = await self.db.execute(
            select(func.count(Asset.id)).where(
                Asset.org_id == org_id,
                Asset.exposure_status == ExposureStatus.PUBLIC,
                Asset.sensitive_data_count > 0,
            )
        )
        public_sensitive = public_result.scalar() or 0

        # Alerts by severity
        alerts_by_severity = {}
        for sev in AlertSeverity:
            count_result = await self.db.execute(
                select(func.count(Alert.id)).where(
                    Alert.org_id == org_id,
                    Alert.severity == sev,
                    Alert.status == AlertStatus.OPEN,
                )
            )
            alerts_by_severity[sev.value] = count_result.scalar() or 0

        # Top risky stores
        risky_result = await self.db.execute(
            select(Asset.name, Asset.risk_score)
            .where(Asset.org_id == org_id, Asset.risk_score.isnot(None))
            .order_by(Asset.risk_score.desc())
            .limit(10)
        )
        top_risky = [{"name": r[0], "risk_score": r[1]} for r in risky_result.all()]

        return {
            "total_assets_scanned": total_assets,
            "sensitive_assets_count": sensitive_assets,
            "critical_risk_assets": critical_risk,
            "publicly_exposed_sensitive": public_sensitive,
            "top_risky_stores": top_risky,
            "alerts_by_severity": alerts_by_severity,
        }

    async def create_report(self, org_id: UUID, data: dict) -> Report:
        report = Report(org_id=org_id, **data)
        self.db.add(report)
        await self.db.flush()
        return report

    async def get_report(self, report_id: UUID) -> Report:
        result = await self.db.execute(select(Report).where(Report.id == report_id))
        return result.scalar_one_or_none()

    async def list_reports(self, org_id: UUID) -> list[Report]:
        result = await self.db.execute(
            select(Report).where(Report.org_id == org_id).order_by(Report.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_dashboards(self, org_id: UUID) -> list[Dashboard]:
        result = await self.db.execute(
            select(Dashboard).where(Dashboard.org_id == org_id)
        )
        return list(result.scalars().all())
