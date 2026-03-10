"""SQLAlchemy models for all DSPM modules."""

from app.models.connector import Connector, ConnectorCredential, ConnectorSyncLog
from app.models.discovery import ScanJob, DiscoveredAsset
from app.models.classification import (
    ClassificationRule,
    ClassificationResult,
    CustomClassifier,
)
from app.models.inventory import Asset, AssetTag, AssetOwner
from app.models.identity import (
    IdentityRecord,
    AccessPermission,
    AccessFinding,
)
from app.models.risk import RiskScore, RiskFactor, RiskHistory
from app.models.policy import (
    ComplianceFramework,
    PolicyRule,
    PolicyViolation,
)
from app.models.alerting import Alert, AlertComment, RemediationTask
from app.models.reporting import Report, Dashboard, DashboardWidget
from app.models.admin import User, Role, Permission, Organization, APIToken
from app.models.audit import AuditLog

__all__ = [
    "Connector", "ConnectorCredential", "ConnectorSyncLog",
    "ScanJob", "DiscoveredAsset",
    "ClassificationRule", "ClassificationResult", "CustomClassifier",
    "Asset", "AssetTag", "AssetOwner",
    "IdentityRecord", "AccessPermission", "AccessFinding",
    "RiskScore", "RiskFactor", "RiskHistory",
    "ComplianceFramework", "PolicyRule", "PolicyViolation",
    "Alert", "AlertComment", "RemediationTask",
    "Report", "Dashboard", "DashboardWidget",
    "User", "Role", "Permission", "Organization", "APIToken",
    "AuditLog",
]
