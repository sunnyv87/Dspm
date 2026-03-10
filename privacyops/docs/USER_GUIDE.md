# TechD PrivacyOps — User Guide

> **Version:** 2.0 | **Last Updated:** March 2026
>
> A complete guide to using the TechD PrivacyOps platform for privacy operations management,
> compliance monitoring, breach response, vendor risk, and data subject rights.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Compliance Management](#3-compliance-management)
4. [ISO 27701 PIMS Compliance](#4-iso-27701-pims-compliance)
5. [Consent Management](#5-consent-management)
6. [Data Subject Rights (DSAR)](#6-data-subject-rights-dsar)
7. [Breach Monitoring](#7-breach-monitoring)
8. [Vendor Risk Management](#8-vendor-risk-management)
9. [Data Retention](#9-data-retention)
10. [Workflow & Approvals](#10-workflow--approvals)
11. [Reporting](#11-reporting)
12. [DSPM Integration](#12-dspm-integration)
13. [Audit Trail](#13-audit-trail)
14. [Administration](#14-administration)
15. [API Reference](#15-api-reference)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Getting Started

### 1.1 Accessing the Platform

Navigate to `https://your-domain.com` in your browser. The platform supports Chrome, Firefox, Safari, and Edge.

### 1.2 Logging In

```
┌─────────────────────────────────────────────┐
│           TechD PrivacyOps                  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Email                                 │  │
│  │ admin@company.com                     │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ Password                              │  │
│  │ ••••••••••                            │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │            Sign In                    │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Forgot password? | Contact administrator   │
└─────────────────────────────────────────────┘
```

Enter your credentials provided by your administrator. After login, you'll be directed to the Dashboard.

### 1.3 Navigation

The sidebar provides access to all modules:

```
┌──────────────────┬──────────────────────────────────────────┐
│  PrivacyOps      │  Dashboard                               │
│                  │                                          │
│  ▸ Dashboard     │  Welcome, John                           │
│  ▸ Compliance    │  Organization: Acme Corp                 │
│  ▸ Consent       │  Role: Privacy Officer                   │
│  ▸ Rights (DSAR) │                                          │
│  ▸ Breach        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  ▸ Vendor Risk   │  │ Comp: 78%│ │ Risks: 12│ │ DSARs: 5 │ │
│  ▸ Retention     │  └──────────┘ └──────────┘ └──────────┘ │
│  ▸ Workflows     │                                          │
│  ▸ Reports       │                                          │
│  ▸ DSPM          │                                          │
│  ▸ Audit Log     │                                          │
│  ▸ Settings      │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

---

## 2. Dashboard Overview

The dashboard aggregates data from all privacy services into a unified view.

```
┌─────────────────────────────────────────────────────────────────┐
│  Dashboard Overview                                    [Refresh]│
├───────────┬───────────┬───────────┬───────────┬────────────────┤
│ Compliance│  Open     │  Active   │  Pending  │  Vendor Risk   │
│  Score    │  Breaches │  DSARs    │  Consents │  Alerts        │
│           │           │           │           │                │
│   78%     │    2      │    5      │   142     │     8          │
│   ▲ 3%    │   ▼ 1    │   ▲ 2    │   ▲ 15   │    ▼ 3         │
└───────────┴───────────┴───────────┴───────────┴────────────────┘

┌─────────────────────────────┐  ┌──────────────────────────────┐
│  Compliance by Framework    │  │  Risk Heatmap                │
│                             │  │                              │
│  ISO 27701  ████████░░  82% │  │      Low  Med  High Crit    │
│  GDPR       ███████░░░  71% │  │  DB   ░░   ░░   ▓▓   ██    │
│  CCPA       █████████░  90% │  │  Cloud ░░   ▓▓   ▓▓   ░░   │
│  HIPAA      ██████░░░░  65% │  │  SaaS  ░░   ░░   ▓▓   ░░   │
│                             │  │  OnPrem ░░   ▓▓   ░░   ░░   │
└─────────────────────────────┘  └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Recent Activity                                                │
│                                                                 │
│  ● 10:32  DSAR request #DSR-2024-089 submitted (erasure)       │
│  ● 10:15  Compliance scan completed - ISO 27701 score: 82%     │
│  ● 09:45  Breach incident #BR-003 status → CONTAINED           │
│  ● 09:30  Vendor "CloudCorp" assessment completed (MEDIUM risk)│
│  ● 09:12  Retention policy "EU-Customer-Data" executed          │
│  ● 08:55  Consent withdrawal received from user@example.com    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Metrics

- **Compliance Score**: Weighted average across all active frameworks
- **Open Breaches**: Active breach incidents requiring attention
- **Active DSARs**: Data subject requests in progress
- **Pending Consents**: Consent records awaiting processing
- **Vendor Risk Alerts**: Vendor assessments with elevated risk levels

---

## 3. Compliance Management

### 3.1 Framework Overview

Navigate to **Compliance > Frameworks** to view and manage compliance frameworks.

```
┌─────────────────────────────────────────────────────────────────┐
│  Compliance Frameworks                    [+ Seed Framework]    │
├──────────┬─────────┬──────────┬────────┬───────────────────────┤
│ Framework│ Version │ Controls │ Status │ Last Scan Score       │
├──────────┼─────────┼──────────┼────────┼───────────────────────┤
│ ISO 27701│  2019   │    63    │ ACTIVE │ 82% (Mar 8, 2026)     │
│ GDPR     │ 2016/679│    25    │ ACTIVE │ 71% (Mar 7, 2026)     │
│ CCPA     │  2020   │    14    │ ACTIVE │ 90% (Mar 6, 2026)     │
│ HIPAA    │  2013   │    20    │ ACTIVE │ 65% (Mar 5, 2026)     │
└──────────┴─────────┴──────────┴────────┴───────────────────────┘
```

### 3.2 Seeding a Framework

Click **[+ Seed Framework]** to auto-populate a pre-built framework with all controls:

```
┌─────────────────────────────────────────────────┐
│  Seed Compliance Framework                      │
│                                                 │
│  Available Frameworks:                          │
│  ┌─────────────────────────────────────────┐    │
│  │ ○ ISO 27701 (63 controls) - PIMS       │    │
│  │ ○ GDPR (25 controls) - EU Data Prot.   │    │
│  │ ○ CCPA (14 controls) - California      │    │
│  │ ○ HIPAA (20 controls) - Healthcare     │    │
│  │ ○ Seed All Frameworks                  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  [Cancel]                    [Seed Selected]    │
└─────────────────────────────────────────────────┘
```

### 3.3 Running a Compliance Scan

1. Select a framework from the list
2. Click **[Run Scan]**
3. Choose scan type: **Full**, **Incremental**, or **Targeted**
4. Monitor progress in real-time

```
┌─────────────────────────────────────────────────────────────────┐
│  Compliance Scan - ISO 27701                                    │
│                                                                 │
│  Status: ████████████████████████████░░░░  82%  RUNNING         │
│                                                                 │
│  Controls evaluated: 52 / 63                                    │
│  ✓ Pass: 42    ✗ Fail: 8    ◐ Partial: 2                       │
│                                                                 │
│  Current: ISO27701-7.3.4 (Rectification and erasure)            │
│                                                                 │
│  ┌──────────────────────────────────────────┐                   │
│  │ Findings by Category            Count    │                   │
│  │ ───────────────────────────────────────── │                   │
│  │ Data Protection                  3       │                   │
│  │ Data Subject Rights              2       │                   │
│  │ Vendor Management                1       │                   │
│  │ Consent Management               1       │                   │
│  │ Encryption                       1       │                   │
│  └──────────────────────────────────────────┘                   │
│                                                                 │
│  [Cancel Scan]                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Viewing Scan Results

After a scan completes, view detailed findings with AI-generated remediation suggestions:

```
┌─────────────────────────────────────────────────────────────────┐
│  Scan Results - ISO 27701 (Score: 82%)        [Generate Report] │
├─────────────────────────────────────────────────────────────────┤
│  Findings (8 issues found)                      [Filter ▼]      │
│                                                                 │
│  ┌─ CRITICAL ──────────────────────────────────────────────┐    │
│  │ ISO27701-7.3.3: Right of access                         │    │
│  │ No automated mechanism for data subject access requests │    │
│  │ Recommendation: Establish processes for handling DSARs  │    │
│  │ Remediation: 5 steps | Effort: 1-2 days     [View ▸]  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ HIGH ──────────────────────────────────────────────────┐    │
│  │ ISO27701-6.7.1.1: Encryption of PII                     │    │
│  │ PII encryption policy not fully implemented              │    │
│  │ Recommendation: Implement encryption at rest & transit  │    │
│  │ Remediation: 5 steps | Effort: 3-5 days     [View ▸]  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [◀ Previous]  Page 1 of 2  [Next ▶]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ISO 27701 PIMS Compliance

### 4.1 Overview

ISO 27701:2019 extends ISO 27001/27002 for Privacy Information Management Systems (PIMS). The platform covers all clauses:

| Clause | Coverage | Controls |
|--------|----------|----------|
| Clause 5 | PIMS requirements (ISO 27001 extension) | 6 |
| Clause 6 | PIMS guidance (ISO 27002 extension) | 17 |
| Clause 7 | PII Controller guidance | 24 |
| Clause 8 | PII Processor guidance | 16 |

### 4.2 Control Categories

The 63 ISO 27701 controls are organized into 17 categories:

- **Data Protection** (14): Classification, labelling, processing limits, privacy by design
- **Data Subject Rights** (6): Access, rectification, erasure, portability, objection, automated decisions
- **Consent Management** (4): Consent capture, recording, withdrawal, marketing restrictions
- **Data Transfer** (5): Cross-border transfers, adequacy decisions, transfer records
- **Data Retention** (5): Retention schedules, deletion, anonymization, disposal
- **Vendor Management** (6): Processor agreements, sub-processor disclosure, change management
- **Governance** (6): PIMS scope, roles, DPO, joint controllers
- **Compliance** (4): Regulatory compliance, infringing instructions, legally binding disclosures
- **Access Control** (2): User access management, privileged access to PII
- **Encryption** (3): PII encryption, transmission controls
- **Incident Response** (2): Breach reporting, disclosure notifications
- **Risk Management** (3): PIMS risk assessment, PII risk assessment, DPIA
- **Transparency** (2): Privacy notices, information provision
- **Audit Logging** (2): PII disclosure records, independent reviews
- **Documentation** (2): Processing records, customer obligations
- **Training** (1): PII awareness education
- **Business Continuity** (1): PII protection in adverse situations

### 4.3 Mapping to Other Frameworks

ISO 27701 controls map to requirements in other frameworks:

```
ISO 27701 Control          →  GDPR Article    →  CCPA Section
────────────────────────────────────────────────────────────────
7.2.2 Lawful basis         →  Art. 6          →  §1798.100
7.3.3 Right of access      →  Art. 15         →  §1798.110
7.3.4 Rectification/erasure→  Art. 16-17      →  §1798.105-106
7.2.4 Obtain consent       →  Art. 7          →  §1798.120
7.4.7 Retention            →  Art. 5(1)(e)    →  —
6.12.1.2 Breach reporting  →  Art. 33-34      →  —
7.5.1 Cross-border transfer→  Art. 44-49      →  —
```

---

## 5. Consent Management

### 5.1 Managing Consent Purposes

```
┌─────────────────────────────────────────────────────────────────┐
│  Consent Purposes                              [+ New Purpose]  │
├──────────┬────────────┬──────────┬────────┬────────────────────┤
│ Purpose  │ Legal Basis│ Consents │ Active │ Withdrawal Rate    │
├──────────┼────────────┼──────────┼────────┼────────────────────┤
│ Marketing│ Consent    │  8,432   │  7,891 │ 6.4%               │
│ Analytics│ Legit.Int  │ 12,105   │ 11,983 │ 1.0%               │
│ Data Proc│ Contract   │  3,240   │  3,240 │ 0.0%               │
│ Profiling│ Consent    │  2,891   │  2,102 │ 27.3%              │
└──────────┴────────────┴──────────┴────────┴────────────────────┘
```

### 5.2 Consent Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│  Consent Analytics (Last 30 Days)                               │
│                                                                 │
│  Consent Rate  ████████████████████████░░░░░░  80%              │
│  Opt-out Rate  ████░░░░░░░░░░░░░░░░░░░░░░░░░  14%              │
│                                                                 │
│  Daily Trend:                                                   │
│  150 ┤         ╭─╮                                              │
│  100 ┤    ╭───╯  ╰──╮     ╭──╮                                 │
│   50 ┤───╯          ╰────╯  ╰───                               │
│    0 ┤─────────────────────────────                             │
│       Mar 1    Mar 5    Mar 10                                  │
│                                                                 │
│  ● Grants  ● Withdrawals                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Subject Rights (DSAR)

### 6.1 DSAR Dashboard

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
│ #085 │ ERASURE  │ a.kumar@..│ COMPLETED│ Mar 5 │ Sarah M.       │
└──────┴──────────┴───────────┴──────────┴───────┴───────────────┘
```

### 6.2 Processing a DSAR

1. **Verify Identity**: Confirm the requestor's identity
2. **Assign Tasks**: System auto-creates tasks based on request type
3. **Process Tasks**: Team completes each task (data collection, deletion, etc.)
4. **Review & Respond**: Review and send response to data subject

```
┌─────────────────────────────────────────────────────────────────┐
│  DSAR #089 - Right to Erasure                                   │
│  Subject: john.doe@example.com                                  │
│  Submitted: Mar 5, 2026 | Due: Mar 15, 2026                    │
│  Status: IN_PROGRESS                                            │
│                                                                 │
│  Tasks:                                                         │
│  ✓ Identity Verification          Completed Mar 6               │
│  ✓ Data Collection                Completed Mar 7               │
│  ● Data Deletion (CRM)           In Progress                    │
│  ○ Data Deletion (Marketing DB)  Pending                        │
│  ○ Notification to Processors    Pending                        │
│  ○ Final Review                  Pending                        │
│                                                                 │
│  [Complete Task]  [Add Task]  [Reassign]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Breach Monitoring

### 7.1 Incident Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Breach Incidents                           [+ Report Incident] │
├──────┬────────────┬──────────┬──────────┬──────────────────────┤
│  ID  │ Title      │ Severity │ Status   │ Regulatory Deadline  │
├──────┼────────────┼──────────┼──────────┼──────────────────────┤
│ #003 │ Unauth.    │ HIGH     │CONTAINED │ Mar 11 (⚠ 8h left)  │
│      │ DB Access  │          │          │                      │
│ #002 │ Phishing   │ MEDIUM   │RECOVERED │ —                    │
│      │ Campaign   │          │          │                      │
│ #001 │ Data Leak  │ CRITICAL │ CLOSED   │ Reported on time     │
│      │ S3 Bucket  │          │          │                      │
└──────┴────────────┴──────────┴──────────┴──────────────────────┘
```

### 7.2 GDPR 72-Hour Notification

When a breach is detected, the system automatically calculates the GDPR 72-hour regulatory deadline:

```
┌─────────────────────────────────────────────────────────────────┐
│  Breach #003 - Unauthorized Database Access                     │
│                                                                 │
│  ⚠ REGULATORY DEADLINE: March 11, 2026 18:00 UTC (8h remaining)│
│                                                                 │
│  Timeline:                                                      │
│  ├── Mar 8 10:00  DETECTED - Anomalous DB queries              │
│  ├── Mar 8 10:15  INVESTIGATION started                         │
│  ├── Mar 8 14:30  Evidence collected - 3 tables affected        │
│  ├── Mar 9 09:00  CONTAINED - Access revoked                   │
│  └── Mar 9 09:15  Regulatory notification DRAFTED               │
│                                                                 │
│  Affected: ~2,400 data subjects (customers)                     │
│  Data types: email, phone, address                              │
│                                                                 │
│  Notifications:                                                 │
│  ○ DPA notification          DRAFT    [Send ▸]                  │
│  ○ Data subject notification PENDING  [Send ▸]                  │
│  ✓ Management notification   SENT     Mar 8 10:30               │
│                                                                 │
│  [Add Timeline Entry]  [Register Affected Subjects]             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Vendor Risk Management

### 8.1 Vendor Overview

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
│ NewVendor    │ SAAS      │ UNKNOWN│ ONBOARDING│ —              │
└──────────────┴───────────┴────────┴───────────┴────────────────┘
```

### 8.2 Vendor Assessment

```
┌─────────────────────────────────────────────────────────────────┐
│  Assessment: AnalytiCo - Periodic Review                        │
│  Type: PERIODIC | Status: IN_PROGRESS | Score: 62/100           │
│                                                                 │
│  Questionnaire Status: SUBMITTED (awaiting review)              │
│                                                                 │
│  Risk Findings:                                                 │
│  ┌─ HIGH ──────────────────────────────────────────────┐        │
│  │ No DPA in place for EU customer data processing     │        │
│  │ Status: OPEN | Due: Mar 20     [Create Remediation] │        │
│  └─────────────────────────────────────────────────────┘        │
│  ┌─ MEDIUM ────────────────────────────────────────────┐        │
│  │ SOC 2 Type II report expired (> 12 months old)      │        │
│  │ Status: IN_PROGRESS           [Update Status]       │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  [Complete Assessment]  [Send Questionnaire]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Data Retention

### 9.1 Retention Policies

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

### 9.2 Execution Results

```
┌─────────────────────────────────────────────────────────────────┐
│  Retention Execution: EU Customer Data                          │
│  Schedule: Daily at 02:00 UTC | Last Run: Mar 9, 2026          │
│                                                                 │
│  Status: COMPLETED                                              │
│  Records Processed:  12,847                                     │
│  Records Deleted:     1,203                                     │
│  Records Archived:        0                                     │
│  Records Anonymized:      0                                     │
│  Duration: 4m 32s                                               │
│                                                                 │
│  [View History]  [Trigger Manual Run]                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Workflow & Approvals

### 10.1 My Tasks

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

### 10.2 Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Approval: Review DSAR Response (Task T-42)                     │
│                                                                 │
│  Workflow: DSAR Processing                                      │
│  Instance: #WF-2024-089                                         │
│  Requested by: Sarah M. on Mar 10                               │
│                                                                 │
│  Context:                                                       │
│  DSAR #089 (Right to Erasure) response ready for review.        │
│  All deletion tasks completed. Response letter drafted.         │
│                                                                 │
│  ┌───────────────────────────────────────────┐                  │
│  │ Decision:                                 │                  │
│  │  ○ Approve  ○ Reject  ○ Defer            │                  │
│  │                                           │                  │
│  │ Comments:                                 │                  │
│  │ ┌─────────────────────────────────────┐   │                  │
│  │ │                                     │   │                  │
│  │ └─────────────────────────────────────┘   │                  │
│  └───────────────────────────────────────────┘                  │
│                                                                 │
│  [Submit Decision]                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Reporting

### 11.1 Report Types

| Type | Description |
|------|-------------|
| COMPLIANCE | Framework compliance scores and gap analysis |
| RISK | Risk assessment summary with trends |
| AUDIT | Audit trail and activity reports |
| BREACH | Breach incident summary and response metrics |
| CONSENT | Consent analytics and opt-out trends |
| DSAR | Data subject request volume and SLA compliance |
| VENDOR | Vendor risk assessment summary |
| CUSTOM | User-defined report templates |

### 11.2 Generating a Report

```
┌─────────────────────────────────────────────────────────────────┐
│  Generate Report                                                │
│                                                                 │
│  Type: COMPLIANCE                                               │
│  Format: ○ PDF  ○ CSV  ○ XLSX  ○ JSON                          │
│                                                                 │
│  Framework: [ISO 27701 ▼]                                       │
│  Date Range: [Mar 1, 2026] to [Mar 10, 2026]                   │
│                                                                 │
│  Include:                                                       │
│  ☑ Executive summary                                            │
│  ☑ Control-by-control findings                                  │
│  ☑ Remediation suggestions                                      │
│  ☑ Trend analysis                                               │
│  ☐ Raw evidence data                                            │
│                                                                 │
│  [Cancel]                              [Generate Report]        │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Scheduled Reports

Configure automated report generation and delivery:

```
┌─────────────────────────────────────────────────────────────────┐
│  Scheduled Reports                           [+ New Schedule]   │
├──────────────┬──────────┬────────────┬────────┬────────────────┤
│ Report       │ Schedule │ Recipients │ Status │ Next Run       │
├──────────────┼──────────┼────────────┼────────┼────────────────┤
│ Weekly Comp. │ Mon 9AM  │ 3 emails   │ ACTIVE │ Mar 11, 2026   │
│ Monthly Risk │ 1st 8AM  │ 5 emails   │ ACTIVE │ Apr 1, 2026    │
│ Daily Breach │ Daily 6AM│ 2 emails   │ ACTIVE │ Mar 11, 2026   │
└──────────────┴──────────┴────────────┴────────┴────────────────┘
```

---

## 12. DSPM Integration

### 12.1 DSPM Posture Overview

The platform integrates with the TechD DSPM module to provide a unified view of data security posture:

```
┌─────────────────────────────────────────────────────────────────┐
│  DSPM Posture                                       [Refresh]   │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Assets   │ │ Classif. │ │ Violations│ │ Open Alerts      │  │
│  │  1,247   │ │   892    │ │    23     │ │     8            │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│                                                                 │
│  Risk Score Distribution:                                       │
│  High:   ████████░░░░░░░░░░  34%                               │
│  Medium: ██████████████░░░░  52%                               │
│  Low:    ████░░░░░░░░░░░░░░  14%                               │
│                                                                 │
│  This data feeds into compliance scans to provide               │
│  evidence-based control evaluations.                            │
└─────────────────────────────────────────────────────────────────┘
```

### 12.2 Data Flow

```
DSPM Module                    PrivacyOps Platform
─────────────────────────────────────────────────────────────
Connectors (59 types)  ──────▶  Discovery Service
Scans & Classification ──────▶  Classification Service
Risk Scores            ──────▶  Compliance AI (posture context)
Policy Violations      ──────▶  Compliance AI (gap analysis)
Alerts                 ──────▶  Dashboard BFF (unified view)
```

---

## 13. Audit Trail

All actions across the platform are recorded in an immutable audit log:

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

---

## 14. Administration

### 14.1 Role-Based Access Control

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | Full platform access | All permissions, cross-tenant |
| **Privacy Officer** | Privacy operations management | compliance.*, consent.*, rights.*, breach.* |
| **DPO** | Data Protection Officer | All read, compliance.manage, breach.manage |
| **Compliance Analyst** | Compliance monitoring | compliance.read, compliance.scan.trigger |
| **Risk Manager** | Risk assessment | vendor-risk.*, privacy-risk.* |
| **Auditor** | Read-only audit access | *.read, audit.* |

### 14.2 Multi-Tenancy

The platform supports full multi-tenancy:
- Each tenant has isolated data
- All API calls are scoped to the authenticated tenant
- Super admins can access any tenant
- Tenant context is extracted from JWT token or `X-Tenant-Id` header

---

## 15. API Reference

All services expose Swagger documentation. Access them at:

| Module | Swagger URL |
|--------|------------|
| Compliance AI | `/api/docs/compliance-ai` |
| Consent | `/api/docs/consent` |
| Rights (DSAR) | `/api/docs/rights` |
| Breach | `/api/docs/breach` |
| Vendor Risk | `/api/docs/vendor-risk` |
| Retention | `/api/docs/retention` |
| Reports | `/api/docs/reports` |
| Workflows | `/api/docs/workflows` |
| Dashboard | `/api/docs/dashboard` |

### Common API Patterns

**Authentication**: All requests require `Authorization: Bearer <token>` header.

**Pagination**: List endpoints support `?page=1&limit=20`.

**Filtering**: Most list endpoints support `?status=ACTIVE&search=keyword`.

**Response format**:
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

## 16. Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing authorization token" | Ensure Bearer token is included in request headers |
| "Invalid or expired token" | Re-authenticate to obtain a new JWT token |
| "Insufficient permissions" | Contact your admin to add required permissions to your role |
| "Access denied: tenant mismatch" | You're trying to access data from another tenant |
| "Framework already exists" | Use the update endpoint instead, or delete and re-seed |
| "Kafka not connected" | Check KAFKA_BROKERS configuration and Kafka availability |
| Scan stuck in RUNNING state | Cancel the scan and re-trigger; check service logs |
| DSAR past due date | Assign the request and complete pending tasks |
| Breach notification not sent | Verify notification channel configuration and recipient emails |

For additional support, contact your system administrator or review service logs.

---

*Copyright (c) 2026 TechD. All rights reserved.*
