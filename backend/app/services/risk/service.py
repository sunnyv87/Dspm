"""Risk Scoring Engine service (Module 3.6)."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.risk import RiskScore, RiskFactor, RiskHistory
from app.models.inventory import Asset, ExposureStatus, EncryptionStatus


class RiskScoringService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Default weights for risk factors
    DEFAULT_WEIGHTS = {
        "data_sensitivity": 3.0,
        "public_accessibility": 2.5,
        "external_sharing": 2.0,
        "encryption_disabled": 2.0,
        "privileged_users_count": 1.5,
        "dev_test_exposure": 1.5,
        "data_duplication": 1.0,
        "data_staleness": 0.5,
        "sensitive_record_volume": 1.5,
        "internet_exposure": 2.5,
    }

    async def calculate_risk_score(self, asset: Asset, access_summary: dict = None) -> RiskScore:
        """Calculate risk score for an asset based on multiple weighted factors."""
        factors = []
        total_score = 0.0
        max_possible = 0.0

        # Factor: Data sensitivity
        weight = self.DEFAULT_WEIGHTS["data_sensitivity"]
        max_possible += weight * 10
        if asset.sensitive_data_count > 0:
            sensitivity_score = min(10, asset.sensitive_data_count / 10)
            total_score += sensitivity_score * weight
            factors.append({"factor": "data_sensitivity", "score": sensitivity_score, "weight": weight})

        # Factor: Public accessibility
        weight = self.DEFAULT_WEIGHTS["public_accessibility"]
        max_possible += weight * 10
        if asset.exposure_status == ExposureStatus.PUBLIC:
            total_score += 10 * weight
            factors.append({"factor": "public_accessibility", "score": 10, "weight": weight})
        elif asset.exposure_status == ExposureStatus.EXTERNAL_SHARED:
            total_score += 7 * weight
            factors.append({"factor": "external_sharing", "score": 7, "weight": weight})

        # Factor: Encryption
        weight = self.DEFAULT_WEIGHTS["encryption_disabled"]
        max_possible += weight * 10
        if asset.encryption_status == EncryptionStatus.NOT_ENCRYPTED:
            total_score += 10 * weight
            factors.append({"factor": "encryption_disabled", "score": 10, "weight": weight})

        # Factor: Dev/test exposure
        weight = self.DEFAULT_WEIGHTS["dev_test_exposure"]
        max_possible += weight * 10
        if asset.environment in ("dev", "test", "staging") and asset.sensitive_data_count > 0:
            total_score += 8 * weight
            factors.append({"factor": "sensitive_in_non_prod", "score": 8, "weight": weight})

        # Factor: Duplication
        weight = self.DEFAULT_WEIGHTS["data_duplication"]
        max_possible += weight * 10
        if asset.is_duplicate:
            total_score += 6 * weight
            factors.append({"factor": "data_duplication", "score": 6, "weight": weight})

        # Factor: Staleness
        weight = self.DEFAULT_WEIGHTS["data_staleness"]
        max_possible += weight * 10
        if asset.is_stale:
            total_score += 5 * weight
            factors.append({"factor": "stale_data", "score": 5, "weight": weight})

        # Factor: Access breadth
        if access_summary:
            weight = self.DEFAULT_WEIGHTS["privileged_users_count"]
            max_possible += weight * 10
            priv_count = access_summary.get("privileged_users", 0)
            if priv_count > 10:
                access_score = 10
            elif priv_count > 5:
                access_score = 7
            elif priv_count > 2:
                access_score = 4
            else:
                access_score = 1
            total_score += access_score * weight
            factors.append({"factor": "privileged_users", "score": access_score, "weight": weight})

        # Normalize to 0-100
        overall = (total_score / max_possible * 100) if max_possible > 0 else 0
        overall = round(min(100, overall), 1)

        # Determine risk level
        if overall >= 80:
            risk_level = "critical"
        elif overall >= 60:
            risk_level = "high"
        elif overall >= 40:
            risk_level = "medium"
        elif overall >= 20:
            risk_level = "low"
        else:
            risk_level = "informational"

        # Sort factors by contribution
        factors.sort(key=lambda f: f["score"] * f["weight"], reverse=True)
        top_factors = factors[:5]

        # Remediation recommendations
        remediation = []
        for f in top_factors:
            if f["factor"] == "public_accessibility":
                remediation.append("Revoke public access to this asset")
            elif f["factor"] == "encryption_disabled":
                remediation.append("Enable encryption for this asset")
            elif f["factor"] == "sensitive_in_non_prod":
                remediation.append("Remove sensitive data from non-production environments")
            elif f["factor"] == "data_duplication":
                remediation.append("Consolidate or remove duplicate sensitive data")
            elif f["factor"] == "privileged_users":
                remediation.append("Review and reduce privileged access")

        risk_score = RiskScore(
            asset_id=asset.id,
            org_id=asset.org_id,
            overall_score=overall,
            risk_level=risk_level,
            contributing_factors=top_factors,
            recommended_remediation=remediation,
        )
        self.db.add(risk_score)

        # Update asset risk score
        asset.risk_score = overall
        await self.db.flush()

        # Record history
        history = RiskHistory(
            asset_id=asset.id,
            org_id=asset.org_id,
            scope="asset",
            scope_id=str(asset.id),
            score=overall,
            risk_level=risk_level,
        )
        self.db.add(history)
        await self.db.flush()

        return risk_score

    async def get_risk_trend(self, org_id: UUID, scope: str = "org", scope_id: str = None, limit: int = 30):
        query = select(RiskHistory).where(
            RiskHistory.org_id == org_id,
            RiskHistory.scope == scope,
        )
        if scope_id:
            query = query.where(RiskHistory.scope_id == scope_id)
        query = query.order_by(RiskHistory.recorded_at.desc()).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_org_risk_summary(self, org_id: UUID) -> dict:
        from sqlalchemy import func as sqlfunc
        result = await self.db.execute(
            select(
                sqlfunc.count(Asset.id).label("total"),
                sqlfunc.avg(Asset.risk_score).label("avg_risk"),
                sqlfunc.count(Asset.id).filter(Asset.risk_score >= 80).label("critical"),
                sqlfunc.count(Asset.id).filter(Asset.risk_score >= 60, Asset.risk_score < 80).label("high"),
                sqlfunc.count(Asset.id).filter(Asset.risk_score >= 40, Asset.risk_score < 60).label("medium"),
                sqlfunc.count(Asset.id).filter(Asset.risk_score < 40).label("low"),
            ).where(Asset.org_id == org_id, Asset.risk_score.isnot(None))
        )
        row = result.one()
        return {
            "total_scored_assets": row.total,
            "average_risk_score": round(row.avg_risk or 0, 1),
            "critical_count": row.critical,
            "high_count": row.high,
            "medium_count": row.medium,
            "low_count": row.low,
        }
