"""Audit & Logging Module service (Module 3.11)."""

from typing import Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditLog
from app.schemas.audit import AuditLogFilter


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(
        self,
        org_id: UUID,
        action: str,
        module: str,
        user_id: UUID = None,
        resource_type: str = None,
        resource_id: str = None,
        description: str = None,
        details: dict = None,
        ip_address: str = None,
        user_agent: str = None,
        status: str = "success",
    ) -> AuditLog:
        entry = AuditLog(
            org_id=org_id,
            user_id=user_id,
            action=action,
            module=module,
            resource_type=resource_type,
            resource_id=resource_id,
            description=description,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
        )
        self.db.add(entry)
        await self.db.flush()
        return entry

    async def search(self, org_id: UUID, filters: AuditLogFilter) -> tuple[list[AuditLog], int]:
        query = select(AuditLog).where(AuditLog.org_id == org_id)

        if filters.module:
            query = query.where(AuditLog.module == filters.module)
        if filters.action:
            query = query.where(AuditLog.action == filters.action)
        if filters.user_id:
            query = query.where(AuditLog.user_id == filters.user_id)
        if filters.resource_type:
            query = query.where(AuditLog.resource_type == filters.resource_type)
        if filters.start_date:
            query = query.where(AuditLog.created_at >= filters.start_date)
        if filters.end_date:
            query = query.where(AuditLog.created_at <= filters.end_date)

        count_result = await self.db.execute(select(func.count()).select_from(query.subquery()))
        total = count_result.scalar()

        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size).order_by(AuditLog.created_at.desc())
        result = await self.db.execute(query)

        return list(result.scalars().all()), total

    async def export_logs(self, org_id: UUID, start_date=None, end_date=None) -> list[AuditLog]:
        query = select(AuditLog).where(AuditLog.org_id == org_id)
        if start_date:
            query = query.where(AuditLog.created_at >= start_date)
        if end_date:
            query = query.where(AuditLog.created_at <= end_date)
        query = query.order_by(AuditLog.created_at.desc())
        result = await self.db.execute(query)
        return list(result.scalars().all())
