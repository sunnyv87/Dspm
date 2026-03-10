# TechD Platform — Unified User Guide

> **Version:** 3.0 | **Last Updated:** March 2026
>
> A complete guide to using the TechD Platform — the unified Data Security Posture Management (DSPM) and Privacy Operations (PrivacyOps) dashboard. Covers data security, privacy compliance, consent management, breach monitoring, vendor risk, data subject rights, and executive reporting.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Unified Dashboard](#2-unified-dashboard)
3. [Connectors](#3-connectors)
4. [Asset Inventory](#4-asset-inventory)
5. [Alerts & Workflow](#5-alerts--workflow)
6. [Compliance](#6-compliance)
7. [Scans & Discovery](#7-scans--discovery)
8. [Classification](#8-classification)
9. [Identity & Access](#9-identity--access)
10. [Consent Management](#10-consent-management)
11. [Data Subject Rights (DSAR)](#11-data-subject-rights-dsar)
12. [Breach Monitoring](#12-breach-monitoring)
13. [Vendor Risk Management](#13-vendor-risk-management)
14. [Data Retention](#14-data-retention)
15. [Workflows & Approvals](#15-workflows--approvals)
16. [Audit Trail](#16-audit-trail)
17. [Risk Management](#17-risk-management)
18. [Reports](#18-reports)
19. [AI Security Assistant](#19-ai-security-assistant)
20. [Administration](#20-administration)
21. [Keyboard Shortcuts & Tips](#21-keyboard-shortcuts--tips)
22. [Troubleshooting](#22-troubleshooting)
23. [Appendix A: Connector Configuration Reference](#appendix-a-connector-configuration-reference)

---

## 1. Getting Started

### 1.1 Accessing the Platform

Open your browser and navigate to the TechD Platform URL provided by your administrator (e.g., `https://platform.yourcompany.com`). The platform supports Chrome 90+, Firefox 90+, Edge 90+, and Safari 15+.

### 1.2 Logging In

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│          ┌──────────────────────────────┐             │
│          │                              │             │
│          │      TechD Platform          │             │
│          │   DSPM & PrivacyOps          │             │
│          │                              │             │
│          │  ┌──────────────────────┐    │             │
│          │  │ Email                │    │             │
│          │  │ user@company.com     │    │             │
│          │  └──────────────────────┘    │             │
│          │                              │             │
│          │  ┌──────────────────────┐    │             │
│          │  │ Password             │    │             │
│          │  │ ••••••••••••         │    │             │
│          │  └──────────────────────┘    │             │
│          │                              │             │
│          │  ┌──────────────────────┐    │             │
│          │  │      Sign In         │    │             │
│          │  └──────────────────────┘    │             │
│          │                              │             │
│          │  Need an account? Register   │             │
│          │                              │             │
│          └──────────────────────────────┘             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Steps:**

1. Enter your **email address** in the Email field.
2. Enter your **password** (minimum 12 characters, must include uppercase, lowercase, digit, and special character).
3. Click **Sign In**.
4. Upon successful authentication, you are redirected to the Unified Dashboard.

> **Note:** After 3 failed login attempts within 60 seconds, your IP is temporarily rate-limited. Wait 60 seconds before retrying.

### 1.3 Creating an Account

If public registration is enabled by your administrator:

1. Click **Register** at the bottom of the login form.
2. Enter your email and a strong password (12+ characters).
3. Click **Create Account**.
4. New accounts are assigned the **Read Only** role by default. Contact your administrator for elevated permissions.

### 1.4 Understanding the Interface

The platform uses a single unified sidebar with sections grouping all DSPM and PrivacyOps modules.

```
┌─────────────────┬──────────────────────────────────────────────┐
│                 │                                              │
│  TechD Platform │            Content Area                      │
│  DSPM+PrivacyOps│                                              │
│  ──────────     │  Displays the active page content            │
│                 │                                              │
│  OVERVIEW       │                                              │
│  ◉ Dashboard    │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│                 │  │ Assets   │ │ Comp: 78%│ │ Breaches │    │
│  DATA SECURITY  │  │  1,247   │ │          │ │    2     │    │
│  ○ Connectors   │  └──────────┘ └──────────┘ └──────────┘    │
│  ○ Assets       │                                              │
│  ○ Alerts       │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  ○ Compliance   │  │ Consents │ │ DSARs    │ │ Vendors  │    │
│                 │  │  8,432   │ │    5     │ │    3 HR  │    │
│  PRIVACY OPS    │  └──────────┘ └──────────┘ └──────────┘    │
│  ○ Consent      │                                              │
│  ○ DSAR         │                                              │
│  ○ Breach       │                                              │
│  ○ Vendor Risk  │                                              │
│  ○ Retention    │                                              │
│  ○ Workflows    │                                              │
│  ○ Audit Trail  │                                              │
│                 │                                              │
│  INTELLIGENCE   │                                              │
│  ○ AI Assistant │                                              │
│                 │                                              │
│  [Sign Out]     │                                              │
└─────────────────┴──────────────────────────────────────────────┘
```

**Sidebar Sections:**

| Section | Pages | Description |
|---------|-------|-------------|
| **Overview** | Unified Dashboard | Combined executive view of DSPM and PrivacyOps metrics |
| **Data Security (DSPM)** | Connectors, Asset Inventory, Alerts, Compliance | Data discovery, classification, risk, and security posture |
| **Privacy Operations** | Consent, DSAR, Breach, Vendor Risk, Retention, Workflows, Audit Trail | Privacy compliance, consent management, breach response, vendor risk |
| **Intelligence** | AI Assistant | Natural language query interface for security and privacy posture |

Click any item to navigate. The active page is highlighted. Click **Sign Out** at the bottom to end your session.

---

## 2. Unified Dashboard

The Unified Dashboard provides an executive-level view combining data security posture and privacy operations metrics in a single view.

### 2.1 DSPM Metrics

Four stat cards display data security posture at the top:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ▌ Total Assets  │  │ ▌ Sensitive     │  │ ▌ Critical Risk │  │ ▌ Publicly      │
│ ▌ Scanned       │  │ ▌ Assets        │  │ ▌ Assets        │  │ ▌ Exposed       │
│ ▌   1,247       │  │ ▌     342       │  │ ▌      28       │  │ ▌      12       │
│ ▌ (blue)        │  │ ▌ (yellow)      │  │ ▌ (red)         │  │ ▌ (red)         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

| Metric | Description |
|--------|-------------|
| **Total Assets Scanned** | Number of data stores discovered across all connectors |
| **Sensitive Assets** | Assets containing at least one sensitive data element |
| **Critical Risk Assets** | Assets with a risk score of 80 or above (out of 100) |
| **Publicly Exposed** | Sensitive assets that are publicly accessible |

### 2.2 Privacy Operations Metrics

Below the DSPM metrics, privacy operations stats are displayed:

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ▌ Compliance    │  │ ▌ Active        │  │ ▌ Pending       │  │ ▌ Open          │
│ ▌ Score         │  │ ▌ Consents      │  │ ▌ DSARs         │  │ ▌ Breaches      │
│ ▌   78%         │  │ ▌   7,891       │  │ ▌      5        │  │ ▌      2        │
│ ▌ 3 gaps        │  │ ▌ 541 expired   │  │ ▌ 12 total      │  │ ▌ 5 total       │
│ ▌ (green)       │  │ ▌ (blue)        │  │ ▌ (yellow)      │  │ ▌ (red)         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ▌ High-Risk     │  │ ▌ Privacy Risk  │  │ ▌ Retention     │  │ ▌ Data          │
│ ▌ Vendors       │  │ ▌ Score         │  │ ▌ Overdue       │  │ ▌ Assets        │
│ ▌      3        │  │ ▌     45        │  │ ▌      2        │  │ ▌   1,247       │
│ ▌ 24 total      │  │ ▌ 8 high risks  │  │ ▌ 5 expiring    │  │ ▌ 892 classified│
│ ▌ (red)         │  │ ▌ (yellow)      │  │ ▌ (red)         │  │ ▌ (blue)        │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 2.3 Risk Distribution

The DSPM Risk Distribution panel shows a breakdown of assets by risk level:

- **Critical** (red): Risk score 80–100 — requires immediate action
- **High** (orange): Risk score 60–79 — prioritize for remediation
- **Medium** (yellow): Risk score 40–59 — monitor and plan remediation
- **Low** (green): Risk score 0–39 — acceptable risk level

### 2.4 Privacy Operations Alerts

Cross-service alerts from PrivacyOps are shown with severity indicators:

- Open data breaches (critical)
- High privacy risks (high)
- High-risk vendors (high)
- Overdue retention policies (warning)
- Pending DSR requests (warning)
- Compliance gaps (warning)

### 2.5 Top Risky Data Stores

The top 10 riskiest assets with visual risk bars and color-coded scores (red ≥ 80, orange 60–79, yellow < 60).

---

## 3. Connectors

Connectors link the platform to your data sources — cloud storage, databases, SaaS applications, and more.

### 3.1 Viewing Connectors

Navigate to **Connectors** under Data Security in the sidebar.

```
┌──────────────────────────────────────────────────────────────┐
│  Connectors                              [+ Add Connector]  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ AWS S3 Prod      │  │ PostgreSQL Main  │  │ M365 Corp  │ │
│  │ ● Connected      │  │ ● Connected      │  │ ○ Failed   │ │
│  │ Type: aws_s3     │  │ Type: postgresql │  │ Type: m365 │ │
│  │ Last sync:       │  │ Last sync:       │  │ Last sync: │ │
│  │ 2026-03-10 08:30 │  │ 2026-03-09 22:00 │  │ Never      │ │
│  │ [Scan Now]       │  │ [Scan Now]       │  │ [Scan Now] │ │
│  │ [Configure]      │  │ [Configure]      │  │ [Configure]│ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Status badges:**

| Badge | Color | Meaning |
|-------|-------|---------|
| `Connected` | Green | Active and healthy |
| `Failed` | Red | Connection error — check credentials |
| `Partial Access` | Yellow | Connected but missing some permissions |
| `Disabled` | Gray | Manually disabled |
| `Pending` | Blue | Awaiting first connection test |

### 3.2 Adding a Connector

1. Click **+ Add Connector**.
2. Select the connector type.
3. Fill in name, credentials, configuration (JSON), scan scope, and schedule (cron).
4. Click **Create Connector**.

> For a complete configuration reference for all **59 connector types**, see [Appendix A](#appendix-a-connector-configuration-reference).

### 3.3 Testing Connectivity

Before running a scan, verify the connection via **Configure → Test Connection**. The system validates credentials, network connectivity, and required permissions.

> **Security:** All credentials are encrypted at rest using Fernet symmetric encryption. SSRF protection blocks connections to internal/private IP ranges.

### 3.4 Running a Scan

Click **Scan Now** on any connector. The scan pipeline executes: Discovery → Classification → Risk Scoring → Policy Evaluation → Alert Generation.

### 3.5 Supported Data Sources

| Category | Data Sources |
|----------|-------------|
| **Cloud Storage** | AWS S3, Azure Blob, ADLS, GCS, OneDrive, SharePoint, Google Drive, Box, Dropbox, Egnyte |
| **Databases** | PostgreSQL, MySQL, MS SQL Server, Oracle, MariaDB, IBM Db2, MongoDB, Cassandra |
| **Data Warehouses** | Snowflake, BigQuery, Redshift, Azure Synapse, Databricks |
| **SaaS** | Microsoft 365, Teams, Google Workspace, Gmail, Slack, Jira, Confluence, Salesforce |
| **On-Prem** | HDFS, SMB/NFS shares, Local FS, On-Prem SharePoint |
| **Cloud Infra** | AWS IAM Role, Azure Subscription, GCP |
| **Identity** | Azure AD, AWS IAM, Google IAM, LDAP, AD, Okta, Ping Identity |
| **DevOps** | GitHub, GitLab, Bitbucket, Azure DevOps |
| **Security** | Forcepoint DLP, Splunk, IBM QRadar, SOAR, CASB |

---

## 4. Asset Inventory

### 4.1 Browsing Assets

Navigate to **Asset Inventory** under Data Security. Assets are displayed in a table with name, type, exposure status, sensitive data count, risk score, and region.

**Pre-filtered views:** All Assets | Sensitive | Exposed | Stale | Shadow | Unowned

### 4.2 Asset Details

Click any asset to view: classification summary, risk score breakdown, encryption status, owners, associated policy violations, and access permissions.

### 4.3 Managing Ownership

Assign business and technical owners to assets for accountability (requires admin or data owner role).

### 4.4 Tagging Assets

Add key-value metadata tags (e.g., `team: data-engineering`) for organization and filtering.

---

## 5. Alerts & Workflow

### 5.1 Viewing Alerts

Navigate to **Alerts** under Data Security. Filter by severity (Critical, High, Medium, Low) and status (Open, In Progress, Resolved, Accepted Risk).

**Alert types detected:**

| Alert Type | Description |
|------------|-------------|
| `PUBLIC_SENSITIVE_BUCKET` | Sensitive data in a publicly accessible bucket |
| `EXTERNAL_SHARED_CONFIDENTIAL` | Confidential data with external sharing enabled |
| `UNENCRYPTED_SENSITIVE_DB` | Sensitive database without encryption |
| `EXCESSIVE_ACCESS` | Too many users with privileged access |
| `SENSITIVE_IN_DEV` | Production sensitive data in non-production env |
| `RESIDENCY_VIOLATION` | Data stored outside allowed geographic region |
| `POLICY_VIOLATION` | Auto-generated from policy rule violations |

### 5.2 Managing Alert Lifecycle

1. **Update Status** — Move alerts through Open → In Progress → Resolved
2. **Assign** — Assign to a specific user for investigation
3. **Add Comment** — Add investigation notes
4. **Create Remediation Task** — Track remediation work with title, assignee, due date, and status

---

## 6. Compliance

The Compliance page monitors adherence to both data security and privacy regulatory frameworks.

### 6.1 DSPM Compliance

Navigate to **Compliance** under Data Security for security framework coverage:

| Framework | Description |
|-----------|-------------|
| ISO 27001 | Information security management |
| SOC 2 | Service organization controls |
| PCI DSS | Payment card industry |
| GDPR | EU data protection |
| HIPAA | US healthcare data |
| DPDPA | India Digital Personal Data Protection |

### 6.2 Privacy Compliance (ISO 27701 / GDPR / CCPA)

The PrivacyOps compliance module covers privacy-specific frameworks with AI-driven scanning:

| Framework | Controls | Description |
|-----------|----------|-------------|
| ISO 27701 | 63 | Privacy Information Management (PIMS) |
| GDPR | 25 | EU General Data Protection Regulation |
| CCPA | 14 | California Consumer Privacy Act |
| HIPAA | 20 | US healthcare privacy |

**Compliance scans** evaluate controls automatically and provide:
- Per-control pass/fail/partial results
- AI-generated remediation suggestions
- Cross-framework mapping (ISO 27701 → GDPR → CCPA)

### 6.3 Policy Violations

Active violations are listed with severity, status, and affected assets. **Approve exceptions** for accepted business risks with justification.

---

## 7. Scans & Discovery

### 7.1 Creating a Scan

| Type | Description | Best For |
|------|-------------|----------|
| `FULL` | Complete scan of all data | Initial setup, periodic deep scan |
| `INCREMENTAL` | Only changes since last sync | Daily scheduled scans |
| `METADATA_ONLY` | Schema and metadata only | Quick inventory refresh |
| `DEEP_CONTENT` | Full content analysis with sampling | Compliance audits |
| `SAMPLE_BASED` | Statistical sampling | Large data stores |

### 7.2 Monitoring Scan Progress

Track total objects, scanned count, errors, and elapsed time. Scan statuses: QUEUED → RUNNING → COMPLETED / FAILED / CANCELLED.

---

## 8. Classification

### 8.1 Classification Rules

The platform includes 25+ built-in classification rules covering PII (PAN, Aadhaar, SSN, email, phone), financial data (credit cards, bank accounts), and secrets (API keys, private keys, tokens, connection strings).

**Custom rules** can be created with regex patterns, keyword lists, dictionary lookups, or ML/NLP models.

### 8.2 Viewing Results

Classification results show: category, level (PUBLIC → RESTRICTED), detection method, confidence score (0.0–1.0), and sample count.

### 8.3 Reporting False Positives

Mark incorrect classifications as false positive with feedback notes. Results are excluded from future risk calculations.

---

## 9. Identity & Access

### 9.1 Asset Access Summary

View total users, privileged users, external users, service accounts, and public exposure status for any asset.

### 9.2 Access Findings

| Finding Type | Description |
|-------------|-------------|
| `PUBLIC_ACCESS` | Asset is publicly accessible |
| `OVERLY_PERMISSIVE` | More permissions than needed |
| `STALE_ACCESS` | Granted but not recently used |
| `ORPHANED_ACCOUNT` | User has left the organization |
| `TOXIC_COMBINATION` | Dangerous permission pairings |
| `EXTERNAL_COLLABORATOR` | External user accessing sensitive data |

---

## 10. Consent Management

Navigate to **Consent Management** under Privacy Operations.

### 10.1 Consent Overview

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Total Consents │  │  Active         │  │  Expired        │  │  Revoked        │
│    26,668       │  │   25,216        │  │     541         │  │     911         │
│  (blue)         │  │  (green)        │  │  (yellow)       │  │  (red)          │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 10.2 Managing Consent Purposes

View and manage consent purposes with legal basis, active count, and withdrawal rates:

| Purpose | Legal Basis | Active | Withdrawal Rate |
|---------|-------------|--------|-----------------|
| Marketing | Consent | 7,891 | 6.4% |
| Analytics | Legitimate Interest | 11,983 | 1.0% |
| Data Processing | Contract | 3,240 | 0.0% |
| Profiling | Consent | 2,102 | 27.3% |

### 10.3 Consent Records

The records table shows: subject ID, purpose, legal basis, status (active/revoked/expired), granted date, and expiry date.

### 10.4 Consent Analytics

Track consent rates, opt-out trends, and daily grant/withdrawal patterns over time.

---

## 11. Data Subject Rights (DSAR)

Navigate to **Data Subject Rights** under Privacy Operations.

### 11.1 DSAR Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Data Subject Requests                    [+ New Request]       │
├──────┬──────────┬───────────┬──────────┬───────┬───────────────┤
│  ID  │ Type     │ Subject   │ Status   │ Due   │ Assigned      │
├──────┼──────────┼───────────┼──────────┼───────┼───────────────┤
│ #089 │ ERASURE  │ j.doe@... │ IN_PROG  │ Mar 15│ Sarah M.      │
│ #088 │ ACCESS   │ m.smith@..│ VERIFIED │ Mar 12│ Unassigned     │
│ #087 │ PORTABLE │ k.jones@..│ COMPLETED│ Mar 8 │ Mike R.        │
│ #086 │ RECTIFY  │ l.chen@.. │ SUBMITTED│ Mar 20│ Unassigned     │
└──────┴──────────┴───────────┴──────────┴───────┴───────────────┘
```

**Request types:** Access, Erasure/Deletion, Rectification, Portability, Objection

### 11.2 Processing a DSAR

1. **Verify Identity** — Confirm the requestor's identity
2. **Assign Tasks** — System auto-creates tasks based on request type
3. **Process Tasks** — Team completes each task (data collection, deletion, etc.)
4. **Review & Respond** — Review and send response to data subject

---

## 12. Breach Monitoring

Navigate to **Breach Monitoring** under Privacy Operations.

### 12.1 Incident Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Breach Incidents                           [+ Report Incident] │
├──────┬────────────┬──────────┬──────────┬──────────────────────┤
│  ID  │ Title      │ Severity │ Status   │ Regulatory Deadline  │
├──────┼────────────┼──────────┼──────────┼──────────────────────┤
│ #003 │ Unauth.    │ HIGH     │CONTAINED │ Mar 11 (⚠ 8h left)  │
│      │ DB Access  │          │          │                      │
│ #002 │ Phishing   │ MEDIUM   │RECOVERED │ —                    │
│ #001 │ Data Leak  │ CRITICAL │ CLOSED   │ Reported on time     │
└──────┴────────────┴──────────┴──────────┴──────────────────────┘
```

### 12.2 GDPR 72-Hour Notification

The system automatically calculates GDPR 72-hour regulatory deadlines and tracks:
- Incident timeline (detection → investigation → containment → resolution)
- Affected data subjects count and data types
- DPA notifications, data subject notifications, and management notifications
- Regulatory reporting status

### 12.3 Breach Lifecycle

Status flow: OPEN → INVESTIGATING → CONTAINED → RESOLVED → CLOSED

---

## 13. Vendor Risk Management

Navigate to **Vendor Risk** under Privacy Operations.

### 13.1 Vendor Registry

```
┌─────────────────────────────────────────────────────────────────┐
│  Vendors                                       [+ Add Vendor]   │
├──────────────┬───────────┬────────┬───────────┬────────────────┤
│ Vendor       │ Category  │ Risk   │ Status    │ Next Review    │
├──────────────┼───────────┼────────┼───────────┼────────────────┤
│ CloudCorp    │ CLOUD     │ MEDIUM │ ACTIVE    │ Jun 15, 2026   │
│ DataProc Inc │ PROCESSOR │ LOW    │ ACTIVE    │ Sep 1, 2026    │
│ AnalytiCo   │ SAAS      │ HIGH   │ UNDER_REV │ —              │
│ SecureVault  │ CLOUD     │ LOW    │ ACTIVE    │ Dec 1, 2026    │
└──────────────┴───────────┴────────┴───────────┴────────────────┘
```

### 13.2 Vendor Assessment

Assessments include: questionnaire review, risk scoring (0–100), DPA verification, SOC 2 report status, and remediation findings.

### 13.3 Data Types Tracking

For each vendor, track which data types are shared, processing purposes, and contractual obligations.

---

## 14. Data Retention

Navigate to **Data Retention** under Privacy Operations.

### 14.1 Retention Policies

```
┌─────────────────────────────────────────────────────────────────┐
│  Retention Policies                           [+ New Policy]    │
├─────────────────┬──────────┬────────┬────────┬────────────────┤
│ Policy          │ Period   │ Action │ Status │ Last Execution  │
├─────────────────┼──────────┼────────┼────────┼────────────────┤
│ EU Customer Data│ 730 days │ DELETE │ ACTIVE │ Mar 9 (OK)      │
│ Marketing Leads │ 365 days │ANONYMIZ│ ACTIVE │ Mar 8 (OK)      │
│ Employee Records│ 2555 days│ ARCHIVE│ ACTIVE │ Mar 7 (OK)      │
│ Session Logs    │ 90 days  │ DELETE │ ACTIVE │ Mar 10 (Running)│
└─────────────────┴──────────┴────────┴────────┴────────────────┘
```

### 14.2 Policy Actions

| Action | Description |
|--------|-------------|
| DELETE | Permanently remove data after retention period |
| ANONYMIZE | Replace PII with anonymized values |
| ARCHIVE | Move to long-term archive storage |

### 14.3 Execution Results

Each execution logs: records processed, deleted, archived, anonymized, and duration. Trigger manual runs or view execution history.

---

## 15. Workflows & Approvals

Navigate to **Workflows** under Privacy Operations.

### 15.1 Task Management

```
┌─────────────────────────────────────────────────────────────────┐
│  My Tasks (5 pending)                                           │
├──────┬──────────────────┬──────────┬──────────┬────────────────┤
│  ID  │ Task             │ Workflow │ Type     │ Due            │
├──────┼──────────────────┼──────────┼──────────┼────────────────┤
│ T-42 │ Review DSAR resp.│ DSAR     │ APPROVAL │ Mar 12         │
│ T-41 │ Vendor DPA review│ VENDOR   │ REVIEW   │ Mar 15         │
│ T-40 │ Breach notif.    │ BREACH   │ APPROVAL │ Mar 11 ⚠       │
│ T-39 │ Collect data     │ DSAR     │ MANUAL   │ Mar 14         │
│ T-38 │ Risk assessment  │ RISK     │ REVIEW   │ Mar 20         │
└──────┴──────────────────┴──────────┴──────────┴────────────────┘
```

### 15.2 Approval Flow

For each approval task, you can: Approve, Reject, or Defer with comments. The workflow engine automatically routes to the next step based on the decision.

---

## 16. Audit Trail

Navigate to **Audit Trail** under Privacy Operations. All actions across DSPM and PrivacyOps are recorded in an immutable audit log.

### 16.1 Viewing Audit Logs

```
┌─────────────────────────────────────────────────────────────────┐
│  Audit Log                                       [Export ▼]     │
│  Filter: [All Actions ▼] [All Users ▼] [Last 7 days ▼]        │
├──────────────────┬──────────┬──────────┬────────┬──────────────┤
│ Timestamp        │ User     │ Action   │ Entity │ Details      │
├──────────────────┼──────────┼──────────┼────────┼──────────────┤
│ Mar 10 10:32:15  │ sarah.m  │ CREATE   │ DSAR   │ #DSR-089     │
│ Mar 10 10:15:42  │ system   │ UPDATE   │ Scan   │ Completed    │
│ Mar 10 09:45:01  │ mike.r   │ UPDATE   │ Breach │ →CONTAINED   │
│ Mar 10 09:30:22  │ john.d   │ UPDATE   │ Vendor │ Assessment   │
│ Mar 10 09:12:55  │ system   │ DELETE   │ Retain │ 1,203 records│
│ Mar 10 08:55:10  │ ext.user │ CONSENT  │ Consent│ Withdrawal   │
└──────────────────┴──────────┴──────────┴────────┴──────────────┘
```

**Logged information:** User, action type, target module, resource type/ID, IP address, user agent, status (success/failure), and timestamp.

**Export** logs as CSV or JSON for external compliance audits.

---

## 17. Risk Management

### 17.1 DSPM Risk Summary

- **Overall Risk Score** — weighted average across all assets
- **Distribution** — count of assets at each risk level (Critical, High, Medium, Low)
- **Contributing Factors** — exposure, encryption gaps, excessive access, sensitive data volume
- **Trends** — track risk score changes by day, week, or month

### 17.2 Privacy Risk

The privacy risk module provides:
- **Risk Heatmap** — categorized by data type and impact level
- **Risk Trends** — privacy risk score over time
- **High-Risk Assessments** — detailed findings requiring attention

---

## 18. Reports

### 18.1 DSPM Reports

| Type | Contents |
|------|----------|
| `ASSET_INVENTORY` | Full asset catalog with classification and risk data |
| `COMPLIANCE` | Compliance posture across frameworks |
| `EXPOSURE` | Public and external exposure analysis |
| `SENSITIVE_DATA_LOCATION` | Map of where sensitive data resides |
| `ACCESS_EXPOSURE` | Identity and access risk analysis |
| `REMEDIATION_PROGRESS` | Remediation task status and trends |

### 18.2 Privacy Reports

| Type | Contents |
|------|----------|
| `COMPLIANCE` | Framework compliance scores and gap analysis |
| `RISK` | Risk assessment summary with trends |
| `BREACH` | Breach incident summary and response metrics |
| `CONSENT` | Consent analytics and opt-out trends |
| `DSAR` | Data subject request volume and SLA compliance |
| `VENDOR` | Vendor risk assessment summary |

### 18.3 Generating Reports

Select type, format (PDF, CSV, XLSX, JSON), date range, and content options. Schedule automated report delivery via email.

---

## 19. AI Security Assistant

Navigate to **AI Assistant** under Intelligence.

### 19.1 Overview

The AI Security Assistant provides a natural language query interface for CISOs and security teams. Ask questions in plain English about both data security and privacy posture.

> **Data Residency Guarantee:** All processing happens locally. No data is sent to external AI services. The engine uses rule-based NLP pattern matching running entirely on your backend.

### 19.2 Query Categories

| Category | Example Queries |
|----------|----------------|
| **Executive Overview** | "What is our overall security posture?" |
| **Risk & Threats** | "Show me all critical alerts", "Risk trend this month" |
| **Data Exposure** | "Are any assets publicly exposed?", "Show shadow data" |
| **Compliance** | "GDPR compliance status?", "Show policy violations" |
| **Identity & Access** | "Any excessive access findings?", "Show toxic permissions" |
| **Infrastructure** | "Are all connectors healthy?", "When was the last scan?" |

### 19.3 Response Format

Responses include: narrative summary, color-coded stat cards, distribution bars, data tables, severity badges, trend charts, recommendations, confidence score, and clickable follow-up suggestions.

---

## 20. Administration

### 20.1 User Management

Administrators can: list users, create users with role assignment, view user details, and deactivate accounts.

### 20.2 Role-Based Access Control

**DSPM Roles:**

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access across all tenants |
| **Org Admin** | Organization-level admin |
| **Security Analyst** | Run scans, manage alerts, create remediation tasks |
| **Compliance Officer** | Manage policies, approve exceptions |
| **Data Owner** | Manage assigned assets |
| **Auditor** | Read-only access to audit logs and reports |
| **Read Only** | View-only access |

**PrivacyOps Roles:**

| Role | Permissions |
|------|------------|
| **Privacy Officer** | compliance.*, consent.*, rights.*, breach.* |
| **DPO** | All read, compliance.manage, breach.manage |
| **Risk Manager** | vendor-risk.*, privacy-risk.* |

### 20.3 API Token Management

Create tokens with name, expiration, and scopes for programmatic access. Revoke tokens at any time. Use `Authorization: Bearer <token>` in API calls.

### 20.4 Multi-Tenancy

The platform supports full multi-tenancy with isolated data per tenant. All API calls are scoped to the authenticated tenant. Tenant context is extracted from JWT token or `X-Tenant-Id` header.

---

## 21. Keyboard Shortcuts & Tips

**Daily tasks checklist:**
- Review Critical/High alerts
- Check publicly exposed assets
- Review new scan results and DSAR requests
- Monitor breach notification deadlines
- Check consent withdrawal trends

**Weekly tasks:**
- Review compliance coverage across all frameworks
- Audit stale/shadow data
- Review vendor risk assessments
- Generate executive reports

**Productivity tips:**
- Set up scheduled scans to run nightly for continuous monitoring
- Use the AI Assistant for quick board-prep summaries
- Use API tokens for automated reporting and SIEM/SOAR integration
- Configure workflow templates for repeatable privacy processes

---

## 22. Troubleshooting

### Login Issues

| Problem | Solution |
|---------|----------|
| "Authentication failed" | Verify email and password (12+ characters, mixed case, digits, special chars) |
| "Too Many Requests" | Rate-limited — wait 60 seconds and retry |
| Session expired | JWT token has 1-hour lifetime — log in again |

### Connector Issues

| Problem | Solution |
|---------|----------|
| Connector shows "Failed" | Check credentials and network connectivity |
| Scan stuck in "QUEUED" | Verify Celery workers are running and connected to Redis |
| Partial access | Credentials may lack some permissions — check IAM policies |

### Privacy Operations Issues

| Problem | Solution |
|---------|----------|
| "Missing authorization token" | Ensure Bearer token is included in request headers |
| "Insufficient permissions" | Contact admin to add required role permissions |
| "Access denied: tenant mismatch" | Attempting to access another tenant's data |
| Compliance scan stuck | Cancel and re-trigger; check service logs |
| DSAR past due date | Assign the request and complete pending tasks |
| Breach notification not sent | Verify notification channel configuration and recipient emails |
| Kafka not connected | Check KAFKA_BROKERS configuration and Kafka availability |

### AI Assistant Issues

| Problem | Solution |
|---------|----------|
| "Couldn't determine intent" | Rephrase using simpler phrasing and keywords |
| Low confidence score | Try direct phrasing: "show critical alerts" |
| No data in response | Ensure scans have been run and data exists |

### General Issues

| Problem | Solution |
|---------|----------|
| Slow dashboard loading | Use filters to narrow results; check Elasticsearch and Redis health |
| API returns 403 | Role doesn't have permission — contact administrator |
| Changes not reflected | Some operations run asynchronously — refresh after a few seconds |

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   TechD Platform — Quick Reference                      │
│                                                                         │
│  LOGIN:     https://platform.yourcompany.com                            │
│  DSPM API:  https://platform.yourcompany.com/api/v1                     │
│  BFF API:   https://platform.yourcompany.com:4000                       │
│                                                                         │
│  DATA SECURITY (DSPM)              PRIVACY OPERATIONS                   │
│  ─────────────────────             ──────────────────                   │
│  □ Connectors & scanning           □ Consent management                 │
│  □ Asset inventory                  □ DSAR processing                    │
│  □ Classification & risk            □ Breach monitoring                  │
│  □ Alerts & remediation             □ Vendor risk                        │
│  □ Compliance monitoring            □ Data retention                     │
│  □ AI security assistant            □ Workflows & approvals              │
│                                     □ Audit trail                        │
│                                                                         │
│  KEY CONTACTS                                                           │
│  ────────────                                                           │
│  Platform Admin:  admin@yourcompany.com                                 │
│  Security Team:   security@yourcompany.com                              │
│  Privacy Team:    privacy@yourcompany.com                               │
│  Support:         platform-support@yourcompany.com                      │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix A: Connector Configuration Reference

Complete configuration reference for all **59 connector types** across 10 categories. For each connector: type string (used in API calls), required config fields, credentials, and what it discovers.

### A.1 Cloud Storage Connectors (10 types)

| Connector | Type | Credentials | Config Fields |
|-----------|------|-------------|---------------|
| AWS S3 | `aws_s3` | `access_key`, `secret_key` or IAM role | `region` |
| Azure Blob | `azure_blob` | `connection_string` | — |
| ADLS | `adls` | `access_key` | `storage_account` |
| Google Cloud Storage | `gcs` | Service account JSON | `project_id` |
| OneDrive | `onedrive` | OAuth2 `access_token` | `user_id` |
| SharePoint Online | `sharepoint_online` | OAuth2 `access_token` | `site_url`, `site_id` |
| Google Drive | `google_drive` | OAuth2 `access_token` | — |
| Box | `box` | OAuth2 `access_token` | `folder_id` |
| Dropbox | `dropbox` | OAuth2 `access_token` | `folder_path` |
| Egnyte | `egnyte` | OAuth2 `access_token` | `domain`, `folder_path` |

### A.2 Database Connectors (8 types)

| Connector | Type | Config Fields |
|-----------|------|---------------|
| PostgreSQL | `postgresql` | `host`, `port` (5432), `database` |
| MySQL | `mysql` | `host`, `port` (3306), `database` |
| MS SQL Server | `mssql` | `host`, `port` (1433), `database` |
| Oracle | `oracle` | `host`, `port` (1521), `database` |
| MariaDB | `mariadb` | `host`, `port` (3306), `database` |
| IBM Db2 | `db2` | `host`, `port` (50000), `database` |
| MongoDB | `mongodb` | `host`, `port` (27017), `database` or `connection_string` |
| Cassandra | `cassandra` | `host`, `port` (9042) |

### A.3 Data Warehouse Connectors (6 types)

| Connector | Type | Config Fields |
|-----------|------|---------------|
| Snowflake | `snowflake` | `account`, `warehouse`, `database` |
| BigQuery | `bigquery` | `project_id` |
| Redshift | `redshift` | `host`, `port` (5439), `database` |
| Azure Synapse | `synapse` | `host`, `port` (1433), `database` |
| Databricks | `databricks` | `workspace_url`, `cluster_id` or `warehouse_id` |
| Teradata | `teradata` | `host`, `port` (1025), `database` |

### A.4 SaaS & Collaboration (8 types)

| Connector | Type | Config Fields |
|-----------|------|---------------|
| Microsoft 365 | `m365` | `tenant_id`, `domain` |
| Microsoft Teams | `teams` | `tenant_id` |
| Google Workspace | `google_workspace` | `domain`, `admin_email` |
| Gmail | `gmail` | — |
| Slack | `slack` | `workspace_id` |
| Jira | `jira` | `domain`, `project_key` |
| Confluence | `confluence` | `domain`, `space_key` |
| Salesforce | `salesforce` | `instance_url` |

### A.5 Identity & Access (7 types)

| Connector | Type |
|-----------|------|
| Azure Active Directory | `azure_ad` |
| AWS IAM | `aws_iam` |
| Google IAM | `gcp_iam` |
| LDAP | `ldap` |
| Microsoft Active Directory | `active_directory` |
| Okta | `okta` |
| Ping Identity | `ping_identity` |

### A.6 On-Premises & Other

| Connector | Type |
|-----------|------|
| HDFS | `hdfs` |
| SMB/NFS File Shares | `file_share` |
| Local Filesystem | `local_fs` |
| On-Prem SharePoint | `sharepoint_onprem` |
| GitHub | `github` |
| GitLab | `gitlab` |
| Bitbucket | `bitbucket` |
| Azure DevOps | `azure_devops` |

---

*TechD Platform v3.0 — Unified data security and privacy operations.*

---

*Copyright (c) 2026 TechD. All rights reserved.*
