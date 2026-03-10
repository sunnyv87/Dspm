"""API v1 router - aggregates all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, connectors, scans, classification,
    assets, identity, risk, policies,
    alerts, reports, admin, audit,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(connectors.router)
api_router.include_router(scans.router)
api_router.include_router(classification.router)
api_router.include_router(assets.router)
api_router.include_router(identity.router)
api_router.include_router(risk.router)
api_router.include_router(policies.router)
api_router.include_router(alerts.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)
api_router.include_router(audit.router)
