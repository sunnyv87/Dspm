"""
AI-powered natural language query engine for CISO reporting.

All processing runs locally — no data leaves the infrastructure.
Uses rule-based NLP intent classification and entity extraction
to translate natural language into internal API calls.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ---------------------------------------------------------------------------
# Intent taxonomy — every question a CISO might ask
# ---------------------------------------------------------------------------

class QueryIntent(str, Enum):
    # Executive overview
    EXECUTIVE_SUMMARY = "executive_summary"
    RISK_SUMMARY = "risk_summary"
    RISK_TREND = "risk_trend"

    # Asset posture
    TOTAL_ASSETS = "total_assets"
    SENSITIVE_ASSETS = "sensitive_assets"
    EXPOSED_ASSETS = "exposed_assets"
    STALE_ASSETS = "stale_assets"
    SHADOW_ASSETS = "shadow_assets"
    UNOWNED_ASSETS = "unowned_assets"
    ASSET_DETAILS = "asset_details"

    # Alerts & incidents
    OPEN_ALERTS = "open_alerts"
    CRITICAL_ALERTS = "critical_alerts"
    ALERT_SUMMARY = "alert_summary"
    ALERTS_BY_TYPE = "alerts_by_type"

    # Compliance
    COMPLIANCE_COVERAGE = "compliance_coverage"
    POLICY_VIOLATIONS = "policy_violations"
    FRAMEWORK_STATUS = "framework_status"

    # Identity & access
    ACCESS_FINDINGS = "access_findings"
    EXCESSIVE_ACCESS = "excessive_access"
    PUBLIC_ACCESS = "public_access"

    # Connectors & scans
    CONNECTOR_STATUS = "connector_status"
    SCAN_STATUS = "scan_status"

    # Reports
    GENERATE_REPORT = "generate_report"

    # Classification
    CLASSIFICATION_SUMMARY = "classification_summary"

    # Fallback
    UNKNOWN = "unknown"


# ---------------------------------------------------------------------------
# Entity extraction
# ---------------------------------------------------------------------------

@dataclass
class QueryEntities:
    """Entities extracted from a natural language query."""
    severity: str | None = None
    status: str | None = None
    asset_name: str | None = None
    asset_type: str | None = None
    framework: str | None = None
    region: str | None = None
    environment: str | None = None
    time_range: str | None = None
    limit: int | None = None
    report_format: str | None = None


# ---------------------------------------------------------------------------
# Parsed query result
# ---------------------------------------------------------------------------

@dataclass
class ParsedQuery:
    """The fully parsed representation of a natural language CISO query."""
    original_query: str
    intent: QueryIntent
    entities: QueryEntities = field(default_factory=QueryEntities)
    confidence: float = 0.0


# ---------------------------------------------------------------------------
# Intent patterns — ordered by specificity (most specific first)
# ---------------------------------------------------------------------------

_INTENT_PATTERNS: list[tuple[QueryIntent, list[str], float]] = [
    # Executive / risk
    (QueryIntent.EXECUTIVE_SUMMARY, [
        r"executive\s+summary",
        r"overall\s+(security\s+)?posture",
        r"(give|show|get)\s+me\s+(an?\s+)?overview",
        r"(security\s+)?dashboard\s+summary",
        r"what.s\s+(the\s+)?(current\s+)?state\s+of",
        r"(high[- ]?level|board[- ]?level)\s+(summary|report|view)",
        r"ciso\s+(report|brief|summary|dashboard)",
        r"how\s+(are|is)\s+(we|our\s+org)",
    ], 0.90),

    (QueryIntent.RISK_TREND, [
        r"risk\s+trend",
        r"risk.*(over\s+time|trending|history|change|progress)",
        r"(how|has)\s+.*(risk|score).*(chang|improv|worsen|trend)",
        r"risk\s+(score\s+)?(week|month|quarter|year)",
        r"(are\s+we\s+)?(getting\s+)?(better|worse)",
    ], 0.88),

    (QueryIntent.RISK_SUMMARY, [
        r"risk\s+(summary|overview|score|level|posture|distribution)",
        r"(what|how).*(risk|score)",
        r"(overall|org|organization)\s+risk",
        r"how\s+risky",
    ], 0.85),

    # Alerts — specific before general
    (QueryIntent.CRITICAL_ALERTS, [
        r"critical\s+(alert|issue|incident|finding)",
        r"(urgent|p1|sev.?1|high.?priority)\s+(alert|issue|incident)",
        r"(what|any|how\s+many)\s+critical",
        r"top\s+priority\s+(alert|issue|incident)",
    ], 0.90),

    (QueryIntent.ALERTS_BY_TYPE, [
        r"alert.*by\s+(type|category)",
        r"(types?|categories?)\s+of\s+alert",
        r"(breakdown|distribution)\s+of\s+alert",
        r"what\s+kind\s+of\s+alert",
    ], 0.87),

    (QueryIntent.ALERT_SUMMARY, [
        r"alert\s+(summary|overview|stats|statistics|count|report)",
        r"(summarize|breakdown|overview).*(alert|incident)",
        r"alert.*(summary|overview|stat)",
    ], 0.85),

    (QueryIntent.OPEN_ALERTS, [
        r"open\s+alert",
        r"(unresolved|pending|active|outstanding)\s+(alert|incident|issue)",
        r"(show|list|get|how\s+many)\s+(all\s+)?(open\s+)?alert",
        r"alert.*(open|pending|active)",
    ], 0.82),

    # Assets — specific views
    (QueryIntent.EXPOSED_ASSETS, [
        r"(publicly?\s+)?(exposed|accessible|open)\s+(asset|data|bucket|database|store)",
        r"(public|external)\s+(exposure|access|data)",
        r"(what|which|any)\s+(data|asset).*(public|exposed|open)",
        r"who\s+can\s+access.*public",
        r"internet.*(facing|accessible|exposed)",
    ], 0.90),

    (QueryIntent.SENSITIVE_ASSETS, [
        r"sensitive\s+(asset|data|store|information)",
        r"(pii|phi|pci|confidential|restricted)\s+(data|asset|store)",
        r"(what|where|which|how\s+many)\s+.*sensitive",
        r"(aadhaar|pan|passport|credit\s+card|ssn)\s+(data|exposure)",
    ], 0.88),

    (QueryIntent.SHADOW_ASSETS, [
        r"shadow\s+(data|asset|it|store)",
        r"(unmanaged|untracked|unknown|rogue)\s+(data|asset|store)",
        r"(data|asset)\s+.*\b(shadow|unmanaged|rogue)\b",
    ], 0.88),

    (QueryIntent.STALE_ASSETS, [
        r"stale\s+(asset|data|store)",
        r"(unused|dormant|inactive|old)\s+(data|asset|store)",
        r"(data|asset)\s+.*not\s+(used|accessed)",
    ], 0.88),

    (QueryIntent.UNOWNED_ASSETS, [
        r"(unowned|orphan|no.?owner)\s+(asset|data|store)",
        r"(asset|data)\s+.*(no\s+owner|without\s+owner|unassigned)",
        r"who\s+owns",
    ], 0.85),

    (QueryIntent.ASSET_DETAILS, [
        r"(details?|info|information)\s+(about|for|on)\s+",
        r"(tell|show)\s+me\s+about\s+\w+",
        r"(what|describe)\s+.*(asset|bucket|database|table)\s+\w+",
    ], 0.80),

    (QueryIntent.TOTAL_ASSETS, [
        r"(total|all|how\s+many)\s+(asset|data\s+store|resource)",
        r"asset\s+(count|total|inventory|list)",
        r"(show|list)\s+all\s+asset",
    ], 0.80),

    # Compliance
    (QueryIntent.FRAMEWORK_STATUS, [
        r"(iso|soc|pci|gdpr|hipaa|dpdpa|rbi|sebi|irdai)\s*([\d]*)\s*(status|compliance|coverage|score|posture)",
        r"(status|compliance|coverage)\s+(of|for)\s+(iso|soc|pci|gdpr|hipaa|dpdpa|rbi|sebi|irdai)",
        r"(are|how)\s+.*(compliant|compliance).*(iso|soc|pci|gdpr|hipaa|dpdpa|rbi|sebi|irdai)",
    ], 0.90),

    (QueryIntent.POLICY_VIOLATIONS, [
        r"(policy\s+)?violation",
        r"(non[- ]?complian|breach|infraction)",
        r"(what|how\s+many|list)\s+.*(violation|breach|non[- ]?complian)",
    ], 0.85),

    (QueryIntent.COMPLIANCE_COVERAGE, [
        r"compliance\s+(coverage|status|posture|summary|report|overview)",
        r"(how|what)\s+.*(compliance|compliant|regulatory)",
        r"(regulatory|audit)\s+(readiness|status|posture)",
    ], 0.83),

    # Identity & access
    (QueryIntent.EXCESSIVE_ACCESS, [
        r"(excessive|over[- ]?provision|over[- ]?permiss|too\s+many)\s+(access|permission|privilege)",
        r"(who|which)\s+.*too\s+much\s+(access|permission)",
        r"(privilege|permission)\s+(creep|bloat|excess)",
        r"least\s+privilege\s+violation",
    ], 0.88),

    (QueryIntent.PUBLIC_ACCESS, [
        r"public\s+access\s+(finding|issue|problem)",
        r"anonymous\s+(access|link|share)",
    ], 0.87),

    (QueryIntent.ACCESS_FINDINGS, [
        r"access\s+(finding|issue|anomal|risk|problem|concern)",
        r"(identity|iam|access)\s+(analysis|review|audit|finding)",
        r"(stale|orphan|toxic)\s+access",
        r"who\s+has\s+access\s+to",
    ], 0.83),

    # Connectors & scans
    (QueryIntent.CONNECTOR_STATUS, [
        r"connector\s+(status|health|state)",
        r"(data\s+source|integration|connection)\s+(status|health)",
        r"(which|any|how\s+many)\s+connector.*(fail|error|down|issue)",
        r"(are\s+)?all\s+connector.*(healthy|connected|working)",
    ], 0.85),

    (QueryIntent.SCAN_STATUS, [
        r"scan\s+(status|progress|result|history)",
        r"(last|latest|recent)\s+scan",
        r"(when|what)\s+.*(last\s+)?scan",
        r"(running|pending|failed)\s+scan",
    ], 0.85),

    # Classification
    (QueryIntent.CLASSIFICATION_SUMMARY, [
        r"(data\s+)?classification\s+(summary|result|report|overview)",
        r"(what|which)\s+(types?\s+of\s+)?(sensitive\s+)?data\s+.*(found|detected|classified)",
        r"(pii|phi|financial|credential|secret)\s+detection",
    ], 0.85),

    # Reports
    (QueryIntent.GENERATE_REPORT, [
        r"(generate|create|build|produce|export)\s+(a\s+)?report",
        r"(download|export)\s+.*(pdf|csv|excel|xlsx|json)",
        r"report\s+.*(generate|create|export|download)",
    ], 0.88),
]


# ---------------------------------------------------------------------------
# Entity extraction patterns
# ---------------------------------------------------------------------------

_SEVERITY_MAP = {
    "critical": "critical", "crit": "critical", "p1": "critical", "sev1": "critical",
    "high": "high", "p2": "high", "sev2": "high",
    "medium": "medium", "med": "medium", "p3": "medium", "moderate": "medium",
    "low": "low", "p4": "low", "minor": "low",
    "info": "info", "informational": "info",
}

_STATUS_MAP = {
    "open": "open", "new": "open", "unresolved": "open",
    "in_progress": "in_progress", "in progress": "in_progress",
    "working": "in_progress", "investigating": "in_progress",
    "resolved": "resolved", "fixed": "resolved", "closed": "resolved",
    "accepted": "accepted_risk", "risk accepted": "accepted_risk",
    "suppressed": "suppressed", "muted": "suppressed",
}

_FRAMEWORK_MAP = {
    "iso": "ISO_27001", "iso27001": "ISO_27001", "iso 27001": "ISO_27001",
    "soc": "SOC2", "soc2": "SOC2", "soc 2": "SOC2",
    "pci": "PCI_DSS", "pcidss": "PCI_DSS", "pci dss": "PCI_DSS", "pci-dss": "PCI_DSS",
    "gdpr": "GDPR",
    "hipaa": "HIPAA",
    "dpdpa": "DPDPA",
    "rbi": "RBI",
    "sebi": "SEBI",
    "irdai": "IRDAI",
}

_ENVIRONMENT_MAP = {
    "prod": "production", "production": "production",
    "staging": "staging", "stg": "staging",
    "dev": "development", "development": "development",
    "test": "test", "testing": "test", "qa": "test",
}

_REPORT_FORMAT_MAP = {
    "pdf": "pdf", "csv": "csv", "excel": "xlsx", "xlsx": "xlsx", "json": "json",
}

_TIME_RANGE_PATTERNS = [
    (r"(last|past)\s+(\d+)\s+(day|week|month|quarter|year)s?", None),
    (r"(this|current)\s+(week|month|quarter|year)", None),
    (r"(today|yesterday|last\s+week|last\s+month)", None),
    (r"(\d{4}-\d{2}-\d{2})", None),
]

_ASSET_TYPE_MAP = {
    "bucket": "bucket", "s3": "bucket", "blob": "bucket", "gcs": "bucket",
    "database": "database", "db": "database", "rds": "database",
    "table": "table",
    "file": "file", "document": "file",
    "schema": "schema",
    "collection": "collection",
}


def _extract_entities(query: str) -> QueryEntities:
    """Extract structured entities from a natural language query."""
    q = query.lower()
    entities = QueryEntities()

    # Severity
    for keyword, value in _SEVERITY_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.severity = value
            break

    # Status
    for keyword, value in _STATUS_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.status = value
            break

    # Framework
    for keyword, value in _FRAMEWORK_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.framework = value
            break

    # Environment
    for keyword, value in _ENVIRONMENT_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.environment = value
            break

    # Region
    region_match = re.search(r"\b(us|eu|ap|in|india|us-east|us-west|eu-west|ap-south|ap-southeast)\b", q)
    if region_match:
        entities.region = region_match.group(1)

    # Report format
    for keyword, value in _REPORT_FORMAT_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.report_format = value
            break

    # Time range
    for pattern, _ in _TIME_RANGE_PATTERNS:
        m = re.search(pattern, q)
        if m:
            entities.time_range = m.group(0)
            break

    # Limit
    limit_match = re.search(r"\b(top|first|show)\s+(\d+)\b", q)
    if limit_match:
        entities.limit = int(limit_match.group(2))

    # Asset type
    for keyword, value in _ASSET_TYPE_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", q):
            entities.asset_type = value
            break

    return entities


# ---------------------------------------------------------------------------
# Intent classifier
# ---------------------------------------------------------------------------

def parse_query(query: str) -> ParsedQuery:
    """
    Parse a natural language CISO query into intent + entities.

    Runs entirely in-process — no external API calls, no data leaves the host.
    """
    q = query.strip().lower()

    best_intent = QueryIntent.UNKNOWN
    best_confidence = 0.0

    for intent, patterns, base_confidence in _INTENT_PATTERNS:
        for pattern in patterns:
            if re.search(pattern, q, re.IGNORECASE):
                if base_confidence > best_confidence:
                    best_intent = intent
                    best_confidence = base_confidence
                break  # found a match for this intent, move on

    entities = _extract_entities(query)

    return ParsedQuery(
        original_query=query,
        intent=best_intent,
        entities=entities,
        confidence=best_confidence,
    )


# ---------------------------------------------------------------------------
# Response formatter — CISO-friendly natural language answers
# ---------------------------------------------------------------------------

def format_executive_summary(data: dict) -> dict[str, Any]:
    """Format executive summary data into a CISO-readable response."""
    total = data.get("total_assets_scanned", 0)
    sensitive = data.get("sensitive_assets_count", 0)
    critical = data.get("critical_risk_assets", 0)
    exposed = data.get("publicly_exposed_sensitive", 0)
    alerts = data.get("alerts_by_severity", {})
    top_stores = data.get("top_risky_stores", [])

    # Build narrative
    risk_level = "critical" if critical > 0 or exposed > 0 else "elevated" if sensitive > total * 0.3 else "moderate"
    narrative_parts = [
        f"Across {total:,} scanned data assets, {sensitive:,} contain sensitive data.",
    ]
    if critical > 0:
        narrative_parts.append(f"{critical:,} assets are at critical risk level and require immediate attention.")
    if exposed > 0:
        narrative_parts.append(f"**{exposed:,} sensitive assets are publicly exposed** — this is the highest priority to remediate.")
    if alerts:
        total_alerts = sum(alerts.values())
        critical_alerts = alerts.get("critical", 0) + alerts.get("CRITICAL", 0)
        narrative_parts.append(f"There are {total_alerts:,} open alerts ({critical_alerts} critical).")

    return {
        "narrative": " ".join(narrative_parts),
        "risk_level": risk_level,
        "metrics": {
            "total_assets": total,
            "sensitive_assets": sensitive,
            "critical_risk": critical,
            "publicly_exposed": exposed,
            "alerts_by_severity": alerts,
        },
        "top_risky_stores": top_stores[:10],
        "recommendations": _generate_recommendations(data),
    }


def format_risk_summary(data: dict) -> dict[str, Any]:
    """Format risk summary into CISO narrative."""
    avg = data.get("average_risk_score", 0)
    total = data.get("total_scored_assets", 0)
    crit = data.get("critical_count", 0)
    high = data.get("high_count", 0)
    med = data.get("medium_count", 0)
    low = data.get("low_count", 0)

    if avg >= 70:
        posture = "poor"
        action = "Immediate action is required to reduce exposure."
    elif avg >= 50:
        posture = "concerning"
        action = "Prioritize remediation of critical and high-risk assets."
    elif avg >= 30:
        posture = "moderate"
        action = "Continue monitoring and address high-risk items."
    else:
        posture = "healthy"
        action = "Maintain current security controls and monitoring."

    return {
        "narrative": (
            f"The organization's risk posture is **{posture}** with an average score of {avg:.1f}/100 "
            f"across {total:,} assets. {crit:,} critical, {high:,} high, {med:,} medium, {low:,} low. "
            f"{action}"
        ),
        "risk_level": posture,
        "distribution": {
            "critical": crit, "high": high, "medium": med, "low": low,
        },
        "average_score": avg,
    }


def format_alert_list(alerts: list[dict], query_context: str = "") -> dict[str, Any]:
    """Format alerts into a CISO-friendly summary with actionable detail."""
    if not alerts:
        return {
            "narrative": "No alerts match your query. All clear.",
            "count": 0,
            "alerts": [],
        }

    by_severity: dict[str, int] = {}
    for a in alerts:
        sev = a.get("severity", "unknown").lower()
        by_severity[sev] = by_severity.get(sev, 0) + 1

    crit = by_severity.get("critical", 0)
    high = by_severity.get("high", 0)

    narrative = f"Found {len(alerts)} alert(s)"
    if crit > 0:
        narrative += f" — **{crit} critical** requiring immediate action"
    if high > 0:
        narrative += f", {high} high priority"
    narrative += "."

    return {
        "narrative": narrative,
        "count": len(alerts),
        "by_severity": by_severity,
        "alerts": [
            {
                "id": a.get("id"),
                "title": a.get("title"),
                "severity": a.get("severity"),
                "status": a.get("status"),
                "asset": a.get("asset_id"),
                "remediation": a.get("remediation_recommendation"),
                "created": a.get("created_at"),
            }
            for a in alerts[:20]  # cap at 20 for readability
        ],
    }


def format_asset_list(assets: list[dict], category: str = "matching") -> dict[str, Any]:
    """Format asset list into CISO summary."""
    if not assets:
        return {
            "narrative": f"No {category} assets found.",
            "count": 0,
            "assets": [],
        }

    total_sensitive = sum(a.get("sensitive_data_count", 0) for a in assets)
    high_risk = sum(1 for a in assets if (a.get("risk_score") or 0) >= 80)

    narrative = (
        f"Found {len(assets)} {category} asset(s) containing {total_sensitive:,} sensitive data elements. "
    )
    if high_risk > 0:
        narrative += f"**{high_risk}** are at critical risk level."

    return {
        "narrative": narrative,
        "count": len(assets),
        "total_sensitive_elements": total_sensitive,
        "high_risk_count": high_risk,
        "assets": [
            {
                "name": a.get("name"),
                "type": a.get("asset_type"),
                "risk_score": a.get("risk_score"),
                "sensitive_count": a.get("sensitive_data_count"),
                "exposure": a.get("exposure_status"),
                "region": a.get("geo_region"),
                "owner": a.get("business_owner"),
            }
            for a in assets[:25]
        ],
    }


def format_compliance_coverage(data: dict) -> dict[str, Any]:
    """Format compliance coverage into CISO summary."""
    frameworks = data.get("frameworks", [])
    if not frameworks:
        return {
            "narrative": "No compliance frameworks are currently configured.",
            "frameworks": [],
        }

    parts = []
    critical_gaps = []
    for fw in frameworks:
        name = fw.get("name", fw.get("framework_type", "Unknown"))
        coverage = fw.get("coverage_percent", 0)
        violations = fw.get("violation_count", 0)
        parts.append(f"{name}: {coverage}% ({violations} violations)")
        if coverage < 70:
            critical_gaps.append(name)

    narrative = "Compliance coverage: " + " | ".join(parts) + "."
    if critical_gaps:
        narrative += f" **Critical gaps** in: {', '.join(critical_gaps)} — prioritize remediation."

    return {
        "narrative": narrative,
        "frameworks": frameworks,
        "critical_gaps": critical_gaps,
    }


def format_violations(violations: list[dict]) -> dict[str, Any]:
    """Format policy violations into a CISO summary."""
    if not violations:
        return {"narrative": "No policy violations found.", "count": 0, "violations": []}

    by_severity: dict[str, int] = {}
    for v in violations:
        sev = v.get("severity", "unknown").lower()
        by_severity[sev] = by_severity.get(sev, 0) + 1

    crit = by_severity.get("critical", 0)
    narrative = f"Found {len(violations)} policy violation(s)."
    if crit > 0:
        narrative += f" **{crit} critical violations** require immediate action."

    return {
        "narrative": narrative,
        "count": len(violations),
        "by_severity": by_severity,
        "violations": [
            {
                "id": v.get("id"),
                "severity": v.get("severity"),
                "status": v.get("status"),
                "description": v.get("description"),
                "asset_id": v.get("asset_id"),
                "detected_at": v.get("detected_at"),
            }
            for v in violations[:20]
        ],
    }


def format_access_findings(findings: list[dict]) -> dict[str, Any]:
    """Format identity/access findings into CISO summary."""
    if not findings:
        return {"narrative": "No access findings detected. IAM posture looks clean.", "count": 0, "findings": []}

    by_type: dict[str, int] = {}
    for f in findings:
        ft = f.get("finding_type", "unknown")
        by_type[ft] = by_type.get(ft, 0) + 1

    narrative = f"Found {len(findings)} access finding(s). "
    if "PUBLIC_ACCESS" in by_type:
        narrative += f"**{by_type['PUBLIC_ACCESS']} public access issues.** "
    if "OVERLY_PERMISSIVE" in by_type:
        narrative += f"{by_type['OVERLY_PERMISSIVE']} overly-permissive accounts. "
    if "TOXIC_COMBINATION" in by_type:
        narrative += f"**{by_type['TOXIC_COMBINATION']} toxic permission combinations detected.** "

    return {
        "narrative": narrative.strip(),
        "count": len(findings),
        "by_type": by_type,
        "findings": [
            {
                "id": f.get("id"),
                "type": f.get("finding_type"),
                "severity": f.get("severity"),
                "description": f.get("description"),
                "recommendation": f.get("recommendation"),
            }
            for f in findings[:20]
        ],
    }


def format_connector_status(connectors: list[dict]) -> dict[str, Any]:
    """Format connector health into CISO summary."""
    if not connectors:
        return {"narrative": "No data source connectors configured.", "count": 0, "connectors": []}

    by_status: dict[str, int] = {}
    for c in connectors:
        s = c.get("status", "unknown")
        by_status[s] = by_status.get(s, 0) + 1

    failed = by_status.get("failed", 0)
    connected = by_status.get("connected", 0)
    total = len(connectors)

    if failed > 0:
        narrative = f"**{failed} of {total} connectors have failed** and need attention. {connected} are healthy."
    else:
        narrative = f"All {total} connectors are healthy."

    return {
        "narrative": narrative,
        "count": total,
        "by_status": by_status,
        "connectors": [
            {
                "name": c.get("name"),
                "type": c.get("connector_type"),
                "status": c.get("status"),
                "last_sync": c.get("last_sync_at"),
                "error": c.get("last_error"),
            }
            for c in connectors
        ],
    }


def format_unknown_query(query: str) -> dict[str, Any]:
    """Provide helpful guidance when intent is not recognized."""
    return {
        "narrative": (
            "I couldn't determine the exact intent of your query. "
            "Here are some examples of questions I can answer:"
        ),
        "suggestions": [
            "What is our overall security posture?",
            "Show me all critical alerts",
            "How many sensitive assets are publicly exposed?",
            "What is our GDPR compliance coverage?",
            "Are there any excessive access findings?",
            "Show me the risk trend for the last 30 days",
            "Which connectors are failing?",
            "List all policy violations",
            "What shadow data do we have?",
            "Generate an executive summary report as PDF",
        ],
    }


# ---------------------------------------------------------------------------
# Recommendation engine
# ---------------------------------------------------------------------------

def _generate_recommendations(data: dict) -> list[str]:
    """Generate prioritized remediation recommendations from executive data."""
    recs: list[str] = []
    exposed = data.get("publicly_exposed_sensitive", 0)
    critical = data.get("critical_risk_assets", 0)
    alerts = data.get("alerts_by_severity", {})
    crit_alerts = alerts.get("critical", 0) + alerts.get("CRITICAL", 0)

    if exposed > 0:
        recs.append(f"URGENT: Revoke public access on {exposed} exposed sensitive asset(s) immediately.")
    if crit_alerts > 0:
        recs.append(f"Address {crit_alerts} critical alert(s) within the next 24 hours.")
    if critical > 0:
        recs.append(f"Review and remediate {critical} critical-risk asset(s) — focus on encryption and access controls.")

    top_stores = data.get("top_risky_stores", [])
    if top_stores:
        top = top_stores[0]
        recs.append(f"Highest risk: '{top.get('name', 'Unknown')}' (score {top.get('risk_score', 'N/A')}) — investigate and apply controls.")

    if not recs:
        recs.append("Continue monitoring. No urgent actions required at this time.")

    return recs


# ---------------------------------------------------------------------------
# Suggested follow-up queries based on context
# ---------------------------------------------------------------------------

_FOLLOW_UPS: dict[QueryIntent, list[str]] = {
    QueryIntent.EXECUTIVE_SUMMARY: [
        "Show me all critical alerts",
        "Which assets are publicly exposed?",
        "What is the risk trend this month?",
    ],
    QueryIntent.RISK_SUMMARY: [
        "Which assets are at critical risk?",
        "Show me the risk trend over time",
        "What are the top policy violations?",
    ],
    QueryIntent.OPEN_ALERTS: [
        "Show me only critical alerts",
        "What is our compliance coverage?",
        "Any excessive access findings?",
    ],
    QueryIntent.CRITICAL_ALERTS: [
        "Show all open alerts",
        "Which assets are publicly exposed?",
        "What remediations are in progress?",
    ],
    QueryIntent.EXPOSED_ASSETS: [
        "Show me all critical alerts",
        "What is our overall risk posture?",
        "Any public access findings?",
    ],
    QueryIntent.SENSITIVE_ASSETS: [
        "Which of these are publicly exposed?",
        "Show classification breakdown",
        "What is the risk trend?",
    ],
    QueryIntent.COMPLIANCE_COVERAGE: [
        "Show all policy violations",
        "What are the critical compliance gaps?",
        "Generate a compliance report",
    ],
    QueryIntent.POLICY_VIOLATIONS: [
        "Show compliance coverage",
        "Which assets have critical violations?",
        "Show risk summary",
    ],
    QueryIntent.ACCESS_FINDINGS: [
        "Show excessive access findings",
        "Which sensitive assets are publicly accessible?",
        "Show risk summary",
    ],
    QueryIntent.CONNECTOR_STATUS: [
        "When was the last scan?",
        "Show executive summary",
        "Any new sensitive assets discovered?",
    ],
}


def get_follow_up_suggestions(intent: QueryIntent) -> list[str]:
    """Return contextual follow-up query suggestions."""
    return _FOLLOW_UPS.get(intent, [
        "What is our overall security posture?",
        "Show me critical alerts",
        "What is our compliance status?",
    ])
