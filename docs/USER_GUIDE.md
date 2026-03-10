# TechD DSPM — Application User Guide

> **Version:** 1.0 | **Last Updated:** March 2026
>
> A complete guide to using the TechD Data Security Posture Management platform — from first login through daily operations, compliance monitoring, and executive reporting.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
   - [Accessing the Platform](#11-accessing-the-platform)
   - [Logging In](#12-logging-in)
   - [Creating an Account](#13-creating-an-account)
   - [Understanding the Interface](#14-understanding-the-interface)
2. [Dashboard](#2-dashboard)
   - [Key Metrics](#21-key-metrics)
   - [Risk Distribution](#22-risk-distribution)
   - [Top Risky Data Stores](#23-top-risky-data-stores)
   - [Alerts by Severity](#24-alerts-by-severity)
3. [Connectors](#3-connectors)
   - [Viewing Connectors](#31-viewing-connectors)
   - [Adding a Connector](#32-adding-a-connector)
   - [Testing Connectivity](#33-testing-connectivity)
   - [Running a Scan](#34-running-a-scan)
   - [Supported Data Sources](#35-supported-data-sources)
4. [Asset Inventory](#4-asset-inventory)
   - [Browsing Assets](#41-browsing-assets)
   - [Filtering Views](#42-filtering-views)
   - [Asset Details](#43-asset-details)
   - [Managing Ownership](#44-managing-ownership)
   - [Tagging Assets](#45-tagging-assets)
5. [Alerts & Workflow](#5-alerts--workflow)
   - [Viewing Alerts](#51-viewing-alerts)
   - [Filtering Alerts](#52-filtering-alerts)
   - [Managing Alert Lifecycle](#53-managing-alert-lifecycle)
   - [Remediation Tasks](#54-remediation-tasks)
6. [Compliance](#6-compliance)
   - [Compliance Coverage](#61-compliance-coverage)
   - [Policy Violations](#62-policy-violations)
   - [Approving Exceptions](#63-approving-exceptions)
7. [Scans & Discovery](#7-scans--discovery)
   - [Creating a Scan](#71-creating-a-scan)
   - [Monitoring Scan Progress](#72-monitoring-scan-progress)
   - [Viewing Discovered Assets](#73-viewing-discovered-assets)
8. [Classification](#8-classification)
   - [Classification Rules](#81-classification-rules)
   - [Viewing Classification Results](#82-viewing-classification-results)
   - [Reporting False Positives](#83-reporting-false-positives)
9. [Identity & Access](#9-identity--access)
   - [Asset Access Summary](#91-asset-access-summary)
   - [Identity Sensitive Assets](#92-identity-sensitive-assets)
   - [Access Findings](#93-access-findings)
10. [Risk Management](#10-risk-management)
    - [Risk Summary](#101-risk-summary)
    - [Risk Trends](#102-risk-trends)
11. [Reports](#11-reports)
    - [Executive Summary](#111-executive-summary)
    - [Creating Custom Reports](#112-creating-custom-reports)
12. [Administration](#12-administration)
    - [User Management](#121-user-management)
    - [Role-Based Access Control](#122-role-based-access-control)
    - [API Token Management](#123-api-token-management)
    - [Audit Logs](#124-audit-logs)
13. [Keyboard Shortcuts & Tips](#13-keyboard-shortcuts--tips)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Getting Started

### 1.1 Accessing the Platform

Open your browser and navigate to the TechD DSPM URL provided by your administrator (e.g., `https://dspm.yourcompany.com`). The platform supports modern browsers: Chrome 90+, Firefox 90+, Edge 90+, and Safari 15+.

### 1.2 Logging In

When you access the platform, the login screen is displayed.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│          ┌──────────────────────────────┐             │
│          │                              │             │
│          │        TechD DSPM            │             │
│          │  Data Security Posture Mgmt  │             │
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
4. Upon successful authentication, you are redirected to the Dashboard.

> **Note:** After 3 failed login attempts within 60 seconds, your IP is temporarily rate-limited. Wait 60 seconds before retrying.

### 1.3 Creating an Account

If public registration is enabled by your administrator:

1. Click **Register** at the bottom of the login form.
2. Enter your email and a strong password (12+ characters).
3. Click **Create Account**.
4. New accounts are assigned the **Read Only** role by default. Contact your administrator for elevated permissions.

### 1.4 Understanding the Interface

After logging in, the main application layout appears with a left sidebar and a content area.

```
┌────────────┬─────────────────────────────────────────────────┐
│            │                                                 │
│  TechD     │            Content Area                         │
│  DSPM      │                                                 │
│  ────────  │  Displays the active page content:              │
│            │  Dashboard, Connectors, Assets, Alerts,         │
│  ◉ Dashboard│  or Compliance                                 │
│  ○ Connectors│                                               │
│  ○ Assets  │                                                 │
│  ○ Alerts  │                                                 │
│  ○ Compliance│                                               │
│            │                                                 │
│            │                                                 │
│            │                                                 │
│            │                                                 │
│            │                                                 │
│  [Sign Out]│                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

**Sidebar Navigation:**

| Icon | Page | Description |
|------|------|-------------|
| Grid | **Dashboard** | Executive overview with KPIs and risk metrics |
| Plug | **Connectors** | Manage data source connections |
| Database | **Asset Inventory** | Browse and manage discovered assets |
| Bell | **Alerts** | Security alerts and remediation workflow |
| Shield | **Compliance** | Compliance coverage and policy violations |

Click any item in the sidebar to navigate. The active page is highlighted. Click **Sign Out** at the bottom to end your session.

---

## 2. Dashboard

The Dashboard provides an executive-level view of your organization's data security posture.

### 2.1 Key Metrics

Four stat cards are displayed across the top of the dashboard.

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ ▌ Total Assets  │  │ ▌ Sensitive     │  │ ▌ Critical Risk │  │ ▌ Publicly      │
│ ▌ Scanned       │  │ ▌ Assets        │  │ ▌ Assets        │  │ ▌ Exposed       │
│ ▌               │  │ ▌               │  │ ▌               │  │ ▌               │
│ ▌   1,247       │  │ ▌     342       │  │ ▌      28       │  │ ▌      12       │
│ ▌               │  │ ▌               │  │ ▌               │  │ ▌               │
│ ▌ (blue)        │  │ ▌ (yellow)      │  │ ▌ (red)         │  │ ▌ (red)         │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
```

| Metric | Description |
|--------|-------------|
| **Total Assets Scanned** | Number of data stores discovered across all connectors |
| **Sensitive Assets** | Assets containing at least one sensitive data element |
| **Critical Risk Assets** | Assets with a risk score of 80 or above (out of 100) |
| **Publicly Exposed** | Sensitive assets that are publicly accessible |

### 2.2 Risk Distribution

Below the stat cards, the Risk Distribution panel shows a breakdown of assets by risk level.

```
┌──────────────────────────────────────────┐
│  Risk Distribution                       │
│                                          │
│  ■ Critical (80-100)    28 assets        │
│  ■ High (60-79)         67 assets        │
│  ■ Medium (40-59)      185 assets        │
│  ■ Low (0-39)          967 assets        │
│                                          │
│  Average Risk Score:  34.2               │
└──────────────────────────────────────────┘
```

- **Critical** (red): Risk score 80–100 — requires immediate action
- **High** (orange): Risk score 60–79 — prioritize for remediation
- **Medium** (yellow): Risk score 40–59 — monitor and plan remediation
- **Low** (green): Risk score 0–39 — acceptable risk level

### 2.3 Top Risky Data Stores

The top 10 riskiest assets are listed with visual risk bars.

```
┌──────────────────────────────────────────┐
│  Top Risky Data Stores                   │
│                                          │
│  prod-customer-db         ████████████ 95│
│  s3-public-reports        ███████████  88│
│  analytics-warehouse      ██████████   82│
│  staging-user-dump        █████████    78│
│  hr-payroll-share         ████████     72│
│  dev-test-data            ███████      65│
│  marketing-contacts       ██████       58│
│  logs-archive-bucket      █████        52│
│  internal-wiki-db         ████         45│
│  backup-store-east        ████         42│
│                                          │
└──────────────────────────────────────────┘
```

Color coding of the progress bars:
- **Red** — score ≥ 80
- **Orange** — score 60–79
- **Yellow** — score < 60

### 2.4 Alerts by Severity

A grid showing the count of open alerts grouped by severity level.

```
┌──────────────────────────────────────────┐
│  Open Alerts by Severity                 │
│                                          │
│  CRITICAL     HIGH      MEDIUM    LOW    │
│     5          12         34       8     │
│                                          │
└──────────────────────────────────────────┘
```

---

## 3. Connectors

Connectors link TechD DSPM to your data sources — cloud storage, databases, SaaS applications, and more.

### 3.1 Viewing Connectors

Navigate to **Connectors** in the sidebar to see all configured data sources.

```
┌──────────────────────────────────────────────────────────────┐
│  Connectors                              [+ Add Connector]  │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ AWS S3 Prod      │  │ PostgreSQL Main  │  │ M365 Corp  │ │
│  │ ● Connected      │  │ ● Connected      │  │ ○ Failed   │ │
│  │                  │  │                  │  │            │ │
│  │ Type: aws_s3     │  │ Type: postgresql │  │ Type: m365 │ │
│  │ Last sync:       │  │ Last sync:       │  │ Last sync: │ │
│  │ 2026-03-10 08:30 │  │ 2026-03-09 22:00 │  │ Never      │ │
│  │                  │  │                  │  │            │ │
│  │ [Scan Now]       │  │ [Scan Now]       │  │ [Scan Now] │ │
│  │ [Configure]      │  │ [Configure]      │  │ [Configure]│ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
│                                                              │
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

1. Click **+ Add Connector** in the top-right corner.
2. Select the connector type from the dropdown.
3. Fill in the required fields:

```
┌──────────────────────────────────────────┐
│  Add New Connector                       │
│                                          │
│  Name:                                   │
│  ┌────────────────────────────────────┐   │
│  │ Production S3 Bucket              │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Type:                                   │
│  ┌────────────────────────────────────┐   │
│  │ AWS S3                        ▼   │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Credential Type:                        │
│  ┌────────────────────────────────────┐   │
│  │ IAM Role                      ▼   │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Configuration (JSON):                   │
│  ┌────────────────────────────────────┐   │
│  │ { "region": "ap-south-1",        │   │
│  │   "role_arn": "arn:aws:iam:..." } │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Scan Scope (JSON):                      │
│  ┌────────────────────────────────────┐   │
│  │ { "buckets": ["prod-*"] }         │   │
│  └────────────────────────────────────┘   │
│                                          │
│  Schedule (Cron):                        │
│  ┌────────────────────────────────────┐   │
│  │ 0 2 * * *                         │   │
│  └────────────────────────────────────┘   │
│                                          │
│  ☑ Enable incremental sync              │
│                                          │
│        [Cancel]    [Create Connector]    │
│                                          │
└──────────────────────────────────────────┘
```

4. Click **Create Connector**.

**Configuration reference by connector type:**

| Connector Type | Config Fields | Example |
|---------------|---------------|---------|
| AWS S3 | `region`, `role_arn` or `access_key`/`secret_key` | `{"region": "ap-south-1"}` |
| PostgreSQL | `host`, `port`, `database` | `{"host": "db.example.com", "port": 5432}` |
| Azure Blob | `storage_account`, `container` | `{"storage_account": "myaccount"}` |
| Google Workspace | `domain`, `admin_email` | `{"domain": "company.com"}` |
| Snowflake | `account`, `warehouse`, `database` | `{"account": "xy12345.ap-south-1"}` |

### 3.3 Testing Connectivity

Before running a scan, verify the connection:

1. Click **Configure** on a connector card.
2. Use the **Test Connection** option to validate credentials and network access.
3. The system verifies:
   - Credentials are valid
   - Network connectivity to the data source
   - Required permissions are in place

> **Security:** All credentials are encrypted at rest using Fernet symmetric encryption. The platform blocks connections to internal/private IP ranges (SSRF protection).

### 3.4 Running a Scan

1. Click **Scan Now** on any connected data source.
2. The scan is queued and a Celery background worker picks it up.
3. The scan pipeline executes:
   - **Discovery** — enumerate all data assets
   - **Classification** — identify sensitive data patterns
   - **Risk Scoring** — calculate risk based on exposure, encryption, access
   - **Policy Evaluation** — check compliance against active rules
   - **Alert Generation** — create alerts for violations

### 3.5 Supported Data Sources

| Category | Data Sources |
|----------|-------------|
| **Cloud Storage** | AWS S3, Azure Blob Storage, Google Cloud Storage |
| **Relational Databases** | PostgreSQL, MySQL, MS SQL Server, Oracle, MariaDB |
| **NoSQL Databases** | MongoDB |
| **Data Warehouses** | Snowflake, BigQuery, Redshift, Databricks |
| **SaaS Applications** | Microsoft 365, Google Workspace, Slack, Jira, Confluence, Salesforce |
| **File Systems** | HDFS, SMB/NFS shares, Local FS |

---

## 4. Asset Inventory

The Asset Inventory provides a comprehensive catalog of all discovered data stores across your organization.

### 4.1 Browsing Assets

Navigate to **Asset Inventory** in the sidebar.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Asset Inventory                                                        │
│                                                                         │
│  [All Assets] [Sensitive] [Exposed] [Stale] [Shadow] [Unowned]         │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Name              │ Type    │ Exposure │ Sensitive │ Risk │ Region│  │
│  ├───────────────────┼─────────┼──────────┼───────────┼──────┼───────┤  │
│  │ prod-customer-db  │ database│ PRIVATE  │    142    │  95  │ IN    │  │
│  │ /data/customers   │         │          │           │      │       │  │
│  ├───────────────────┼─────────┼──────────┼───────────┼──────┼───────┤  │
│  │ s3-public-reports │ bucket  │ PUBLIC   │     38    │  88  │ US    │  │
│  │ s3://reports-pub  │         │          │           │      │       │  │
│  ├───────────────────┼─────────┼──────────┼───────────┼──────┼───────┤  │
│  │ hr-payroll-share  │ file    │ INTERNAL │     67    │  72  │ IN    │  │
│  │ //nas/hr/payroll  │         │          │           │      │       │  │
│  ├───────────────────┼─────────┼──────────┼───────────┼──────┼───────┤  │
│  │ staging-test-db   │ database│ PRIVATE  │     12    │  45  │ IN    │  │
│  │ staging.internal  │         │          │           │      │       │  │
│  └───────────────────┴─────────┴──────────┴───────────┴──────┴───────┘  │
│                                                                         │
│  Page 1 of 25                             [< Prev]  [Next >]           │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Column descriptions:**

| Column | Description |
|--------|-------------|
| **Name** | Asset name and path (e.g., S3 bucket path, DB schema) |
| **Type** | Asset type — bucket, database, table, file, schema, collection |
| **Exposure** | Access level — PRIVATE, INTERNAL, EXTERNAL_SHARED, PUBLIC |
| **Sensitive** | Count of sensitive data elements detected |
| **Risk** | Risk score 0–100 |
| **Region** | Geographic region / cloud region |

**Risk score color coding:**
- 🔴 Red: ≥ 80 (Critical)
- 🟠 Orange: 60–79 (High)
- 🟡 Yellow: 40–59 (Medium)
- 🟢 Green: < 40 (Low)

### 4.2 Filtering Views

Click the tabs at the top to switch between pre-filtered views:

| Tab | Shows | Use Case |
|-----|-------|----------|
| **All Assets** | Every discovered asset with pagination | Full inventory review |
| **Sensitive** | Assets with `sensitive_data_count > 0` | Focus on data at risk |
| **Exposed** | Assets with PUBLIC or EXTERNAL_SHARED exposure | Find open access points |
| **Stale** | Assets not accessed or modified recently | Identify cleanup targets |
| **Shadow** | Unmanaged/untracked data stores | Discover rogue data |
| **Unowned** | Assets without assigned business/technical owners | Assign accountability |

The **All Assets** tab also supports URL query parameters for advanced filtering:
- `environment` — production, staging, dev, test
- `owner` — filter by business owner name
- `region` — cloud region or geo-region
- `exposure_status` — private, internal, external_shared, public
- `asset_type` — bucket, database, table, file, etc.

### 4.3 Asset Details

Click any asset row to view full details via the API:

**Asset detail fields include:**
- Asset name, path, and storage location
- Connector source and last scan date
- Environment classification (production, staging, dev)
- Business and technical owners
- Encryption status (encrypted, not encrypted, partial, unknown)
- Full classification summary with detected data categories
- Risk score breakdown with contributing factors
- Associated policy violations
- Access permissions summary

### 4.4 Managing Ownership

Assign or update asset owners (requires `org_admin`, `super_admin`, or `data_owner` role):

1. Navigate to the asset detail view.
2. Update the **Business Owner** and/or **Technical Owner** fields.
3. Save changes.

### 4.5 Tagging Assets

Add metadata tags to assets for organization and filtering (requires `org_admin`, `super_admin`, `security_analyst`, or `data_owner` role):

1. Navigate to the asset detail view.
2. Add a tag with a **Key** and **Value** (e.g., `team: data-engineering`, `cost-center: CC-1042`).
3. Tags appear on the asset and can be used for filtering.

---

## 5. Alerts & Workflow

The Alerts page is the central hub for security incident management and remediation tracking.

### 5.1 Viewing Alerts

Navigate to **Alerts** in the sidebar.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Security Alerts                                                        │
│                                                                         │
│  Severity: [All Severities ▼]    Status: [All Statuses ▼]             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  CRITICAL   OPEN   POLICY_VIOLATION                              │   │
│  │                                                                  │   │
│  │  Policy Violation: Sensitive data is publicly accessible:        │   │
│  │  s3-public-reports                                               │   │
│  │                                                                  │   │
│  │  Sensitive data is publicly accessible in S3 bucket              │   │
│  │  s3-public-reports containing 38 sensitive elements.             │   │
│  │                                                                  │   │
│  │  Remediation: Revoke public access to this asset immediately     │   │
│  │                                                                  │   │
│  │  Created: 2026-03-10 09:15    Assigned to: security-team         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  HIGH   IN_PROGRESS   EXCESSIVE_ACCESS                           │   │
│  │                                                                  │   │
│  │  Excessive permissions on prod-customer-db                       │   │
│  │                                                                  │   │
│  │  45 users have write access to production customer database      │   │
│  │  containing 142 sensitive data elements. Only 8 require it.      │   │
│  │                                                                  │   │
│  │  Remediation: Review and restrict access to principle of         │   │
│  │  least privilege                                                 │   │
│  │                                                                  │   │
│  │  Created: 2026-03-09 14:22    Assigned to: john@company.com      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Filtering Alerts

Use the dropdown filters at the top:

**Severity filter:**
- Critical — immediate action required
- High — address within 24 hours
- Medium — schedule for remediation
- Low — informational, address when convenient

**Status filter:**
- Open — newly detected, not yet acted on
- In Progress — being investigated or remediated
- Resolved — issue has been fixed
- Accepted Risk — acknowledged, accepted with justification

### 5.3 Managing Alert Lifecycle

**Alert types detected by the platform:**

| Alert Type | Description |
|------------|-------------|
| `PUBLIC_SENSITIVE_BUCKET` | Sensitive data in a publicly accessible bucket |
| `EXTERNAL_SHARED_CONFIDENTIAL` | Confidential data with external sharing enabled |
| `UNENCRYPTED_SENSITIVE_DB` | Sensitive database without encryption |
| `EXCESSIVE_ACCESS` | Too many users with privileged access |
| `SENSITIVE_IN_DEV` | Production sensitive data in non-production env |
| `NEW_SENSITIVE_ASSET` | Newly discovered asset with sensitive data |
| `DATA_DUPLICATION_RISK` | Sensitive data duplicated across locations |
| `RESIDENCY_VIOLATION` | Data stored outside allowed geographic region |
| `SERVICE_ACCOUNT_OVEREXPOSURE` | Service account with excessive permissions |
| `POLICY_VIOLATION` | Auto-generated from policy rule violations |

**Workflow actions (require `security_analyst`, `org_admin`, or `super_admin` role):**

1. **Update Status** — Move alert through the lifecycle (Open → In Progress → Resolved)
2. **Assign** — Assign to a specific user for investigation
3. **Add Comment** — Add notes, investigation findings, or discussion
4. **Create Remediation Task** — Create a tracked remediation work item

### 5.4 Remediation Tasks

Remediation tasks track the work needed to resolve an alert:

- **Title** and **Description** — what needs to be done
- **Action Type** — the category of remediation action
- **Assigned User** — who is responsible
- **Due Date** — target completion date
- **Status** — Pending → In Progress → Completed / Cancelled

---

## 6. Compliance

The Compliance page monitors your organization's adherence to regulatory frameworks and internal policies.

### 6.1 Compliance Coverage

Navigate to **Compliance** in the sidebar.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Compliance & Policy                                                    │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ ISO 27001        │  │ SOC 2            │  │ PCI DSS          │      │
│  │                  │  │                  │  │                  │      │
│  │ ████████████░░ 87%│ │ ██████████░░░ 76%│  │ ███████████░░ 85%│      │
│  │                  │  │                  │  │                  │      │
│  │ Rules: 24        │  │ Rules: 18        │  │ Rules: 12        │      │
│  │ Violations: 3    │  │ Violations: 4    │  │ Violations: 2    │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ DPDPA (India)    │  │ RBI Guidelines   │  │ GDPR             │      │
│  │                  │  │                  │  │                  │      │
│  │ ██████████████ 95%│ │ ████████░░░░ 62% │  │ █████████████ 92%│      │
│  │                  │  │                  │  │                  │      │
│  │ Rules: 15        │  │ Rules: 8         │  │ Rules: 20        │      │
│  │ Violations: 1    │  │ Violations: 3    │  │ Violations: 2    │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Progress bar colors:**
- **Green** (≥ 90%): Strong compliance
- **Yellow** (70–89%): Needs attention
- **Red** (< 70%): Significant gaps — prioritize remediation

**Supported compliance frameworks:**

| Framework | Description |
|-----------|-------------|
| ISO 27001 | Information security management |
| SOC 2 | Service organization controls |
| PCI DSS | Payment card industry data security |
| GDPR | EU General Data Protection Regulation |
| HIPAA | US healthcare data protection |
| DPDPA | India Digital Personal Data Protection Act |
| RBI | Reserve Bank of India guidelines |
| SEBI | Securities & Exchange Board of India |
| IRDAI | Insurance Regulatory & Development Authority of India |

### 6.2 Policy Violations

Below the framework cards, active policy violations are listed.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Policy Violations                                                      │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ CRITICAL   OPEN                                                  │   │
│  │ Sensitive data is publicly accessible: s3-public-reports         │   │
│  │ Detected: 2026-03-10 09:15                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ HIGH   OPEN                                                      │   │
│  │ Sensitive data stored without encryption: staging-user-dump      │   │
│  │ Detected: 2026-03-09 14:00                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ HIGH   EXCEPTION_APPROVED                                        │   │
│  │ Production sensitive data found in staging: staging-analytics    │   │
│  │ Detected: 2026-03-08 11:30                                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Built-in policy rules automatically evaluated:**

| Rule | Severity | What It Detects |
|------|----------|----------------|
| No publicly accessible sensitive data | CRITICAL | Sensitive assets with public exposure |
| Sensitive data must be encrypted | HIGH | Unencrypted assets containing sensitive data |
| No sensitive data in non-production | HIGH | Sensitive data in dev/test/staging environments |
| No external sharing of restricted data | CRITICAL | Restricted-classified data with external sharing |
| India data residency | HIGH | Aadhaar/PAN data stored outside India regions |

### 6.3 Approving Exceptions

When a violation represents an accepted business risk (requires `compliance_officer`, `org_admin`, or `super_admin` role):

1. Select the violation.
2. Choose **Approve Exception**.
3. Provide a justification reason.
4. The violation status changes to `EXCEPTION_APPROVED`.

---

## 7. Scans & Discovery

### 7.1 Creating a Scan

Scans can be triggered in two ways:

1. **Manual** — Click **Scan Now** on a connector card
2. **Scheduled** — Set a cron schedule on the connector (e.g., `0 2 * * *` for daily at 2 AM)

**Scan types available:**

| Type | Description | Best For |
|------|-------------|----------|
| `FULL` | Complete scan of all data in the source | Initial setup, periodic deep scan |
| `INCREMENTAL` | Only scan changes since last sync | Daily scheduled scans |
| `METADATA_ONLY` | Schema and metadata only, no content | Quick inventory refresh |
| `DEEP_CONTENT` | Full content analysis with sampling | Compliance audits |
| `SAMPLE_BASED` | Statistical sampling of content | Large data stores |

### 7.2 Monitoring Scan Progress

Each scan job tracks:

```
┌──────────────────────────────────────────┐
│  Scan Job: aws-s3-prod-20260310-0830     │
│                                          │
│  Status: RUNNING                         │
│  Progress: ████████░░░░  67%             │
│                                          │
│  Total Objects:    1,450                  │
│  Scanned:            971                  │
│  Errors:               3                 │
│                                          │
│  Started:  2026-03-10 08:30:12           │
│  Elapsed:  12m 34s                       │
│                                          │
│  [Pause]  [Cancel]                       │
└──────────────────────────────────────────┘
```

**Scan statuses:** QUEUED → RUNNING → COMPLETED / FAILED / CANCELLED

### 7.3 Viewing Discovered Assets

After a scan completes, view its discovered assets:

1. Navigate to the scan job.
2. Click **View Assets** to see everything discovered during that scan.
3. Discovered assets are automatically merged into the Asset Inventory.

---

## 8. Classification

The Classification Engine automatically identifies sensitive data patterns across your assets.

### 8.1 Classification Rules

The platform includes 15+ built-in classification rules:

| Category | Detection Pattern | Level |
|----------|------------------|-------|
| PAN (India) | `[A-Z]{5}[0-9]{4}[A-Z]` | Confidential |
| Aadhaar (India) | `[2-9]{1}[0-9]{3} [0-9]{4} [0-9]{4}` | Confidential |
| GSTIN | `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}...` | Confidential |
| IFSC Code | `[A-Z]{4}0[A-Z0-9]{6}` | Confidential |
| Passport | `[A-Z]{1}[0-9]{7}` | Confidential |
| Driving Licence | `[A-Z]{2}[0-9]{2} [0-9]{4} [0-9]{7}` | Confidential |
| Voter ID | `[A-Z]{3}[0-9]{7}` | Confidential |
| UPI ID | `user@provider` pattern | Confidential |
| Bank Account | 9–18 digit numbers | Confidential |
| CIN (Company) | `[UL][0-9]{5}[A-Z]{2}...` | Confidential |
| PII (Email) | Standard email pattern | Confidential |
| Financial (Cards) | Visa, MasterCard, Amex patterns | Confidential |
| Auth Secrets | `password=`, `api_key=` patterns | Confidential |
| Source Code Secrets | AWS `AKIA` key prefix | Confidential |

**Custom rules** can be created with:
- **Regex** patterns for structured data
- **Keyword** lists for contextual detection
- **Dictionary** lookups for reference data
- **ML/NLP** models for unstructured content

### 8.2 Viewing Classification Results

Classification results for an asset show:
- **Category** — type of sensitive data detected (PAN, Aadhaar, PII, etc.)
- **Classification Level** — PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, HIGHLY_SENSITIVE
- **Detection Method** — how it was found (regex, keyword, ML)
- **Confidence Score** — 0.0 to 1.0 (higher = more certain)
- **Sample Count** — number of matches found

### 8.3 Reporting False Positives

If a classification result is incorrect:

1. Navigate to the classification results for the asset.
2. Click **Mark as False Positive** on the specific result.
3. Optionally add feedback notes explaining why it's a false positive.
4. The result is excluded from future risk calculations and violation checks.

---

## 9. Identity & Access

Identity & Access analysis maps who has access to what sensitive data, identifying excessive permissions and risky access patterns.

### 9.1 Asset Access Summary

View the access summary for any asset:

```
┌──────────────────────────────────────────┐
│  Access Summary: prod-customer-db        │
│                                          │
│  Total Users:          45                │
│  Privileged Users:     12                │
│  External Users:        3                │
│  Service Accounts:      8                │
│  Public Exposure:      No                │
│                                          │
└──────────────────────────────────────────┘
```

### 9.2 Identity Sensitive Assets

View all sensitive assets accessible to a specific identity — useful for understanding the blast radius of a compromised account.

### 9.3 Access Findings

The platform automatically detects access anomalies:

| Finding Type | Description |
|-------------|-------------|
| `PUBLIC_ACCESS` | Asset is publicly accessible |
| `OVERLY_PERMISSIVE` | User has more permissions than needed |
| `STALE_ACCESS` | Access granted but not used recently |
| `ORPHANED_ACCOUNT` | Account exists but user has left the organization |
| `INACTIVE_PRIVILEGED` | Privileged account that hasn't been active |
| `EXTERNAL_COLLABORATOR` | External user with access to sensitive data |
| `ANONYMOUS_LINK` | Anonymous/shared link to sensitive content |
| `TOXIC_COMBINATION` | User has a dangerous combination of permissions |

---

## 10. Risk Management

### 10.1 Risk Summary

The Risk Summary provides an organization-wide view of risk distribution:

- **Overall Risk Score** — weighted average across all assets
- **Risk Level** — Critical, High, Medium, Low, Informational
- **Distribution** — count of assets at each risk level
- **Contributing Factors** — what drives the risk score up (exposure, encryption gaps, excessive access, sensitive data volume)
- **Recommended Remediations** — prioritized list of actions to reduce risk

### 10.2 Risk Trends

Track how your risk posture changes over time:

- View risk score trends by day, week, or month
- Compare across business units, connectors, or regions
- Identify if remediation efforts are reducing risk

---

## 11. Reports

### 11.1 Executive Summary

The Executive Summary report (also shown on the Dashboard) includes:

- Total assets scanned
- Sensitive asset count
- Critical risk assets
- Publicly exposed sensitive assets
- Top 10 risky data stores with scores
- Open alerts by severity
- Compliance coverage across frameworks

### 11.2 Creating Custom Reports

Generate reports in multiple formats:

**Report types:**

| Type | Contents |
|------|----------|
| `ASSET_INVENTORY` | Full asset catalog with classification and risk data |
| `COMPLIANCE` | Compliance posture across frameworks with violation details |
| `EXPOSURE` | Public and external exposure analysis |
| `SENSITIVE_DATA_LOCATION` | Map of where sensitive data resides |
| `ACCESS_EXPOSURE` | Identity and access risk analysis |
| `REMEDIATION_PROGRESS` | Status of remediation tasks and trends |
| `AUDIT_TRAIL` | Activity log for audit purposes |

**Export formats:** PDF, CSV, XLSX, JSON

---

## 12. Administration

### 12.1 User Management

Administrators (`org_admin` or `super_admin`) can manage users via the Admin API:

- **List Users** — view all users in the organization
- **Create User** — add new users with role assignment (password must meet complexity requirements)
- **View User** — see user details and role assignments
- **Deactivate User** — disable a user account (revokes access immediately)

### 12.2 Role-Based Access Control

TechD DSPM implements 7 system roles with graduated permissions:

| Role | Permissions |
|------|------------|
| **Super Admin** | Full system access, manage organizations, manage all users |
| **Org Admin** | Organization-level admin, manage users/connectors/policies |
| **Security Analyst** | Run scans, manage alerts, create remediation tasks |
| **Compliance Officer** | Manage policies, approve exceptions, view compliance reports |
| **Data Owner** | Manage ownership of assigned assets, view asset details |
| **Auditor** | Read-only access to audit logs, reports, and compliance data |
| **Read Only** | View-only access to dashboards and asset inventory |

### 12.3 API Token Management

For programmatic access and CI/CD integration:

1. Navigate to **Admin → API Tokens**.
2. Click **Create Token** with:
   - Token name
   - Expiration date
   - Scopes (what the token can access)
3. Copy the token immediately — it won't be shown again.
4. Use the token in API calls: `Authorization: Bearer <token>`
5. Revoke tokens at any time when no longer needed.

### 12.4 Audit Logs

Every action in the platform is logged (requires `auditor`, `org_admin`, or `super_admin` role):

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Audit Logs                                                             │
│                                                                         │
│  Filters: [Module ▼] [Action ▼] [User ▼] [From ▼] [To ▼]             │
│                                                                         │
│  2026-03-10 09:15:22  admin@co.com   connector.create   SUCCESS         │
│  2026-03-10 09:14:58  admin@co.com   auth.login         SUCCESS         │
│  2026-03-10 08:30:00  system         scan.start         SUCCESS         │
│  2026-03-09 22:00:00  system         scan.complete      SUCCESS         │
│  2026-03-09 18:45:12  analyst@co.com alert.assign       SUCCESS         │
│                                                                         │
│  [Export CSV]  [Export JSON]                                            │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**Logged information:**
- User who performed the action
- Action type and target module
- Resource type and ID affected
- IP address and user agent
- Status (success/failure)
- Timestamp

---

## 13. Keyboard Shortcuts & Tips

**Navigation tips:**
- Use the sidebar to switch between major sections
- Bookmark specific pages for quick access
- Use browser back/forward to navigate between views

**Productivity tips:**
- Set up scheduled scans to run nightly for continuous monitoring
- Use the "Sensitive" and "Exposed" asset filters daily to catch new risks
- Review Critical/High alerts first — they represent the highest business impact
- Assign owners to all assets to ensure accountability
- Tag assets with business metadata for easier filtering and reporting

**API usage tips:**
- Use API tokens for automated reporting and integration with SIEM/SOAR tools
- The API follows RESTful conventions with JSON request/response bodies
- All list endpoints support pagination with `page` and `page_size` parameters
- Filter parameters are passed as query strings

---

## 14. Troubleshooting

### Login Issues

| Problem | Solution |
|---------|----------|
| "Authentication failed" | Verify email and password. Password must be 12+ characters with mixed case, digits, and special characters. |
| "Too Many Requests" | You've been rate-limited. Wait 60 seconds and try again. |
| "Public registration is disabled" | Contact your administrator to create your account. |
| Redirected to login after navigating | Your session token has expired (1-hour lifetime). Log in again. |

### Connector Issues

| Problem | Solution |
|---------|----------|
| Connector shows "Failed" | Check credentials and network connectivity. View the error message on the connector card. |
| Scan stuck in "QUEUED" | Verify that Celery workers are running and connected to Redis. |
| "Connection failed" error | Ensure the data source is network-accessible from the DSPM backend. Internal/private IP addresses are blocked for security. |
| Partial access | The configured credentials may lack permissions for some resources. Check IAM roles and policies. |

### Data & Classification Issues

| Problem | Solution |
|---------|----------|
| Too many false positives | Use the "Mark as False Positive" feature with notes. Consider adjusting classification rule confidence thresholds. |
| Missing sensitive data | Check if classification rules are enabled. Verify the scan covered the relevant data stores. |
| Risk score seems wrong | Risk scores consider exposure, encryption, access permissions, and data sensitivity. Review all contributing factors. |

### General Issues

| Problem | Solution |
|---------|----------|
| Slow dashboard loading | Large organizations may have many assets. Use filters to narrow results. Check Elasticsearch and Redis health. |
| API returns 403 | Your role doesn't have permission for this action. Contact your administrator. |
| API returns 404 | The resource doesn't exist or belongs to a different organization (tenant isolation). |
| Changes not reflected | Some operations (scans, reports) run asynchronously. Refresh the page after a few seconds. |

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    TechD DSPM — Quick Reference                         │
│                                                                         │
│  LOGIN:     https://dspm.yourcompany.com                                │
│  API BASE:  https://dspm.yourcompany.com/api/v1                         │
│                                                                         │
│  DAILY TASKS                          WEEKLY TASKS                      │
│  ─────────                            ────────────                      │
│  □ Review Critical/High alerts        □ Review compliance coverage      │
│  □ Check publicly exposed assets      □ Audit stale/shadow data         │
│  □ Review new scan results            □ Review unowned assets           │
│  □ Update alert statuses              □ Generate executive report       │
│                                                                         │
│  MONTHLY TASKS                        ESCALATION PATH                   │
│  ─────────────                        ───────────────                   │
│  □ Full compliance audit              Critical → Security Team Lead     │
│  □ Review and rotate API tokens       High → Security Analyst           │
│  □ Audit user access and roles        Medium → Data Owner               │
│  □ Run deep content scans             Low → Scheduled maintenance       │
│                                                                         │
│  KEY CONTACTS                                                           │
│  ────────────                                                           │
│  Platform Admin:  admin@yourcompany.com                                 │
│  Security Team:   security@yourcompany.com                              │
│  Support:         dspm-support@yourcompany.com                          │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

*TechD DSPM v1.0 — Securing your data, one posture at a time.*
