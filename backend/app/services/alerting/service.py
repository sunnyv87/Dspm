"""Alerting & Workflow Engine service (Module 3.8)."""

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alerting import (
    Alert, AlertComment, RemediationTask,
    AlertSeverity, AlertStatus, AlertType, TaskStatus,
)
from app.schemas.alerting import AlertFilter


class AlertingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_alert(
        self,
        org_id: UUID,
        alert_type: AlertType,
        severity: AlertSeverity,
        title: str,
        description: str = None,
        asset_id: UUID = None,
        policy_violation_id: UUID = None,
        remediation: str = None,
    ) -> Alert:
        alert = Alert(
            org_id=org_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            description=description,
            asset_id=asset_id,
            policy_violation_id=policy_violation_id,
            remediation_recommendation=remediation,
        )
        self.db.add(alert)
        await self.db.flush()
        return alert

    async def get_alert(self, alert_id: UUID, org_id: UUID = None) -> Optional[Alert]:
        """Get an alert with optional tenant isolation."""
        query = select(Alert).where(Alert.id == alert_id)
        if org_id:
            query = query.where(Alert.org_id == org_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_alerts(self, org_id: UUID, filters: AlertFilter) -> tuple[list[Alert], int]:
        query = select(Alert).where(Alert.org_id == org_id)
        if filters.severity:
            query = query.where(Alert.severity == filters.severity)
        if filters.status:
            query = query.where(Alert.status == filters.status)
        if filters.alert_type:
            query = query.where(Alert.alert_type == filters.alert_type)
        if filters.asset_id:
            query = query.where(Alert.asset_id == filters.asset_id)
        if filters.assigned_to:
            query = query.where(Alert.assigned_to == filters.assigned_to)

        from sqlalchemy import func
        count_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar()

        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size).order_by(Alert.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all()), total

    async def update_status(self, alert_id: UUID, status: AlertStatus, user_id: UUID = None, comment: str = None):
        values = {"status": status, "updated_at": datetime.now(timezone.utc)}
        if status == AlertStatus.RESOLVED:
            values["resolved_at"] = datetime.now(timezone.utc)

        await self.db.execute(update(Alert).where(Alert.id == alert_id).values(**values))

        if comment and user_id:
            await self.add_comment(alert_id, user_id, comment)

    async def assign_alert(self, alert_id: UUID, user_id: UUID):
        await self.db.execute(
            update(Alert).where(Alert.id == alert_id).values(assigned_to=user_id)
        )

    async def add_comment(self, alert_id: UUID, user_id: UUID, comment: str) -> AlertComment:
        c = AlertComment(alert_id=alert_id, user_id=user_id, comment=comment)
        self.db.add(c)
        await self.db.flush()
        return c

    async def create_remediation_task(self, data: dict) -> RemediationTask:
        task = RemediationTask(**data)
        self.db.add(task)
        await self.db.flush()
        return task

    async def complete_remediation_task(self, task_id: UUID):
        await self.db.execute(
            update(RemediationTask).where(RemediationTask.id == task_id).values(
                status=TaskStatus.COMPLETED,
                completed_at=datetime.now(timezone.utc),
            )
        )

    async def generate_alerts_from_violations(self, org_id: UUID, violations: list) -> list[Alert]:
        """Auto-generate alerts from policy violations."""
        alerts = []
        for v in violations:
            alert = await self.create_alert(
                org_id=org_id,
                alert_type=AlertType.POLICY_VIOLATION,
                severity=AlertSeverity(v.severity.value),
                title=f"Policy Violation: {v.description[:200]}",
                description=v.description,
                asset_id=v.asset_id,
                policy_violation_id=v.id,
                remediation=v.remediation_suggestion,
            )
            alerts.append(alert)
        return alerts
