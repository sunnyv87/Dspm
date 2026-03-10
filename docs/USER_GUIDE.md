# TechD DSPM — Application User Guide

> **Version:** 1.1 | **Last Updated:** March 2026
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
13. [AI Security Assistant](#13-ai-security-assistant)
    - [Overview & Data Residency](#131-overview--data-residency)
    - [Getting Started with AI Queries](#132-getting-started-with-ai-queries)
    - [Query Categories & Examples](#133-query-categories--examples)
    - [Understanding Responses](#134-understanding-responses)
    - [Follow-Up Queries](#135-follow-up-queries)
14. [Keyboard Shortcuts & Tips](#14-keyboard-shortcuts--tips)
15. [Troubleshooting](#15-troubleshooting)
16. [Appendix A: Connector Configuration Reference](#appendix-a-connector-configuration-reference)

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
│  ◉ Dashboard│  Compliance, or AI Assistant                   │
│  ○ Connectors│                                               │
│  ○ Assets  │                                                 │
│  ○ Alerts  │                                                 │
│  ○ Compliance│                                               │
│  ○ AI Assist│                                                │
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
| Sparkles | **AI Assistant** | Natural language query interface for CISO reporting |

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

> For a complete configuration reference for **all 59 connector types**, see [Appendix A: Connector Configuration Reference](#appendix-a-connector-configuration-reference) at the end of this guide.

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
| **Cloud Storage** | AWS S3, Azure Blob Storage, Azure Data Lake (ADLS), Google Cloud Storage, OneDrive, SharePoint Online, Google Drive, Box, Dropbox, Egnyte |
| **Relational Databases** | PostgreSQL, MySQL, MS SQL Server, Oracle, MariaDB, IBM Db2 |
| **NoSQL Databases** | MongoDB, Cassandra |
| **Data Warehouses** | Snowflake, BigQuery, Redshift, Azure Synapse Analytics, Databricks |
| **SaaS / Collaboration** | Microsoft 365, Microsoft Teams, Google Workspace, Gmail, Slack, Jira, Confluence, Salesforce |
| **On-Prem Storage** | HDFS, SMB/NFS shares, Local FS, On-Prem SharePoint |
| **Cloud Infrastructure** | AWS (IAM Role), Azure Subscription, Google Cloud Platform |
| **Identity & Access** | Azure Active Directory, AWS IAM, Google IAM, LDAP, Microsoft Active Directory, Okta, Ping Identity |
| **DevOps / Code Repos** | GitHub, GitLab, Bitbucket, Azure DevOps |
| **Security Platforms** | Forcepoint DLP, Splunk SIEM, IBM QRadar, SOAR, CASB |
| **Backup & Snapshot** | AWS EBS Snapshots, Azure VM Snapshots, Backup Repositories, Archive Storage (Glacier) |

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
| US SSN | `XXX-XX-XXXX` pattern | Confidential |
| Phone Number | International phone format | Confidential |
| Financial (Cards) | Visa, MasterCard, Amex patterns | Confidential |
| Auth Secrets | `password=`, `api_key=` patterns | Confidential |
| Source Code Secrets | AWS `AKIA` key prefix | Confidential |
| Private Key | `-----BEGIN PRIVATE KEY-----` | Restricted |
| GCP Service Account | `"type": "service_account"` in JSON | Restricted |
| Azure Client Secret | `client_secret=` or env var patterns | Restricted |
| GitHub Token | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_` prefixes | Restricted |
| Slack Token | `xoxb-`, `xoxp-`, `xoxa-` prefixes | Restricted |
| JWT Token | `eyJ...` three-segment Base64 pattern | Confidential |
| Database Connection String | `postgresql://`, `mongodb://` etc. | Restricted |
| SSH Key | `-----BEGIN OPENSSH PRIVATE KEY-----` | Restricted |
| Certificate | `-----BEGIN CERTIFICATE-----` | Confidential |

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

## 13. AI Security Assistant

The AI Security Assistant provides a **natural language query interface** that lets CISOs and security teams ask questions about their security posture in plain English. It translates questions into internal database queries and returns structured, actionable reports.

> **Data Residency Guarantee:** All query processing happens locally within your infrastructure. No data is sent to external AI services, third-party APIs, or cloud-based LLMs. The engine uses rule-based NLP pattern matching that runs entirely on your backend server.

### 13.1 Overview & Data Residency

Navigate to **AI Assistant** in the sidebar (sparkles icon).

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✦ AI Security Assistant                          [● Data stays local] │
│                                                                         │
│  Ask questions about your security posture in plain English.            │
│  All processing stays on-premise.                                       │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │           ✦                                                     │    │
│  │                                                                 │    │
│  │     Ask me anything about your security posture                 │    │
│  │                                                                 │    │
│  │     I can answer questions about risk, alerts, compliance,      │    │
│  │     data exposure, identity access, and more. All data is       │    │
│  │     processed locally — nothing leaves your cloud.              │    │
│  │                                                                 │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │    │
│  │  │Executive Overview│ │Risk & Threats   │ │Data Exposure    │   │    │
│  │  │                 │ │                 │ │                 │   │    │
│  │  │ What is our     │ │ Show me all     │ │ Are any assets  │   │    │
│  │  │ overall posture?│ │ critical alerts │ │ publicly exposed│   │    │
│  │  │                 │ │                 │ │                 │   │    │
│  │  │ Give me an      │ │ What is our     │ │ Show me shadow  │   │    │
│  │  │ exec summary    │ │ risk trend?     │ │ data stores     │   │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘   │    │
│  │                                                                 │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │    │
│  │  │Compliance       │ │Identity & Access│ │Infrastructure   │   │    │
│  │  │                 │ │                 │ │                 │   │    │
│  │  │ GDPR compliance │ │ Any excessive   │ │ Are all         │   │    │
│  │  │ status?         │ │ access findings?│ │ connectors OK?  │   │    │
│  │  │                 │ │                 │ │                 │   │    │
│  │  │ Show policy     │ │ Show toxic      │ │ When was the    │   │    │
│  │  │ violations      │ │ permissions     │ │ last scan?      │   │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘   │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐  [Ask] │
│  │ Ask about your security posture...                          │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

**How it works (all on-premise):**

1. You type a question in plain English
2. The backend parses your query using rule-based NLP (regex pattern matching + entity extraction)
3. The detected intent is mapped to internal database queries
4. Results are formatted into a CISO-friendly narrative with structured data
5. The response is displayed with rich visualizations (tables, charts, badges)

**No external calls are made at any point.** The NLP engine, database queries, and response formatting all execute within your infrastructure.

### 13.2 Getting Started with AI Queries

Click any suggested query on the welcome screen, or type your own question in the input box.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ✦ AI Security Assistant                          [● Data stays local] │
│                                                                         │
│                           ┌──────────────────────────────────────┐      │
│                           │ What is our overall security posture?│      │
│                           └──────────────────────────────────────┘      │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Across 1,247 scanned data assets, 342 contain sensitive data.   │   │
│  │ 28 assets are at critical risk level and require immediate      │   │
│  │ attention. **12 sensitive assets are publicly exposed** — this  │   │
│  │ is the highest priority to remediate. There are 59 open alerts  │   │
│  │ (5 critical).                                                   │   │
│  │                                                                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │  1,247   │ │   342    │ │    28    │ │    12    │          │   │
│  │  │  Total   │ │ Sensitive│ │ Critical │ │ Exposed  │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │   │
│  │                                                                 │   │
│  │  █████████████████████████████████████████████████               │   │
│  │  ■ Critical: 28  ■ High: 67  ■ Medium: 185  ■ Low: 967        │   │
│  │                                                                 │   │
│  │  Top Risky Data Stores                                          │   │
│  │  prod-customer-db       ████████████████████ 95                 │   │
│  │  s3-public-reports      ██████████████████   88                 │   │
│  │  analytics-warehouse    ████████████████     82                 │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────┐       │   │
│  │  │ Recommended Actions                                  │       │   │
│  │  │ • URGENT: Revoke public access on 12 exposed assets  │       │   │
│  │  │ • Address 5 critical alerts within 24 hours          │       │   │
│  │  │ • Review 28 critical-risk assets for encryption      │       │   │
│  │  └──────────────────────────────────────────────────────┘       │   │
│  │                                                                 │   │
│  │  Follow-up:                                                     │   │
│  │  [Show me all critical alerts]  [Which assets are exposed?]     │   │
│  │  [What is the risk trend this month?]                           │   │
│  │                                                                 │   │
│  │  executive_summary (90% confidence)                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐  [Ask] │
│  │ Ask about your security posture...                          │        │
│  └─────────────────────────────────────────────────────────────┘        │
│                                                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### 13.3 Query Categories & Examples

The AI Assistant understands **25+ intent types** across 6 categories. You can phrase questions naturally — the engine recognizes many variations.

| Category | Example Queries | What You Get |
|----------|----------------|--------------|
| **Executive Overview** | "What is our overall security posture?" | KPI metrics, risk distribution, top risky stores, recommendations |
| | "Give me an executive summary" | |
| | "How are we doing on risk?" | |
| **Risk & Threats** | "Show me all critical alerts" | Filtered alert list with severity breakdown and remediation steps |
| | "What is our risk trend this month?" | Risk score chart over time with trend direction |
| | "Which assets are at critical risk?" | Asset table sorted by risk score |
| **Data Exposure** | "Are any sensitive assets publicly exposed?" | Exposed assets with risk scores, sensitivity counts, owners |
| | "Show me shadow data stores" | Unmanaged/untracked data stores |
| | "Which assets have no owner?" | Unowned assets needing accountability assignment |
| | "How many sensitive assets do we have?" | Sensitive asset inventory with classification breakdown |
| **Compliance** | "What is our GDPR compliance status?" | Framework-specific coverage %, violation count, gap analysis |
| | "Show all policy violations" | Violation list with severity, status, and affected assets |
| | "How are we on DPDPA compliance?" | India-specific regulatory coverage |
| | "What is our ISO 27001 coverage?" | Framework card with rules and violations |
| **Identity & Access** | "Any excessive access findings?" | Permission issues: overly permissive, stale, toxic combinations |
| | "Show toxic permission combinations" | Dangerous permission pairings detected |
| | "Are there orphaned accounts?" | Accounts belonging to departed users |
| **Infrastructure** | "Are all connectors healthy?" | Connector status table with error details |
| | "When was the last scan?" | Latest scan progress, status, and object counts |
| | "Which connectors are failing?" | Failed connectors with error messages |

**Entity extraction — the engine understands context modifiers:**

| Modifier | Examples | Effect |
|----------|----------|--------|
| **Severity** | "critical alerts", "high priority issues", "P1 incidents" | Filters by severity level |
| **Status** | "open violations", "resolved alerts", "in progress" | Filters by status |
| **Framework** | "GDPR", "SOC2", "DPDPA", "RBI", "PCI DSS" | Filters to specific framework |
| **Environment** | "production assets", "staging data", "dev databases" | Filters by environment |
| **Region** | "India data", "EU assets", "ap-south region" | Filters by geography |
| **Limit** | "top 5 risky stores", "show first 10" | Limits result count |
| **Format** | "export as PDF", "generate CSV report" | Specifies report format |

### 13.4 Understanding Responses

Every response includes:

| Component | Description |
|-----------|-------------|
| **Narrative** | Plain English summary with bold highlights for critical information |
| **Metrics** | Color-coded stat cards (blue, yellow, red) for key numbers |
| **Distribution bars** | Visual risk/severity breakdown with color coding |
| **Data tables** | Assets, alerts, violations, findings, or connectors as appropriate |
| **Severity badges** | Color-coded pills: red (critical), orange (high), yellow (medium), green (low) |
| **Trend charts** | Mini bar charts showing risk score over time |
| **Framework cards** | Compliance coverage with progress bars and violation counts |
| **Recommendations** | Prioritized action items in an amber highlight box |
| **Confidence** | Intent classification confidence (shown at bottom of response) |
| **Follow-up chips** | Clickable suggestions for the next logical question |

**Response color coding:**

| Color | Meaning |
|-------|---------|
| Red | Critical risk / critical severity — immediate action needed |
| Orange | High risk / high severity — address within 24 hours |
| Yellow | Medium risk — schedule for remediation |
| Green | Low risk / healthy — maintain current controls |
| Amber background | Recommended actions box |

### 13.5 Follow-Up Queries

After each response, the assistant suggests **contextual follow-up questions** as clickable chips. Click any chip to automatically send that query.

**Follow-up flow examples:**

```
"What is our overall security posture?"
  └→ "Show me all critical alerts"
       └→ "Which assets are publicly exposed?"
            └→ "What remediations are in progress?"

"What is our compliance coverage?"
  └→ "Show all policy violations"
       └→ "Which assets have critical violations?"
            └→ "Show risk summary"

"Are all connectors healthy?"
  └→ "When was the last scan?"
       └→ "Show executive summary"
```

This guided flow helps CISOs drill down from high-level posture to specific issues without needing to know exact query syntax.

---

## 14. Keyboard Shortcuts & Tips

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
- Use the **AI Assistant** to quickly query security posture in plain English — ideal for board prep and CISO briefs

**API usage tips:**
- Use API tokens for automated reporting and integration with SIEM/SOAR tools
- The API follows RESTful conventions with JSON request/response bodies
- All list endpoints support pagination with `page` and `page_size` parameters
- Filter parameters are passed as query strings

---

## 15. Troubleshooting

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

### AI Assistant Issues

| Problem | Solution |
|---------|----------|
| "I couldn't determine the exact intent" | Rephrase your question using keywords from the suggested examples. The engine uses pattern matching — simpler phrasing works better. |
| Low confidence score | Try more direct phrasing: "show critical alerts" instead of "I was wondering if there might be some alerts". |
| No data in response | Ensure scans have been run and data exists. The AI queries the same database as the rest of the platform. |
| Worried about data leaving infra | All processing is local. The "Data stays local" badge confirms no external API calls. The NLP engine is rule-based regex, not a cloud LLM. |

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
│  □ Ask AI: "What is our posture?"     □ Ask AI: "Risk trend this week?" │
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

*TechD DSPM v1.1 — Securing your data, one posture at a time.*

---

## Appendix A: Connector Configuration Reference

Complete configuration reference for all **59 connector types** across 10 categories. Each entry shows the connector type string (used in API calls), required config fields, required credentials, and what the connector discovers.

---

### A.1 Cloud Storage Connectors (10 types)

These connectors scan unstructured files, objects, and storage buckets.

#### AWS S3

| Field | Value |
|-------|-------|
| **Type** | `aws_s3` |
| **Credential Type** | `iam_role` or `api_key` |
| **Config** | `region` (string, default: `us-east-1`) |
| **Credentials** | `access_key`, `secret_key` — or use IAM role ARN |
| **Discovers** | Buckets, objects, metadata, ACLs, encryption status |
| **Scans** | Object content (first 64KB per file, samples from each bucket) |

```json
{
  "config": { "region": "ap-south-1" },
  "credentials": [
    { "key_name": "access_key", "value": "AKIA..." },
    { "key_name": "secret_key", "value": "wJa..." }
  ]
}
```

#### Azure Blob Storage

| Field | Value |
|-------|-------|
| **Type** | `azure_blob` |
| **Credential Type** | `api_key` or `service_principal` |
| **Config** | *(none required — connection string contains account info)* |
| **Credentials** | `connection_string` |
| **Discovers** | Containers, blobs, public access settings |
| **Scans** | Blob content (first 64KB per blob, 5 samples per container) |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "connection_string", "value": "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=..." }
  ]
}
```

#### Azure Data Lake Storage (ADLS)

| Field | Value |
|-------|-------|
| **Type** | `adls` |
| **Credential Type** | `api_key` |
| **Config** | `storage_account` (string) — your ADLS Gen2 storage account name |
| **Credentials** | `access_key` — storage account key |
| **Discovers** | File systems, directories, files |
| **Scans** | File content (first 64KB per file, 5 samples per file system) |

```json
{
  "config": { "storage_account": "mydatalake" },
  "credentials": [
    { "key_name": "access_key", "value": "AbCdEf..." }
  ]
}
```

#### Google Cloud Storage

| Field | Value |
|-------|-------|
| **Type** | `gcs` |
| **Credential Type** | `service_principal` |
| **Config** | `project_id` (string) — GCP project ID |
| **Credentials** | Service account JSON (set via `GOOGLE_APPLICATION_CREDENTIALS` env var) |
| **Discovers** | Buckets, objects, IAM policies, KMS encryption |
| **Scans** | Object content (first 64KB per blob, 5 samples per bucket) |

```json
{
  "config": { "project_id": "my-gcp-project" },
  "credentials": []
}
```

#### Microsoft OneDrive

| Field | Value |
|-------|-------|
| **Type** | `onedrive` |
| **Credential Type** | `oauth2` |
| **Config** | `user_id` (string, optional — defaults to `me`) |
| **Credentials** | `access_token` — Microsoft Graph OAuth2 token |
| **Required Scopes** | `Files.Read.All`, `User.Read` |
| **Discovers** | Files, folders, sharing status |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": { "user_id": "me" },
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### SharePoint Online

| Field | Value |
|-------|-------|
| **Type** | `sharepoint_online` |
| **Credential Type** | `oauth2` |
| **Config** | `site_url` (string) — e.g. `contoso.sharepoint.com:/sites/team`, `site_id` (string) |
| **Credentials** | `access_token` — Microsoft Graph OAuth2 token |
| **Required Scopes** | `Sites.Read.All`, `Files.Read.All` |
| **Discovers** | Document libraries, files, folders, sharing links |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": {
    "site_url": "contoso.sharepoint.com:/sites/team",
    "site_id": "abc123-def456"
  },
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### Google Drive

| Field | Value |
|-------|-------|
| **Type** | `google_drive` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Google OAuth2 token |
| **Required Scopes** | `drive.readonly` |
| **Discovers** | Files, folders, sharing status, MIME types |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "ya29.a0..." }
  ]
}
```

#### Box

| Field | Value |
|-------|-------|
| **Type** | `box` |
| **Credential Type** | `oauth2` |
| **Config** | `folder_id` (string, optional — defaults to `0` for root) |
| **Credentials** | `access_token` — Box OAuth2 token |
| **Discovers** | Files, folders, shared links, access levels |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": { "folder_id": "0" },
  "credentials": [
    { "key_name": "access_token", "value": "abc123..." }
  ]
}
```

#### Dropbox

| Field | Value |
|-------|-------|
| **Type** | `dropbox` |
| **Credential Type** | `oauth2` |
| **Config** | `folder_path` (string, optional — defaults to `""` for root) |
| **Credentials** | `access_token` — Dropbox OAuth2 token |
| **Discovers** | Files, folders, sharing info |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": { "folder_path": "/Shared" },
  "credentials": [
    { "key_name": "access_token", "value": "sl.B..." }
  ]
}
```

#### Egnyte

| Field | Value |
|-------|-------|
| **Type** | `egnyte` |
| **Credential Type** | `oauth2` |
| **Config** | `domain` (string) — e.g. `company.egnyte.com`, `folder_path` (string, optional — defaults to `/Shared`) |
| **Credentials** | `access_token` — Egnyte OAuth2 token |
| **Discovers** | Files, folders in specified path |
| **Scans** | File content download (first 64KB) |

```json
{
  "config": {
    "domain": "company.egnyte.com",
    "folder_path": "/Shared/Finance"
  },
  "credentials": [
    { "key_name": "access_token", "value": "abc123..." }
  ]
}
```

---

### A.2 Database Connectors (8 types)

These connectors scan structured data inside relational and NoSQL databases for PII, financial data, and secrets.

#### PostgreSQL

| Field | Value |
|-------|-------|
| **Type** | `postgresql` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 5432), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns with data types |
| **Scans** | Row samples (first 50 rows per table), column-level classification |

```json
{
  "config": { "host": "prod-db.example.com", "port": 5432, "database": "customers" },
  "credentials": [
    { "key_name": "username", "value": "dspm_reader" },
    { "key_name": "password", "value": "s3cur3P@ss" }
  ]
}
```

#### MySQL

| Field | Value |
|-------|-------|
| **Type** | `mysql` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 3306), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "mysql.internal.com", "port": 3306, "database": "webapp" },
  "credentials": [
    { "key_name": "username", "value": "dspm_scan" },
    { "key_name": "password", "value": "p@ssw0rd" }
  ]
}
```

#### Microsoft SQL Server

| Field | Value |
|-------|-------|
| **Type** | `mssql` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 1433), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "sqlserver.corp.com", "port": 1433, "database": "ERP" },
  "credentials": [
    { "key_name": "username", "value": "sa_dspm" },
    { "key_name": "password", "value": "Str0ngP@ss!" }
  ]
}
```

#### Oracle Database

| Field | Value |
|-------|-------|
| **Type** | `oracle` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 1521), `database` (string — SID or service name) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "oracle.corp.com", "port": 1521, "database": "ORCL" },
  "credentials": [
    { "key_name": "username", "value": "dspm_user" },
    { "key_name": "password", "value": "Or@cleP@ss" }
  ]
}
```

#### MariaDB

| Field | Value |
|-------|-------|
| **Type** | `mariadb` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 3306), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "mariadb.internal.com", "port": 3306, "database": "app_data" },
  "credentials": [
    { "key_name": "username", "value": "dspm_scan" },
    { "key_name": "password", "value": "p@ssw0rd" }
  ]
}
```

#### IBM Db2

| Field | Value |
|-------|-------|
| **Type** | `db2` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string), `port` (int, default: 50000), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "db2.corp.com", "port": 50000, "database": "SAMPLE" },
  "credentials": [
    { "key_name": "username", "value": "db2admin" },
    { "key_name": "password", "value": "Db2P@ss!" }
  ]
}
```

#### MongoDB

| Field | Value |
|-------|-------|
| **Type** | `mongodb` |
| **Credential Type** | `username_password` or `api_key` |
| **Config** | `host` (string), `port` (int, default: 27017), `database` (string, optional) |
| **Credentials** | `username`, `password` — or `connection_string` for Atlas/replica sets |
| **Discovers** | Databases, collections, document structure, collection stats |
| **Scans** | Document samples (first 50 documents per collection, JSON serialized) |

```json
{
  "config": { "host": "mongo.internal.com", "port": 27017 },
  "credentials": [
    { "key_name": "connection_string", "value": "mongodb+srv://user:pass@cluster.mongodb.net" }
  ]
}
```

#### Cassandra

| Field | Value |
|-------|-------|
| **Type** | `cassandra` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string — contact point), `port` (int, default: 9042) |
| **Credentials** | `username`, `password` (optional for auth-disabled clusters) |
| **Discovers** | Keyspaces, tables, column definitions |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": { "host": "cassandra-node1.internal.com", "port": 9042 },
  "credentials": [
    { "key_name": "username", "value": "cassandra" },
    { "key_name": "password", "value": "cassandra" }
  ]
}
```

---

### A.3 Data Warehouse Connectors (6 types)

These connectors scan large analytics platforms and data lakes.

#### Snowflake

| Field | Value |
|-------|-------|
| **Type** | `snowflake` |
| **Credential Type** | `username_password` |
| **Config** | `account` (string — e.g. `xy12345.ap-south-1`), `warehouse` (string), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, column types, row counts |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": {
    "account": "xy12345.ap-south-1",
    "warehouse": "COMPUTE_WH",
    "database": "ANALYTICS"
  },
  "credentials": [
    { "key_name": "username", "value": "DSPM_SERVICE" },
    { "key_name": "password", "value": "Sn0wP@ss!" }
  ]
}
```

#### Google BigQuery

| Field | Value |
|-------|-------|
| **Type** | `bigquery` |
| **Credential Type** | `service_principal` |
| **Config** | `project_id` (string) |
| **Credentials** | Service account JSON (set via `GOOGLE_APPLICATION_CREDENTIALS` env var) |
| **Discovers** | Datasets, tables, schemas, row counts, byte sizes, encryption |
| **Scans** | Row samples (first 50 rows per table via SQL query) |

```json
{
  "config": { "project_id": "my-analytics-project" },
  "credentials": []
}
```

#### Amazon Redshift

| Field | Value |
|-------|-------|
| **Type** | `redshift` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string — cluster endpoint), `port` (int, default: 5439), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns, row counts |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": {
    "host": "my-cluster.abc123.ap-south-1.redshift.amazonaws.com",
    "port": 5439,
    "database": "warehouse"
  },
  "credentials": [
    { "key_name": "username", "value": "dspm_reader" },
    { "key_name": "password", "value": "R3dsh1ft!" }
  ]
}
```

#### Azure Synapse Analytics

| Field | Value |
|-------|-------|
| **Type** | `azure_synapse` |
| **Credential Type** | `username_password` |
| **Config** | `host` (string — e.g. `myworkspace.sql.azuresynapse.net`), `port` (int, default: 1433), `database` (string) |
| **Credentials** | `username`, `password` |
| **Discovers** | Schemas, tables, columns |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": {
    "host": "myworkspace.sql.azuresynapse.net",
    "port": 1433,
    "database": "synapse_pool"
  },
  "credentials": [
    { "key_name": "username", "value": "sqladmin" },
    { "key_name": "password", "value": "Syn@ps3P@ss" }
  ]
}
```

#### Databricks

| Field | Value |
|-------|-------|
| **Type** | `databricks` |
| **Credential Type** | `api_key` |
| **Config** | `host` (string — workspace URL), `http_path` (string — SQL warehouse path) |
| **Credentials** | `access_token` — Databricks personal access token |
| **Discovers** | Databases/catalogs, tables, column types, row counts |
| **Scans** | Row samples (first 50 rows per table) |

```json
{
  "config": {
    "host": "adb-123456789.0.azuredatabricks.net",
    "http_path": "/sql/1.0/warehouses/abc123"
  },
  "credentials": [
    { "key_name": "access_token", "value": "dapi123abc..." }
  ]
}
```

#### Hadoop HDFS

| Field | Value |
|-------|-------|
| **Type** | `hdfs` |
| **Credential Type** | `username_password` |
| **Config** | `namenode_url` (string — WebHDFS endpoint, e.g. `http://namenode:9870`), `scan_path` (string, default: `/`) |
| **Credentials** | `username` (string — HDFS user, default: `hdfs`) |
| **Discovers** | Directories, files, sizes, owners, permissions |
| **Scans** | File content (first 64KB via WebHDFS OPEN) |

```json
{
  "config": {
    "namenode_url": "http://namenode.internal.com:9870",
    "scan_path": "/data/warehouse"
  },
  "credentials": [
    { "key_name": "username", "value": "hdfs" }
  ]
}
```

---

### A.4 SaaS / Collaboration Connectors (8 types)

These connectors scan documents, messages, and shared content in SaaS platforms.

#### Microsoft 365

| Field | Value |
|-------|-------|
| **Type** | `microsoft_365` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Microsoft Graph OAuth2 token (app-level) |
| **Required Scopes** | `Sites.Read.All`, `Files.Read.All`, `User.Read.All` |
| **Discovers** | SharePoint sites, user OneDrives |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### Microsoft Teams

| Field | Value |
|-------|-------|
| **Type** | `microsoft_teams` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Microsoft Graph OAuth2 token |
| **Required Scopes** | `Group.Read.All`, `ChannelMessage.Read.All` |
| **Discovers** | Teams, channels |
| **Scans** | Channel message content (last 50 messages per channel) |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### Google Workspace

| Field | Value |
|-------|-------|
| **Type** | `google_workspace` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Google OAuth2 token with admin directory + Drive access |
| **Required Scopes** | `admin.directory.user.readonly`, `drive.readonly` |
| **Discovers** | User Drive files, shared documents |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "ya29.a0..." }
  ]
}
```

#### Gmail

| Field | Value |
|-------|-------|
| **Type** | `gmail` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Google OAuth2 token |
| **Required Scopes** | `gmail.readonly` |
| **Discovers** | Labels (folders) |
| **Scans** | Email body content (first 10 messages per label, first 4KB each) |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "ya29.a0..." }
  ]
}
```

#### Slack

| Field | Value |
|-------|-------|
| **Type** | `slack` |
| **Credential Type** | `api_key` |
| **Config** | *(none required)* |
| **Credentials** | `bot_token` or `access_token` — Slack Bot/User OAuth token |
| **Required Scopes** | `channels:read`, `channels:history`, `groups:read`, `groups:history` |
| **Discovers** | Public and private channels |
| **Scans** | Message history (last 50 messages per channel) |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "bot_token", "value": "xoxb-123456-789012-AbCdEf" }
  ]
}
```

#### Jira

| Field | Value |
|-------|-------|
| **Type** | `jira` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — e.g. `https://company.atlassian.net`) |
| **Credentials** | `email` (string), `api_token` (string — Atlassian API token) |
| **Discovers** | Projects |
| **Scans** | Issue summaries, descriptions, and comments (first 50 per project) |

```json
{
  "config": { "base_url": "https://company.atlassian.net" },
  "credentials": [
    { "key_name": "email", "value": "admin@company.com" },
    { "key_name": "api_token", "value": "ATATT3x..." }
  ]
}
```

#### Confluence

| Field | Value |
|-------|-------|
| **Type** | `confluence` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — e.g. `https://company.atlassian.net`) |
| **Credentials** | `email` (string), `api_token` (string — Atlassian API token) |
| **Discovers** | Spaces |
| **Scans** | Page titles and body content (first 25 pages per space) |

```json
{
  "config": { "base_url": "https://company.atlassian.net" },
  "credentials": [
    { "key_name": "email", "value": "admin@company.com" },
    { "key_name": "api_token", "value": "ATATT3x..." }
  ]
}
```

#### Salesforce

| Field | Value |
|-------|-------|
| **Type** | `salesforce` |
| **Credential Type** | `oauth2` |
| **Config** | `instance_url` (string — e.g. `https://mycompany.salesforce.com`) |
| **Credentials** | `access_token` — Salesforce OAuth2 token |
| **Discovers** | SObjects (queryable objects like Account, Contact, Lead, etc.) |
| **Scans** | Record samples (first 50 records, first 20 fields per object) |

```json
{
  "config": { "instance_url": "https://mycompany.salesforce.com" },
  "credentials": [
    { "key_name": "access_token", "value": "00D..." }
  ]
}
```

---

### A.5 On-Prem Storage Connectors (4 types)

These connectors scan internal enterprise file storage.

#### Windows File Server (SMB)

| Field | Value |
|-------|-------|
| **Type** | `smb` |
| **Credential Type** | `username_password` |
| **Config** | `server` (string — hostname/IP), `share` (string — share name) |
| **Credentials** | `username` (string — `DOMAIN\user` format), `password` |
| **Discovers** | Files, folders, sizes |
| **Scans** | File content (first 64KB per file) |

```json
{
  "config": { "server": "fileserver.corp.com", "share": "Finance" },
  "credentials": [
    { "key_name": "username", "value": "CORP\\dspm_scanner" },
    { "key_name": "password", "value": "Sm8P@ss!" }
  ]
}
```

#### NFS File Share

| Field | Value |
|-------|-------|
| **Type** | `nfs` |
| **Credential Type** | `username_password` |
| **Config** | `mount_path` (string — local mount point where NFS is mounted) |
| **Credentials** | *(none — uses OS-level NFS mount permissions)* |
| **Discovers** | Files, folders, sizes, permissions |
| **Scans** | File content (first 64KB per file) |

> **Prerequisite:** The NFS share must be mounted on the DSPM backend server before configuring the connector.

```json
{
  "config": { "mount_path": "/mnt/nfs/shared_data" },
  "credentials": []
}
```

#### Local File System

| Field | Value |
|-------|-------|
| **Type** | `local_fs` |
| **Credential Type** | `username_password` |
| **Config** | `base_path` (string — directory to scan) |
| **Credentials** | *(none — uses backend process permissions)* |
| **Discovers** | Files, folders, sizes |
| **Scans** | File content (first 64KB per file) |

```json
{
  "config": { "base_path": "/data/exports" },
  "credentials": []
}
```

#### On-Prem SharePoint

| Field | Value |
|-------|-------|
| **Type** | `on_prem_sharepoint` |
| **Credential Type** | `username_password` |
| **Config** | `site_url` (string — e.g. `http://sharepoint.corp.com/sites/hr`) |
| **Credentials** | `username`, `password` — Active Directory credentials |
| **Discovers** | Document libraries, list items |
| **Scans** | List item content (first 50 items per library) |

```json
{
  "config": { "site_url": "http://sharepoint.corp.com/sites/hr" },
  "credentials": [
    { "key_name": "username", "value": "CORP\\dspm_user" },
    { "key_name": "password", "value": "Sp0nPr3m!" }
  ]
}
```

---

### A.6 Cloud Infrastructure Connectors (3 types)

These connectors discover all data stores across entire cloud accounts/subscriptions.

#### AWS Cloud (Full Account Discovery)

| Field | Value |
|-------|-------|
| **Type** | `aws_cloud` |
| **Credential Type** | `iam_role` or `api_key` |
| **Config** | `region` (string, default: `us-east-1`) |
| **Credentials** | `access_key`, `secret_key` |
| **Discovers** | S3 buckets, RDS instances, DynamoDB tables, Redshift clusters, EBS snapshots |

```json
{
  "config": { "region": "ap-south-1" },
  "credentials": [
    { "key_name": "access_key", "value": "AKIA..." },
    { "key_name": "secret_key", "value": "wJa..." }
  ]
}
```

#### Azure Subscription (Full Subscription Discovery)

| Field | Value |
|-------|-------|
| **Type** | `azure_subscription` |
| **Credential Type** | `service_principal` |
| **Config** | `subscription_id` (string) |
| **Credentials** | `access_token` — Azure Management API Bearer token |
| **Discovers** | Storage accounts, SQL servers, Cosmos DB accounts, VM snapshots |

```json
{
  "config": { "subscription_id": "abc12345-def6-7890-ghij-klmnopqrstuv" },
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### Google Cloud Platform (Full Project Discovery)

| Field | Value |
|-------|-------|
| **Type** | `gcp_cloud` |
| **Credential Type** | `service_principal` |
| **Config** | `project_id` (string) |
| **Credentials** | `access_token` — GCP OAuth2 token |
| **Discovers** | Cloud Storage buckets, Cloud SQL instances, BigQuery datasets |

```json
{
  "config": { "project_id": "my-gcp-project" },
  "credentials": [
    { "key_name": "access_token", "value": "ya29.a0..." }
  ]
}
```

---

### A.7 Identity & Access Management Connectors (7 types)

These connectors map who has access to sensitive data by importing users, groups, roles, and permissions.

#### Azure Active Directory

| Field | Value |
|-------|-------|
| **Type** | `azure_ad` |
| **Credential Type** | `oauth2` |
| **Config** | *(none required)* |
| **Credentials** | `access_token` — Microsoft Graph OAuth2 token |
| **Required Scopes** | `User.Read.All`, `Group.Read.All`, `Application.Read.All` |
| **Discovers** | Users (active/disabled), groups, service principals |

```json
{
  "config": {},
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### AWS IAM

| Field | Value |
|-------|-------|
| **Type** | `aws_iam` |
| **Credential Type** | `iam_role` or `api_key` |
| **Config** | `region` (string, default: `us-east-1`) |
| **Credentials** | `access_key`, `secret_key` |
| **Required Permissions** | `iam:ListUsers`, `iam:ListRoles`, `iam:ListGroups`, `iam:GetAccountSummary` |
| **Discovers** | IAM users, roles, groups with ARNs |

```json
{
  "config": { "region": "us-east-1" },
  "credentials": [
    { "key_name": "access_key", "value": "AKIA..." },
    { "key_name": "secret_key", "value": "wJa..." }
  ]
}
```

#### Google IAM

| Field | Value |
|-------|-------|
| **Type** | `google_iam` |
| **Credential Type** | `service_principal` |
| **Config** | `project_id` (string) |
| **Credentials** | `access_token` — GCP OAuth2 token |
| **Required Permissions** | `resourcemanager.projects.getIamPolicy`, `iam.serviceAccounts.list` |
| **Discovers** | IAM policy bindings (members + roles), service accounts |

```json
{
  "config": { "project_id": "my-gcp-project" },
  "credentials": [
    { "key_name": "access_token", "value": "ya29.a0..." }
  ]
}
```

#### LDAP

| Field | Value |
|-------|-------|
| **Type** | `ldap` |
| **Credential Type** | `username_password` |
| **Config** | `server` (string — LDAP server hostname), `port` (int, default: 389), `base_dn` (string — search base, e.g. `DC=corp,DC=com`) |
| **Credentials** | `bind_dn` (string — e.g. `CN=dspm,OU=Service Accounts,DC=corp,DC=com`), `password` |
| **Discovers** | User objects (cn, mail, sAMAccountName) |

```json
{
  "config": {
    "server": "ldap.corp.com",
    "port": 389,
    "base_dn": "DC=corp,DC=com"
  },
  "credentials": [
    { "key_name": "bind_dn", "value": "CN=dspm_svc,OU=ServiceAccounts,DC=corp,DC=com" },
    { "key_name": "password", "value": "Ld@pP@ss!" }
  ]
}
```

#### Microsoft Active Directory

| Field | Value |
|-------|-------|
| **Type** | `microsoft_ad` |
| **Credential Type** | `username_password` |
| **Config** | Same as LDAP — `server`, `port` (default: 389), `base_dn` |
| **Credentials** | `bind_dn`, `password` |
| **Discovers** | AD user objects, same as LDAP with AD-specific defaults |

```json
{
  "config": {
    "server": "dc01.corp.com",
    "port": 389,
    "base_dn": "DC=corp,DC=com"
  },
  "credentials": [
    { "key_name": "bind_dn", "value": "CN=dspm_svc,OU=ServiceAccounts,DC=corp,DC=com" },
    { "key_name": "password", "value": "AdP@ss!" }
  ]
}
```

#### Okta

| Field | Value |
|-------|-------|
| **Type** | `okta` |
| **Credential Type** | `api_key` |
| **Config** | `domain` (string — e.g. `company.okta.com`) |
| **Credentials** | `api_token` — Okta Admin API token |
| **Required Permissions** | Super admin or custom admin with User/Group/App read scopes |
| **Discovers** | Users (with status), groups, applications |

```json
{
  "config": { "domain": "company.okta.com" },
  "credentials": [
    { "key_name": "api_token", "value": "00abc123..." }
  ]
}
```

#### Ping Identity

| Field | Value |
|-------|-------|
| **Type** | `ping_identity` |
| **Credential Type** | `oauth2` |
| **Config** | `base_url` (string — PingOne API base), `environment_id` (string) |
| **Credentials** | `access_token` — PingOne OAuth2 token |
| **Discovers** | Users in the specified environment |

```json
{
  "config": {
    "base_url": "https://api.pingone.com/v1",
    "environment_id": "abc-123-def"
  },
  "credentials": [
    { "key_name": "access_token", "value": "eyJ..." }
  ]
}
```

---

### A.8 DevOps & Code Repository Connectors (4 types)

These connectors detect secrets, API keys, and sensitive data committed in code repositories.

#### GitHub

| Field | Value |
|-------|-------|
| **Type** | `github` |
| **Credential Type** | `api_key` |
| **Config** | `organization` (string, optional — if empty, scans user's repos) |
| **Credentials** | `access_token` — GitHub Personal Access Token or GitHub App token |
| **Required Scopes** | `repo` (for private repos), or `public_repo` for public only |
| **Discovers** | Repositories with visibility and default branch |
| **Scans** | Code search for secret patterns (passwords, API keys, AKIA*, private keys) |

```json
{
  "config": { "organization": "my-company" },
  "credentials": [
    { "key_name": "access_token", "value": "ghp_abc123..." }
  ]
}
```

#### GitLab

| Field | Value |
|-------|-------|
| **Type** | `gitlab` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string, default: `https://gitlab.com`), `group_id` (string, optional) |
| **Credentials** | `private_token` — GitLab Personal Access Token |
| **Required Scopes** | `read_api`, `read_repository` |
| **Discovers** | Projects with visibility |
| **Scans** | Blob search for secret patterns across project code |

```json
{
  "config": {
    "base_url": "https://gitlab.company.com",
    "group_id": "42"
  },
  "credentials": [
    { "key_name": "private_token", "value": "glpat-abc123..." }
  ]
}
```

#### Bitbucket

| Field | Value |
|-------|-------|
| **Type** | `bitbucket` |
| **Credential Type** | `username_password` |
| **Config** | `base_url` (string, default: `https://api.bitbucket.org/2.0`), `workspace` (string) |
| **Credentials** | `username`, `app_password` — Bitbucket App Password |
| **Required Permissions** | `Repositories: Read` |
| **Discovers** | Repositories with privacy status |
| **Scans** | File search for secret patterns |

```json
{
  "config": {
    "workspace": "my-company",
    "base_url": "https://api.bitbucket.org/2.0"
  },
  "credentials": [
    { "key_name": "username", "value": "dspm-bot" },
    { "key_name": "app_password", "value": "ATBBabc123..." }
  ]
}
```

#### Azure DevOps

| Field | Value |
|-------|-------|
| **Type** | `azure_devops` |
| **Credential Type** | `api_key` |
| **Config** | `organization` (string — Azure DevOps organization name) |
| **Credentials** | `personal_access_token` — Azure DevOps PAT |
| **Required Scopes** | `Code (Read)`, `Project and Team (Read)` |
| **Discovers** | Projects, Git repositories |
| **Scans** | Repository file content (root-level files, first 64KB each) |

```json
{
  "config": { "organization": "my-company" },
  "credentials": [
    { "key_name": "personal_access_token", "value": "abc123xyz..." }
  ]
}
```

---

### A.9 Security Platform Integrations (5 types)

These connectors integrate with security tools to correlate DSPM findings with existing security controls.

#### Forcepoint DLP

| Field | Value |
|-------|-------|
| **Type** | `forcepoint_dlp` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — Forcepoint management API endpoint) |
| **Credentials** | `api_key` |
| **Discovers** | DLP policies |
| **Scans** | DLP incident data (first 50 incidents) |

```json
{
  "config": { "base_url": "https://dlp.company.com" },
  "credentials": [
    { "key_name": "api_key", "value": "fp-abc123..." }
  ]
}
```

#### Splunk SIEM

| Field | Value |
|-------|-------|
| **Type** | `splunk` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — Splunk REST API, e.g. `https://splunk.company.com:8089`), `verify_ssl` (bool, default: true) |
| **Credentials** | `bearer_token` or `session_key` |
| **Discovers** | Indexes |
| **Scans** | Event search (first 50 events per index) |

```json
{
  "config": {
    "base_url": "https://splunk.company.com:8089",
    "verify_ssl": true
  },
  "credentials": [
    { "key_name": "bearer_token", "value": "eyJra..." }
  ]
}
```

#### IBM QRadar

| Field | Value |
|-------|-------|
| **Type** | `qradar` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — QRadar Console API, e.g. `https://qradar.company.com`), `verify_ssl` (bool, default: true) |
| **Credentials** | `sec_token` — QRadar Authorized Service Token |
| **Discovers** | Log sources |
| **Scans** | Ariel event search (last 1 hour, 50 events) |

```json
{
  "config": {
    "base_url": "https://qradar.company.com",
    "verify_ssl": true
  },
  "credentials": [
    { "key_name": "sec_token", "value": "abc-123-def..." }
  ]
}
```

#### SOAR Platform (Generic)

| Field | Value |
|-------|-------|
| **Type** | `generic_soar` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — SOAR API endpoint) |
| **Credentials** | `api_key` or `access_token` |
| **Discovers** | Playbooks |

```json
{
  "config": { "base_url": "https://soar.company.com" },
  "credentials": [
    { "key_name": "api_key", "value": "soar-abc123..." }
  ]
}
```

#### CASB (Generic)

| Field | Value |
|-------|-------|
| **Type** | `generic_casb` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — CASB API endpoint) |
| **Credentials** | `api_key` or `access_token` |
| **Discovers** | Monitored cloud applications |

```json
{
  "config": { "base_url": "https://casb.company.com" },
  "credentials": [
    { "key_name": "api_key", "value": "casb-abc123..." }
  ]
}
```

---

### A.10 Backup & Snapshot Connectors (4 types)

These connectors detect sensitive data in backup copies and snapshots.

#### AWS EBS Snapshots

| Field | Value |
|-------|-------|
| **Type** | `aws_ebs_snapshot` |
| **Credential Type** | `iam_role` or `api_key` |
| **Config** | `region` (string, default: `us-east-1`) |
| **Credentials** | `access_key`, `secret_key` |
| **Required Permissions** | `ec2:DescribeSnapshots`, `sts:GetCallerIdentity` |
| **Discovers** | EBS snapshots (owned by account) with size, encryption, and state |
| **Scans** | *(Not directly scannable — snapshots require volume mounting)* |

```json
{
  "config": { "region": "ap-south-1" },
  "credentials": [
    { "key_name": "access_key", "value": "AKIA..." },
    { "key_name": "secret_key", "value": "wJa..." }
  ]
}
```

#### Azure VM Snapshots

| Field | Value |
|-------|-------|
| **Type** | `azure_vm_snapshot` |
| **Credential Type** | `service_principal` |
| **Config** | `subscription_id` (string) |
| **Credentials** | `access_token` — Azure Management API Bearer token |
| **Discovers** | VM disk snapshots with size, encryption, and provisioning state |
| **Scans** | *(Not directly scannable — snapshots require disk mounting)* |

```json
{
  "config": { "subscription_id": "abc12345-def6-7890-ghij-klmnopqrstuv" },
  "credentials": [
    { "key_name": "access_token", "value": "eyJ0eXAi..." }
  ]
}
```

#### Backup Repository (Generic)

| Field | Value |
|-------|-------|
| **Type** | `backup_repository` |
| **Credential Type** | `api_key` |
| **Config** | `base_url` (string — backup management API endpoint) |
| **Credentials** | `api_key` or `access_token` |
| **Discovers** | Backup jobs/sets with sizes and statuses |

```json
{
  "config": { "base_url": "https://backup.company.com/api" },
  "credentials": [
    { "key_name": "api_key", "value": "bkp-abc123..." }
  ]
}
```

#### Archive Storage (AWS Glacier / Azure Archive)

| Field | Value |
|-------|-------|
| **Type** | `archive_storage` |
| **Credential Type** | `api_key` or `service_principal` |
| **Config** | `provider` (string — `aws` or `azure`), plus provider-specific fields: for AWS: `region`; for Azure: use connection string |
| **Credentials** | AWS: `access_key`, `secret_key`; Azure: `connection_string` |
| **Discovers** | AWS: Glacier vaults with sizes; Azure: archive-tier containers |
| **Scans** | *(Not directly scannable — archive retrieval takes hours)* |

```json
{
  "config": { "provider": "aws", "region": "ap-south-1" },
  "credentials": [
    { "key_name": "access_key", "value": "AKIA..." },
    { "key_name": "secret_key", "value": "wJa..." }
  ]
}
```

---

### Connector Count Summary

| # | Category | Connector Types | Count |
|---|----------|----------------|-------|
| 1 | Cloud Storage | AWS S3, Azure Blob, ADLS, GCS, OneDrive, SharePoint Online, Google Drive, Box, Dropbox, Egnyte | **10** |
| 2 | Databases | PostgreSQL, MySQL, MSSQL, Oracle, MariaDB, IBM Db2, MongoDB, Cassandra | **8** |
| 3 | Data Warehouses | Snowflake, BigQuery, Redshift, Azure Synapse, Databricks, HDFS | **6** |
| 4 | SaaS / Collaboration | Microsoft 365, Microsoft Teams, Google Workspace, Gmail, Slack, Jira, Confluence, Salesforce | **8** |
| 5 | On-Prem Storage | SMB, NFS, Local FS, On-Prem SharePoint | **4** |
| 6 | Cloud Infrastructure | AWS Cloud, Azure Subscription, GCP Cloud | **3** |
| 7 | Identity & Access | Azure AD, AWS IAM, Google IAM, LDAP, Microsoft AD, Okta, Ping Identity | **7** |
| 8 | DevOps / Code Repos | GitHub, GitLab, Bitbucket, Azure DevOps | **4** |
| 9 | Security Platforms | Forcepoint DLP, Splunk, QRadar, SOAR, CASB | **5** |
| 10 | Backup & Snapshot | AWS EBS Snapshots, Azure VM Snapshots, Backup Repository, Archive Storage | **4** |
| | | **Total** | **59** |

Each connector implements:
- **`test_connection()`** — validate credentials and connectivity
- **`list_assets()`** — discover all data stores and assets
- **`fetch_metadata()`** — retrieve encryption, exposure, size, and region info
- **`scan_content()`** — retrieve content for sensitive data classification
