"""
AI-powered natural language query endpoint for CISO reporting.

All data processing happens locally — zero data leaves the infrastructure.
Translates natural language questions into internal API calls and returns
CISO-friendly narratives with structured data.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.inventory import Asset
from app.models.alerting import Alert
from app.models.policy import PolicyViolation, ComplianceFramework, PolicyRule
from app.models.identity import AccessFinding
from app.models.connector import Connector
from app.models.discovery import ScanJob
from app.models.risk import RiskScore, RiskHistory
from app.schemas.ai_query import AIQueryRequest, AIQueryResponse
from app.services.ai_query_engine import (
    QueryIntent,
    parse_query,
    format_executive_summary,
    format_risk_summary,
    format_alert_list,
    format_asset_list,
    format_compliance_coverage,
    format_violations,
    format_access_findings,
    format_connector_status,
    format_unknown_query,
    get_follow_up_suggestions,
)

router = APIRouter(prefix="/ai", tags=["AI Query Interface"])


@router.post("/query", response_model=AIQueryResponse)
async def natural_language_query(
    request: AIQueryRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Process a natural language query from a CISO or security team member.

    - Parses the query locally using rule-based NLP (no external AI calls)
    - Maps intent to internal database queries
    - Returns a narrative summary with structured data
    - All processing stays within the infrastructure
    """
    org_id = current_user["org_id"]
    parsed = parse_query(request.query)

    # Route to the appropriate data handler
    handler = _INTENT_HANDLERS.get(parsed.intent, _handle_unknown)
    result = await handler(db, org_id, parsed)

    return AIQueryResponse(
        query=request.query,
        intent=parsed.intent.value,
        confidence=parsed.confidence,
        narrative=result.get("narrative", ""),
        data=result,
        suggestions=get_follow_up_suggestions(parsed.intent),
        data_residency="local",
    )


@router.get("/suggestions")
async def get_query_suggestions(
    current_user: dict = Depends(get_current_user),
):
    """Return example queries categorized by topic."""
    return {
        "categories": [
            {
                "label": "Executive Overview",
                "queries": [
                    "What is our overall security posture?",
                    "Give me an executive summary",
                    "How are we doing on risk?",
                ],
            },
            {
                "label": "Risk & Threats",
                "queries": [
                    "Show me all critical alerts",
                    "What is our risk trend this month?",
                    "Which assets are at critical risk?",
                ],
            },
            {
                "label": "Data Exposure",
                "queries": [
                    "Are any sensitive assets publicly exposed?",
                    "Show me shadow data stores",
                    "Which assets have no owner?",
                ],
            },
            {
                "label": "Compliance",
                "queries": [
                    "What is our GDPR compliance status?",
                    "Show all policy violations",
                    "How are we on DPDPA compliance?",
                ],
            },
            {
                "label": "Identity & Access",
                "queries": [
                    "Any excessive access findings?",
                    "Show toxic permission combinations",
                    "Are there orphaned accounts?",
                ],
            },
            {
                "label": "Infrastructure",
                "queries": [
                    "Are all connectors healthy?",
                    "When was the last scan?",
                    "Which connectors are failing?",
                ],
            },
        ],
        "data_residency": "local",
    }


# ---------------------------------------------------------------------------
# Intent handlers — each queries the DB and formats a response
# ---------------------------------------------------------------------------

async def _handle_executive_summary(db: AsyncSession, org_id, parsed) -> dict:
    """Build executive summary from multiple data sources."""
    # Total assets
    total_q = await db.execute(
        select(func.count(Asset.id)).where(Asset.org_id == org_id)
    )
    total = total_q.scalar() or 0

    # Sensitive assets
    sensitive_q = await db.execute(
        select(func.count(Asset.id)).where(
            Asset.org_id == org_id, Asset.sensitive_data_count > 0
        )
    )
    sensitive = sensitive_q.scalar() or 0

    # Critical risk
    critical_q = await db.execute(
        select(func.count(Asset.id)).where(
            Asset.org_id == org_id, Asset.risk_score >= 80
        )
    )
    critical = critical_q.scalar() or 0

    # Publicly exposed sensitive
    exposed_q = await db.execute(
        select(func.count(Asset.id)).where(
            Asset.org_id == org_id,
            Asset.sensitive_data_count > 0,
            Asset.exposure_status == "public",
        )
    )
    exposed = exposed_q.scalar() or 0

    # Top risky stores
    top_q = await db.execute(
        select(Asset.name, Asset.risk_score)
        .where(Asset.org_id == org_id, Asset.risk_score.isnot(None))
        .order_by(Asset.risk_score.desc())
        .limit(10)
    )
    top_stores = [{"name": r[0], "risk_score": r[1]} for r in top_q.fetchall()]

    # Alerts by severity
    alerts_q = await db.execute(
        select(Alert.severity, func.count(Alert.id))
        .where(Alert.org_id == org_id, Alert.status.in_(["open", "in_progress"]))
        .group_by(Alert.severity)
    )
    alerts_by_severity = {r[0]: r[1] for r in alerts_q.fetchall()}

    data = {
        "total_assets_scanned": total,
        "sensitive_assets_count": sensitive,
        "critical_risk_assets": critical,
        "publicly_exposed_sensitive": exposed,
        "top_risky_stores": top_stores,
        "alerts_by_severity": alerts_by_severity,
    }
    return format_executive_summary(data)


async def _handle_risk_summary(db: AsyncSession, org_id, parsed) -> dict:
    """Get organization risk distribution."""
    total_q = await db.execute(
        select(func.count(Asset.id)).where(
            Asset.org_id == org_id, Asset.risk_score.isnot(None)
        )
    )
    total = total_q.scalar() or 0

    avg_q = await db.execute(
        select(func.avg(Asset.risk_score)).where(
            Asset.org_id == org_id, Asset.risk_score.isnot(None)
        )
    )
    avg = avg_q.scalar() or 0

    # Count by risk band
    dist_q = await db.execute(
        select(
            func.count(case((Asset.risk_score >= 80, 1))),
            func.count(case((Asset.risk_score.between(60, 79), 1))),
            func.count(case((Asset.risk_score.between(40, 59), 1))),
            func.count(case((Asset.risk_score < 40, 1))),
        ).where(Asset.org_id == org_id, Asset.risk_score.isnot(None))
    )
    row = dist_q.fetchone()
    crit, high, med, low = (row[0] or 0, row[1] or 0, row[2] or 0, row[3] or 0) if row else (0, 0, 0, 0)

    return format_risk_summary({
        "total_scored_assets": total,
        "average_risk_score": float(avg),
        "critical_count": crit,
        "high_count": high,
        "medium_count": med,
        "low_count": low,
    })


async def _handle_risk_trend(db: AsyncSession, org_id, parsed) -> dict:
    """Get risk score trend over time."""
    q = await db.execute(
        select(RiskHistory.recorded_at, RiskHistory.score, RiskHistory.risk_level)
        .where(RiskHistory.org_id == org_id, RiskHistory.scope == "org")
        .order_by(RiskHistory.recorded_at.desc())
        .limit(90)
    )
    rows = q.fetchall()
    if not rows:
        return {"narrative": "No risk history data available yet. Run a scan to generate risk scores."}

    latest = rows[0]
    oldest = rows[-1]
    trend = "improving" if latest[1] < oldest[1] else "worsening" if latest[1] > oldest[1] else "stable"

    return {
        "narrative": (
            f"Risk trend is **{trend}**. Current score: {latest[1]:.1f}, "
            f"earliest recorded: {oldest[1]:.1f} (over {len(rows)} data points). "
            f"Current level: {latest[2]}."
        ),
        "trend": trend,
        "current_score": latest[1],
        "data_points": [
            {"date": str(r[0]), "score": r[1], "level": r[2]}
            for r in reversed(rows)
        ],
    }


async def _handle_alerts(db: AsyncSession, org_id, parsed, status_filter=None, severity_filter=None) -> dict:
    """Generic alert handler with optional filters."""
    query = select(Alert).where(Alert.org_id == org_id)

    if status_filter:
        query = query.where(Alert.status == status_filter)
    elif parsed.entities.status:
        query = query.where(Alert.status == parsed.entities.status)
    else:
        query = query.where(Alert.status.in_(["open", "in_progress"]))

    if severity_filter:
        query = query.where(Alert.severity == severity_filter)
    elif parsed.entities.severity:
        query = query.where(Alert.severity == parsed.entities.severity)

    query = query.order_by(Alert.created_at.desc()).limit(parsed.entities.limit or 50)

    result = await db.execute(query)
    alerts = result.scalars().all()
    alert_dicts = [
        {
            "id": str(a.id), "title": a.title, "severity": a.severity,
            "status": a.status, "description": a.description,
            "asset_id": str(a.asset_id) if a.asset_id else None,
            "remediation_recommendation": a.remediation_recommendation,
            "created_at": str(a.created_at),
        }
        for a in alerts
    ]
    return format_alert_list(alert_dicts, parsed.original_query)


async def _handle_open_alerts(db, org_id, parsed) -> dict:
    return await _handle_alerts(db, org_id, parsed, status_filter="open")


async def _handle_critical_alerts(db, org_id, parsed) -> dict:
    return await _handle_alerts(db, org_id, parsed, severity_filter="critical")


async def _handle_alert_summary(db: AsyncSession, org_id, parsed) -> dict:
    return await _handle_alerts(db, org_id, parsed)


async def _handle_alerts_by_type(db: AsyncSession, org_id, parsed) -> dict:
    q = await db.execute(
        select(Alert.alert_type, func.count(Alert.id))
        .where(Alert.org_id == org_id, Alert.status.in_(["open", "in_progress"]))
        .group_by(Alert.alert_type)
    )
    by_type = {r[0]: r[1] for r in q.fetchall()}
    total = sum(by_type.values())
    narrative = f"{total} open alert(s) across {len(by_type)} type(s). "
    narrative += " | ".join(f"{t}: {c}" for t, c in sorted(by_type.items(), key=lambda x: -x[1]))
    return {"narrative": narrative, "by_type": by_type, "total": total}


async def _handle_assets(db: AsyncSession, org_id, parsed, extra_filters=None, category="matching") -> dict:
    """Generic asset handler."""
    query = select(Asset).where(Asset.org_id == org_id)
    if extra_filters:
        for f in extra_filters:
            query = query.where(f)
    if parsed.entities.environment:
        query = query.where(Asset.environment == parsed.entities.environment)
    if parsed.entities.region:
        query = query.where(Asset.geo_region.ilike(f"%{parsed.entities.region}%"))
    if parsed.entities.asset_type:
        query = query.where(Asset.asset_type == parsed.entities.asset_type)

    query = query.order_by(Asset.risk_score.desc().nullslast()).limit(parsed.entities.limit or 50)
    result = await db.execute(query)
    assets = result.scalars().all()
    asset_dicts = [
        {
            "name": a.name, "asset_type": a.asset_type, "risk_score": a.risk_score,
            "sensitive_data_count": a.sensitive_data_count, "exposure_status": a.exposure_status,
            "geo_region": a.geo_region, "business_owner": a.business_owner,
            "environment": a.environment, "encryption_status": a.encryption_status,
        }
        for a in assets
    ]
    return format_asset_list(asset_dicts, category)


async def _handle_total_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(db, org_id, parsed, category="total")


async def _handle_sensitive_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(db, org_id, parsed, [Asset.sensitive_data_count > 0], "sensitive")


async def _handle_exposed_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(
        db, org_id, parsed,
        [Asset.exposure_status.in_(["public", "external_shared"]), Asset.sensitive_data_count > 0],
        "publicly exposed",
    )


async def _handle_stale_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(db, org_id, parsed, [Asset.is_stale.is_(True)], "stale")


async def _handle_shadow_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(db, org_id, parsed, [Asset.is_shadow_data.is_(True)], "shadow/unmanaged")


async def _handle_unowned_assets(db, org_id, parsed) -> dict:
    return await _handle_assets(
        db, org_id, parsed,
        [Asset.business_owner.is_(None), Asset.technical_owner.is_(None)],
        "unowned",
    )


async def _handle_asset_details(db, org_id, parsed) -> dict:
    return await _handle_assets(db, org_id, parsed, category="matching")


async def _handle_compliance_coverage(db: AsyncSession, org_id, parsed) -> dict:
    fw_q = await db.execute(
        select(ComplianceFramework).where(
            ComplianceFramework.org_id == org_id, ComplianceFramework.is_enabled.is_(True)
        )
    )
    frameworks = fw_q.scalars().all()
    fw_data = []
    for fw in frameworks:
        # Count rules and violations for this framework
        rules_q = await db.execute(
            select(func.count(PolicyRule.id)).where(
                PolicyRule.framework_id == fw.id, PolicyRule.is_enabled.is_(True)
            )
        )
        total_rules = rules_q.scalar() or 0

        violations_q = await db.execute(
            select(func.count(PolicyViolation.id))
            .join(PolicyRule, PolicyViolation.policy_rule_id == PolicyRule.id)
            .where(
                PolicyRule.framework_id == fw.id,
                PolicyViolation.status.in_(["open", "in_progress"]),
            )
        )
        violation_count = violations_q.scalar() or 0

        coverage = max(0, 100 - (violation_count / max(total_rules, 1)) * 100) if total_rules > 0 else 0

        fw_data.append({
            "framework_type": fw.framework_type,
            "name": fw.name,
            "total_rules": total_rules,
            "violation_count": violation_count,
            "coverage_percent": round(coverage, 1),
        })

    if parsed.entities.framework:
        fw_data = [f for f in fw_data if f["framework_type"] == parsed.entities.framework] or fw_data

    return format_compliance_coverage({"frameworks": fw_data})


async def _handle_policy_violations(db: AsyncSession, org_id, parsed) -> dict:
    query = (
        select(PolicyViolation)
        .join(PolicyRule, PolicyViolation.policy_rule_id == PolicyRule.id)
        .join(ComplianceFramework, PolicyRule.framework_id == ComplianceFramework.id)
        .where(ComplianceFramework.org_id == org_id)
    )
    if parsed.entities.status:
        query = query.where(PolicyViolation.status == parsed.entities.status)
    else:
        query = query.where(PolicyViolation.status.in_(["open", "in_progress"]))

    if parsed.entities.severity:
        query = query.where(PolicyViolation.severity == parsed.entities.severity)

    query = query.order_by(PolicyViolation.detected_at.desc()).limit(50)
    result = await db.execute(query)
    violations = result.scalars().all()

    v_dicts = [
        {
            "id": str(v.id), "severity": v.severity, "status": v.status,
            "description": v.description, "asset_id": str(v.asset_id) if v.asset_id else None,
            "detected_at": str(v.detected_at),
        }
        for v in violations
    ]
    return format_violations(v_dicts)


async def _handle_framework_status(db, org_id, parsed) -> dict:
    return await _handle_compliance_coverage(db, org_id, parsed)


async def _handle_access_findings(db: AsyncSession, org_id, parsed) -> dict:
    query = select(AccessFinding).where(AccessFinding.org_id == org_id, AccessFinding.is_resolved.is_(False))

    if parsed.entities.severity:
        query = query.where(AccessFinding.severity == parsed.entities.severity)

    query = query.limit(50)
    result = await db.execute(query)
    findings = result.scalars().all()

    f_dicts = [
        {
            "id": str(f.id), "finding_type": f.finding_type, "severity": f.severity,
            "description": f.description, "recommendation": f.recommendation,
        }
        for f in findings
    ]
    return format_access_findings(f_dicts)


async def _handle_excessive_access(db: AsyncSession, org_id, parsed) -> dict:
    query = (
        select(AccessFinding)
        .where(
            AccessFinding.org_id == org_id,
            AccessFinding.is_resolved.is_(False),
            AccessFinding.finding_type.in_(["OVERLY_PERMISSIVE", "INACTIVE_PRIVILEGED", "TOXIC_COMBINATION"]),
        )
        .limit(50)
    )
    result = await db.execute(query)
    findings = result.scalars().all()
    f_dicts = [
        {
            "id": str(f.id), "finding_type": f.finding_type, "severity": f.severity,
            "description": f.description, "recommendation": f.recommendation,
        }
        for f in findings
    ]
    return format_access_findings(f_dicts)


async def _handle_public_access(db: AsyncSession, org_id, parsed) -> dict:
    query = (
        select(AccessFinding)
        .where(
            AccessFinding.org_id == org_id,
            AccessFinding.is_resolved.is_(False),
            AccessFinding.finding_type.in_(["PUBLIC_ACCESS", "ANONYMOUS_LINK"]),
        )
        .limit(50)
    )
    result = await db.execute(query)
    findings = result.scalars().all()
    f_dicts = [
        {
            "id": str(f.id), "finding_type": f.finding_type, "severity": f.severity,
            "description": f.description, "recommendation": f.recommendation,
        }
        for f in findings
    ]
    return format_access_findings(f_dicts)


async def _handle_connector_status(db: AsyncSession, org_id, parsed) -> dict:
    result = await db.execute(
        select(Connector).where(Connector.org_id == org_id)
    )
    connectors = result.scalars().all()
    c_dicts = [
        {
            "name": c.name, "connector_type": c.connector_type, "status": c.status,
            "last_sync_at": str(c.last_sync_at) if c.last_sync_at else None,
            "last_error": c.last_error,
        }
        for c in connectors
    ]
    return format_connector_status(c_dicts)


async def _handle_scan_status(db: AsyncSession, org_id, parsed) -> dict:
    result = await db.execute(
        select(ScanJob)
        .where(ScanJob.org_id == org_id)
        .order_by(ScanJob.created_at.desc())
        .limit(10)
    )
    scans = result.scalars().all()
    if not scans:
        return {"narrative": "No scans have been run yet. Configure a connector and trigger a scan."}

    latest = scans[0]
    by_status: dict[str, int] = {}
    for s in scans:
        by_status[s.status] = by_status.get(s.status, 0) + 1

    return {
        "narrative": (
            f"Latest scan: **{latest.status}** ({latest.scan_type}) — "
            f"{latest.progress_percent}% complete, "
            f"{latest.scanned_objects}/{latest.total_objects} objects scanned. "
            f"Last 10 scans: {', '.join(f'{k}: {v}' for k, v in by_status.items())}."
        ),
        "latest_scan": {
            "id": str(latest.id),
            "status": latest.status,
            "type": latest.scan_type,
            "progress": latest.progress_percent,
            "scanned": latest.scanned_objects,
            "total": latest.total_objects,
            "started": str(latest.started_at) if latest.started_at else None,
        },
        "recent_scans_by_status": by_status,
    }


async def _handle_classification_summary(db: AsyncSession, org_id, parsed) -> dict:
    """Summarize classification results across all assets."""
    # Get sensitive data distribution by asset type
    q = await db.execute(
        select(
            Asset.asset_type,
            func.count(Asset.id),
            func.sum(Asset.sensitive_data_count),
        )
        .where(Asset.org_id == org_id, Asset.sensitive_data_count > 0)
        .group_by(Asset.asset_type)
    )
    rows = q.fetchall()
    if not rows:
        return {"narrative": "No classified data found. Run a scan with classification enabled."}

    total_assets = sum(r[1] for r in rows)
    total_elements = sum(r[2] or 0 for r in rows)
    by_type = {r[0]: {"assets": r[1], "sensitive_elements": r[2] or 0} for r in rows}

    return {
        "narrative": (
            f"Classification found **{total_elements:,}** sensitive data elements "
            f"across **{total_assets}** assets. "
            f"Breakdown by type: {', '.join(f'{t}: {d['assets']} assets ({d['sensitive_elements']} elements)' for t, d in by_type.items())}."
        ),
        "total_sensitive_assets": total_assets,
        "total_sensitive_elements": total_elements,
        "by_asset_type": by_type,
    }


async def _handle_generate_report(db: AsyncSession, org_id, parsed) -> dict:
    """Guide the user to generate a report."""
    fmt = parsed.entities.report_format or "pdf"
    return {
        "narrative": (
            f"To generate a report in **{fmt.upper()}** format, use the Reports page or the API: "
            f"`POST /api/v1/reports/` with type and format. "
            "Available report types: asset_inventory, compliance, exposure, "
            "sensitive_data_location, access_exposure, remediation_progress, audit_trail."
        ),
        "report_format": fmt,
        "available_types": [
            "asset_inventory", "compliance", "exposure",
            "sensitive_data_location", "access_exposure",
            "remediation_progress", "audit_trail",
        ],
    }


async def _handle_unknown(db, org_id, parsed) -> dict:
    return format_unknown_query(parsed.original_query)


# ---------------------------------------------------------------------------
# Intent → handler mapping
# ---------------------------------------------------------------------------

_INTENT_HANDLERS = {
    QueryIntent.EXECUTIVE_SUMMARY: _handle_executive_summary,
    QueryIntent.RISK_SUMMARY: _handle_risk_summary,
    QueryIntent.RISK_TREND: _handle_risk_trend,
    QueryIntent.TOTAL_ASSETS: _handle_total_assets,
    QueryIntent.SENSITIVE_ASSETS: _handle_sensitive_assets,
    QueryIntent.EXPOSED_ASSETS: _handle_exposed_assets,
    QueryIntent.STALE_ASSETS: _handle_stale_assets,
    QueryIntent.SHADOW_ASSETS: _handle_shadow_assets,
    QueryIntent.UNOWNED_ASSETS: _handle_unowned_assets,
    QueryIntent.ASSET_DETAILS: _handle_asset_details,
    QueryIntent.OPEN_ALERTS: _handle_open_alerts,
    QueryIntent.CRITICAL_ALERTS: _handle_critical_alerts,
    QueryIntent.ALERT_SUMMARY: _handle_alert_summary,
    QueryIntent.ALERTS_BY_TYPE: _handle_alerts_by_type,
    QueryIntent.COMPLIANCE_COVERAGE: _handle_compliance_coverage,
    QueryIntent.POLICY_VIOLATIONS: _handle_policy_violations,
    QueryIntent.FRAMEWORK_STATUS: _handle_framework_status,
    QueryIntent.ACCESS_FINDINGS: _handle_access_findings,
    QueryIntent.EXCESSIVE_ACCESS: _handle_excessive_access,
    QueryIntent.PUBLIC_ACCESS: _handle_public_access,
    QueryIntent.CONNECTOR_STATUS: _handle_connector_status,
    QueryIntent.SCAN_STATUS: _handle_scan_status,
    QueryIntent.GENERATE_REPORT: _handle_generate_report,
    QueryIntent.CLASSIFICATION_SUMMARY: _handle_classification_summary,
    QueryIntent.UNKNOWN: _handle_unknown,
}
