# TechD DSPM - Installation & Configuration Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (Docker Compose)](#2-quick-start-docker-compose)
3. [Manual Installation](#3-manual-installation)
4. [Configuration Reference](#4-configuration-reference)
5. [Database Setup & Migrations](#5-database-setup--migrations)
6. [Authentication & User Setup](#6-authentication--user-setup)
7. [Connector Configuration](#7-connector-configuration)
8. [Scan Configuration](#8-scan-configuration)
9. [Classification Rules](#9-classification-rules)
10. [Policy & Compliance Setup](#10-policy--compliance-setup)
11. [Integrations (Slack, Jira, SIEM)](#11-integrations-slack-jira-siem)
12. [Kubernetes Deployment](#12-kubernetes-deployment)
13. [Helm Chart Deployment](#13-helm-chart-deployment)
14. [Security Hardening](#14-security-hardening)
15. [API Reference](#15-api-reference)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB |
| Disk | 50 GB | 200+ GB SSD |
| OS | Linux (Ubuntu 22.04+), macOS | Linux |

### Software Dependencies

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.12+ | Backend API & workers |
| Node.js | 20+ | Frontend |
| PostgreSQL | 16+ | Primary database |
| Redis | 7+ | Queue broker & cache |
| Elasticsearch | 8.12+ | Search & audit indexing |
| Docker | 24+ | Containerized deployment |
| Docker Compose | 2.20+ | Local development stack |

### Optional (Production)

| Software | Version | Purpose |
|----------|---------|---------|
| Kubernetes | 1.28+ | Orchestration |
| Helm | 3.13+ | Chart-based deployment |
| Kafka | 3.6+ | Event streaming (optional) |
| Nginx Ingress | 1.9+ | Ingress controller |
| cert-manager | 1.13+ | TLS certificate automation |

---

## 2. Quick Start (Docker Compose)

The fastest way to get the full platform running locally.

### Step 1: Clone the repository

```bash
git clone <repository-url> dspm
cd dspm
```

### Step 2: Create environment file

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and generate secure keys:

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate CREDENTIAL_ENCRYPTION_KEY (Fernet key)
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Update `backend/.env`:

```env
DSPM_SECRET_KEY=<output-from-openssl-command>
DSPM_CREDENTIAL_ENCRYPTION_KEY=<output-from-fernet-command>
```

### Step 3: Start all services

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`
- **Elasticsearch** on port `9200`
- **Backend API** on port `8000`
- **Celery Workers** (2 replicas)
- **Frontend** on port `3000`

### Step 4: Verify

```bash
# Check all containers are healthy
docker compose ps

# Backend health check
curl http://localhost:8000/health

# Frontend
open http://localhost:3000
```

### Step 5: Access the API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

---

## 3. Manual Installation

### 3.1 Backend Setup

```bash
cd backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model (for NLP classification)
python -m spacy download en_core_web_sm
```

### 3.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your database and Redis connection details (see Section 4 for all options).

### 3.3 Initialize Database

```bash
# Option A: Auto-create tables (development mode)
# Tables are auto-created on first startup via SQLAlchemy metadata.create_all

# Option B: Use Alembic migrations (production recommended)
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### 3.4 Start the Backend

```bash
# Development (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 3.5 Start Celery Workers

In a separate terminal:

```bash
cd backend
source venv/bin/activate

# Start worker
celery -A app.workers.celery_app worker --loglevel=info --concurrency=4

# Start beat scheduler (for scheduled scans)
celery -A app.workers.celery_app beat --loglevel=info
```

### 3.6 Frontend Setup

```bash
cd frontend

# Install dependencies
npm ci

# Development
npm run dev

# Production build
npm run build
npm start
```

The frontend runs on http://localhost:3000 and expects the API at `http://localhost:8000/api/v1`.

---

## 4. Configuration Reference

All backend configuration is managed via environment variables with the `DSPM_` prefix. Set them in `backend/.env` or as system environment variables.

### Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_APP_NAME` | `TechD DSPM` | Application display name |
| `DSPM_APP_VERSION` | `0.1.0` | Application version |
| `DSPM_DEBUG` | `false` | Enable debug mode (verbose SQL logging) |
| `DSPM_SECRET_KEY` | `change-me-in-production` | **Required.** JWT signing key. Generate with `openssl rand -hex 32` |
| `DSPM_ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT access token lifetime |
| `DSPM_REFRESH_TOKEN_EXPIRE_DAYS` | `7` | JWT refresh token lifetime |
| `DSPM_API_PREFIX` | `/api/v1` | API URL prefix |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_DATABASE_URL` | `postgresql+asyncpg://dspm:dspm@localhost:5432/dspm` | PostgreSQL connection string (asyncpg driver) |
| `DSPM_DATABASE_POOL_SIZE` | `20` | Connection pool size |
| `DSPM_DATABASE_MAX_OVERFLOW` | `10` | Max overflow connections |

### Redis

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_REDIS_URL` | `redis://localhost:6379/0` | Redis for caching |
| `DSPM_CELERY_BROKER_URL` | `redis://localhost:6379/1` | Celery task broker |
| `DSPM_CELERY_RESULT_BACKEND` | `redis://localhost:6379/2` | Celery result backend |

### Elasticsearch

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_ELASTICSEARCH_URL` | `http://localhost:9200` | Elasticsearch endpoint |
| `DSPM_ELASTICSEARCH_INDEX_PREFIX` | `dspm` | Index name prefix |

### Kafka (Optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka broker addresses |
| `DSPM_KAFKA_CONSUMER_GROUP` | `dspm-workers` | Consumer group ID |

### Encryption

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_CREDENTIAL_ENCRYPTION_KEY` | auto-generated | **Required.** Fernet key for encrypting connector credentials at rest. Generate with `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

### Scanning

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_MAX_SCAN_WORKERS` | `10` | Max concurrent scan workers |
| `DSPM_SCAN_SAMPLE_SIZE` | `1000` | Default row sample size for classification |
| `DSPM_MAX_FILE_SIZE_MB` | `100` | Max file size to scan (MB) |
| `DSPM_SCAN_TIMEOUT_SECONDS` | `3600` | Per-scan timeout (1 hour default) |

### CORS

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |

### Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_LOG_LEVEL` | `INFO` | Log level: `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `DSPM_SIEM_FORWARD_URL` | `null` | SIEM endpoint for log forwarding |

### Artifact Storage

| Variable | Default | Description |
|----------|---------|-------------|
| `DSPM_ARTIFACT_STORAGE_BACKEND` | `local` | `local` or `s3` |
| `DSPM_ARTIFACT_STORAGE_PATH` | `/data/artifacts` | Local storage path |
| `DSPM_ARTIFACT_S3_BUCKET` | `null` | S3 bucket for scan artifacts |

### Frontend Environment

Set these when building or running the frontend:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

---

## 5. Database Setup & Migrations

### Initial Schema Creation

**Development mode** (auto-create on startup):

The application automatically creates all tables on startup via `Base.metadata.create_all` in `backend/app/main.py`. No manual steps needed.

**Production mode** (Alembic migrations):

```bash
cd backend

# Generate initial migration
alembic revision --autogenerate -m "initial schema"

# Apply migrations
alembic upgrade head

# Check current migration version
alembic current

# View migration history
alembic history
```

### Database Tables Created

The schema includes these table groups:

| Module | Tables |
|--------|--------|
| Admin & RBAC | `organizations`, `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `api_tokens` |
| Connectors | `connectors`, `connector_credentials`, `connector_sync_logs` |
| Discovery | `scan_jobs`, `scan_schedules`, `discovered_assets` |
| Classification | `classification_rules`, `classification_results`, `custom_classifiers` |
| Inventory | `assets`, `asset_tags` |
| Identity | `access_entries`, `identity_profiles` |
| Risk | `risk_scores`, `risk_factors`, `risk_history` |
| Policy | `compliance_frameworks`, `policy_rules`, `policy_violations` |
| Alerting | `alerts`, `alert_comments`, `remediation_tasks` |
| Reporting | `reports`, `dashboards`, `dashboard_widgets` |
| Audit | `audit_logs` |

### Backup

```bash
# Backup PostgreSQL
pg_dump -U dspm -h localhost dspm > dspm_backup_$(date +%Y%m%d).sql

# Restore
psql -U dspm -h localhost dspm < dspm_backup_20260310.sql
```

---

## 6. Authentication & User Setup

### 6.1 Register the First User

The first registered user automatically creates a default organization.

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123!",
    "full_name": "Platform Admin",
    "role": "super_admin"
  }'
```

### 6.2 Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "SecurePassword123!"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Use the `access_token` in subsequent requests:

```
Authorization: Bearer <access_token>
```

### 6.3 Create Additional Users

```bash
curl -X POST http://localhost:8000/api/v1/admin/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@company.com",
    "password": "SecurePassword456!",
    "full_name": "Security Analyst",
    "role": "security_analyst"
  }'
```

### 6.4 Available Roles

| Role | Permissions |
|------|------------|
| `super_admin` | Full platform access, manage orgs, users, all modules |
| `org_admin` | Manage connectors, users, scans, policies within org |
| `security_analyst` | Run scans, view/manage alerts, view assets and risks |
| `compliance_officer` | View compliance posture, manage policies, export reports |
| `data_owner` | View own assets, respond to alerts, manage ownership |
| `auditor` | Read-only access to audit logs, reports, compliance data |
| `read_only` | View-only access to dashboards and asset inventory |

### 6.5 Create API Tokens

For programmatic access and CI/CD integration:

```bash
curl -X POST http://localhost:8000/api/v1/admin/api-tokens \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CI Pipeline Token",
    "scopes": ["connectors:read", "scans:execute", "assets:read"],
    "expires_in_days": 90
  }'
```

---

## 7. Connector Configuration

### 7.1 Supported Connector Types

| Category | Type Code | Description |
|----------|-----------|-------------|
| **Cloud Storage** | `aws_s3` | Amazon S3 buckets |
| | `azure_blob` | Azure Blob Storage containers |
| | `gcs` | Google Cloud Storage buckets |
| **Databases** | `postgresql` | PostgreSQL databases |
| | `mysql` | MySQL databases |
| | `mssql` | Microsoft SQL Server |
| | `mongodb` | MongoDB databases |
| | `oracle` | Oracle Database |
| | `mariadb` | MariaDB databases |
| **Data Warehouses** | `snowflake` | Snowflake warehouses |
| | `bigquery` | Google BigQuery datasets |
| | `redshift` | Amazon Redshift clusters |
| | `databricks` | Databricks workspaces |
| | `hdfs` | Hadoop HDFS |
| **SaaS** | `microsoft_365` | Microsoft 365 / OneDrive / SharePoint |
| | `google_workspace` | Google Workspace / Drive |
| | `slack` | Slack workspaces |
| | `jira` | Jira projects |
| | `confluence` | Confluence spaces |
| | `salesforce` | Salesforce orgs |
| **On-Prem** | `smb` | SMB file shares |
| | `nfs` | NFS mounts |
| | `local_fs` | Local file system paths |

### 7.2 Credential Types

| Type | Code | Use Case |
|------|------|----------|
| API Key | `api_key` | SaaS connectors, simple auth |
| OAuth 2.0 | `oauth2` | Microsoft 365, Google Workspace, Salesforce |
| IAM Role | `iam_role` | AWS S3, Redshift (AssumeRole) |
| Service Principal | `service_principal` | Azure Blob, Azure SQL |
| Username/Password | `username_password` | Databases, SMB/NFS |
| Certificate | `certificate` | mTLS, Oracle wallet |

All credentials are encrypted at rest using Fernet symmetric encryption.

### 7.3 Add a Connector

**Example: AWS S3**

```bash
curl -X POST http://localhost:8000/api/v1/connectors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production S3",
    "connector_type": "aws_s3",
    "credential_type": "iam_role",
    "config": {
      "region": "ap-south-1",
      "account_id": "123456789012"
    },
    "credentials": {
      "role_arn": "arn:aws:iam::123456789012:role/DSPMScanRole",
      "external_id": "dspm-external-id"
    },
    "scan_scope": {
      "include_buckets": ["prod-data-*", "customer-uploads"],
      "exclude_buckets": ["logs-*", "temp-*"]
    },
    "schedule_cron": "0 2 * * *",
    "incremental_sync": true
  }'
```

**Example: PostgreSQL**

```bash
curl -X POST http://localhost:8000/api/v1/connectors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production PostgreSQL",
    "connector_type": "postgresql",
    "credential_type": "username_password",
    "config": {
      "host": "db.internal.company.com",
      "port": 5432,
      "database": "production"
    },
    "credentials": {
      "username": "dspm_reader",
      "password": "readonly-password"
    },
    "scan_scope": {
      "include_schemas": ["public", "app"],
      "exclude_tables": ["migrations", "sessions"]
    },
    "schedule_cron": "0 3 * * 0"
  }'
```

**Example: Microsoft 365**

```bash
curl -X POST http://localhost:8000/api/v1/connectors \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corporate M365",
    "connector_type": "microsoft_365",
    "credential_type": "service_principal",
    "config": {
      "tenant_id": "your-tenant-id"
    },
    "credentials": {
      "client_id": "app-client-id",
      "client_secret": "app-client-secret"
    },
    "scan_scope": {
      "include_services": ["onedrive", "sharepoint"],
      "include_sites": ["https://company.sharepoint.com/sites/finance"]
    }
  }'
```

### 7.4 Test Connectivity

Always test before activating:

```bash
curl -X POST http://localhost:8000/api/v1/connectors/test \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "connector_type": "aws_s3",
    "credential_type": "iam_role",
    "config": { "region": "ap-south-1" },
    "credentials": { "role_arn": "arn:aws:iam::123456789012:role/DSPMScanRole" }
  }'
```

### 7.5 Connector Health Statuses

| Status | Meaning |
|--------|---------|
| `connected` | Active and working |
| `failed` | Last connection attempt failed |
| `partial_access` | Connected but missing some permissions |
| `disabled` | Manually disabled |
| `pending` | Newly created, not yet tested |

---

## 8. Scan Configuration

### 8.1 Scan Types

| Type | Description |
|------|-------------|
| `full` | Complete scan of all assets in scope |
| `incremental` | Scan only modified assets since last scan |
| `metadata_only` | Collect metadata without content inspection |
| `deep_content` | Full content inspection (slower, more thorough) |
| `sample` | Sample-based scan for large datasets |

### 8.2 Trigger a Scan

```bash
curl -X POST http://localhost:8000/api/v1/scans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "connector_id": "<connector-uuid>",
    "scan_type": "full",
    "config": {
      "max_file_size_mb": 100,
      "include_extensions": [".csv", ".xlsx", ".json", ".pdf", ".docx", ".parquet"],
      "exclude_paths": ["/tmp", "/node_modules"],
      "sample_size": 1000
    }
  }'
```

### 8.3 Scan Pipeline

Each scan executes this pipeline asynchronously via Celery workers:

```
1. Discovery     → Enumerate assets from connector
2. Classification → Run classification rules on content/metadata
3. Inventory     → Upsert assets into central inventory
4. Access Analysis → Map identity permissions
5. Risk Scoring  → Calculate risk score per asset
6. Policy Check  → Evaluate compliance policies
7. Alerting      → Generate alerts for violations
```

### 8.4 Manage Running Scans

```bash
# List scans
curl http://localhost:8000/api/v1/scans -H "Authorization: Bearer <token>"

# Get scan status
curl http://localhost:8000/api/v1/scans/<scan-id> -H "Authorization: Bearer <token>"

# Pause a scan
curl -X POST http://localhost:8000/api/v1/scans/<scan-id>/pause -H "Authorization: Bearer <token>"

# Cancel a scan
curl -X POST http://localhost:8000/api/v1/scans/<scan-id>/cancel -H "Authorization: Bearer <token>"

# View discovered assets from a scan
curl http://localhost:8000/api/v1/scans/<scan-id>/assets -H "Authorization: Bearer <token>"
```

### 8.5 Scheduled Scans

Scans can be scheduled via cron expressions on the connector:

| Cron Expression | Schedule |
|----------------|----------|
| `0 2 * * *` | Daily at 2:00 AM |
| `0 3 * * 0` | Weekly on Sunday at 3:00 AM |
| `0 0 1 * *` | Monthly on the 1st at midnight |
| `0 */6 * * *` | Every 6 hours |

---

## 9. Classification Rules

### 9.1 Built-in Rules

The platform ships with 15+ built-in regex patterns that are seeded automatically:

| Category | Pattern Detects | Example Match |
|----------|----------------|---------------|
| `pan` | Indian PAN number | `ABCDE1234F` |
| `aadhaar` | Aadhaar number | `2345 6789 0123` |
| `gstin` | GST Identification Number | `22AAAAA0000A1Z5` |
| `ifsc` | Bank IFSC code | `SBIN0001234` |
| `passport` | Passport number | `A1234567` |
| `driving_licence` | Indian driving licence | `KA01 2020 1234567` |
| `voter_id` | Voter ID (EPIC) | `ABC1234567` |
| `upi_id` | UPI payment ID | `user@upi` |
| `bank_account` | Bank account numbers | `1234567890123` |
| `cin` | Corporate Identity Number | `U12345MH2020PLC123456` |
| `pii` | Email addresses | `user@example.com` |
| `financial` | Credit card numbers | `4111111111111111` |
| `auth_secrets` | Passwords/tokens in code | `password: "secret123"` |
| `source_code_secrets` | AWS access keys | `AKIAIOSFODNN7EXAMPLE` |

### 9.2 Detection Methods

| Method | Code | Description |
|--------|------|-------------|
| Regex/Pattern | `regex` | Regular expression matching |
| Dictionary | `dictionary` | Match against word lists |
| Keyword/Context | `keyword` | Keyword presence with context |
| ML/NLP | `ml_nlp` | Machine learning classification (spaCy, Presidio) |
| Metadata | `metadata` | Infer from file/column names, tags |
| Custom | `custom` | User-defined logic |

### 9.3 Create a Custom Classification Rule

```bash
curl -X POST http://localhost:8000/api/v1/classification/rules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internal Employee ID",
    "description": "Detect company employee IDs in format EMP-XXXXXX",
    "category": "employee_id",
    "detection_method": "regex",
    "pattern": "\\bEMP-[0-9]{6}\\b",
    "default_level": "confidential",
    "enabled": true
  }'
```

### 9.4 Classification Levels

| Level | Code | Description |
|-------|------|-------------|
| Public | `public` | No restrictions |
| Internal | `internal` | Internal use only |
| Confidential | `confidential` | Limited access required |
| Restricted | `restricted` | Strict access controls |
| Highly Sensitive | `highly_sensitive` | Maximum protection required |

### 9.5 False Positive Feedback

```bash
curl -X POST http://localhost:8000/api/v1/classification/results/<result-id>/false-positive \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "notes": "This is a test data file, not real PAN numbers" }'
```

---

## 10. Policy & Compliance Setup

### 10.1 Supported Frameworks

| Framework | Code | Description |
|-----------|------|-------------|
| ISO 27001 | `iso_27001` | Information security management |
| SOC 2 | `soc2` | Service organization controls |
| PCI DSS | `pci_dss` | Payment card industry standard |
| GDPR | `gdpr` | EU data protection regulation |
| HIPAA | `hipaa` | US health data regulation |
| DPDPA | `dpdpa` | India Digital Personal Data Protection Act |
| RBI | `rbi` | Reserve Bank of India guidelines |
| SEBI | `sebi` | Securities and Exchange Board of India |
| IRDAI | `irdai` | Insurance Regulatory Authority of India |
| Custom | `custom` | Organization-specific policies |

### 10.2 Built-in Policy Rules

The platform includes these pre-configured rules:

1. **No Public Sensitive Data** - Sensitive data must not be publicly accessible
2. **Encryption Required** - Confidential/Restricted data must be encrypted
3. **No PII in Dev/Test** - PII must not exist in dev/test environments
4. **Data Residency** - Sensitive data must stay in permitted regions
5. **External Share Block** - Restricted data must not have external sharing enabled

### 10.3 Create a Custom Policy

```bash
curl -X POST http://localhost:8000/api/v1/policies/rules \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aadhaar Data Not in Public Buckets",
    "description": "Aadhaar data must never be stored in publicly accessible storage",
    "severity": "critical",
    "framework_id": "<dpdpa-framework-id>",
    "condition": {
      "all": [
        { "field": "classification.category", "op": "in", "value": ["aadhaar", "pan"] },
        { "field": "asset.exposure_status", "op": "eq", "value": "public" }
      ]
    },
    "control_mapping": ["DPDPA-5.1", "DPDPA-8.3"],
    "remediation_suggestion": "Remove public access from the storage asset and restrict to authorized personnel only",
    "continuous_monitoring": true
  }'
```

### 10.4 View Compliance Coverage

```bash
curl http://localhost:8000/api/v1/policies/compliance/coverage \
  -H "Authorization: Bearer <token>"
```

### 10.5 Export Compliance Evidence

```bash
curl http://localhost:8000/api/v1/reports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "report_type": "compliance",
    "name": "SOC 2 Q1 2026 Evidence",
    "format": "pdf",
    "filters": { "framework": "soc2" }
  }'
```

---

## 11. Integrations (Slack, Jira, SIEM)

### 11.1 Slack Notifications

Configure Slack via connector integration settings or organization settings. Alerts are sent via Incoming Webhook:

```json
{
  "integration_type": "slack",
  "config": {
    "webhook_url": "https://hooks.slack.com/services/T.../B.../xxx",
    "channel": "#dspm-alerts",
    "notify_severity": ["critical", "high"]
  }
}
```

### 11.2 Jira Ticket Creation

```json
{
  "integration_type": "jira",
  "config": {
    "base_url": "https://company.atlassian.net",
    "email": "automation@company.com",
    "api_token": "<jira-api-token>",
    "project_key": "SEC",
    "auto_create_severity": ["critical", "high"]
  }
}
```

### 11.3 SIEM Forwarding

**Splunk (HTTP Event Collector):**

```json
{
  "integration_type": "splunk",
  "config": {
    "hec_url": "https://splunk.company.com:8088/services/collector",
    "hec_token": "<splunk-hec-token>",
    "sourcetype": "dspm:alert"
  }
}
```

**Microsoft Sentinel:**

```json
{
  "integration_type": "sentinel",
  "config": {
    "workspace_id": "<log-analytics-workspace-id>",
    "shared_key": "<workspace-shared-key>",
    "log_type": "DSPMAlert"
  }
}
```

### 11.4 Webhook (Generic)

For custom integrations:

```json
{
  "integration_type": "webhook",
  "config": {
    "url": "https://internal.company.com/dspm-webhook",
    "headers": { "X-API-Key": "webhook-secret" },
    "events": ["alert.created", "alert.resolved", "scan.completed"]
  }
}
```

---

## 12. Kubernetes Deployment

### 12.1 Prerequisites

- Kubernetes cluster (1.28+)
- `kubectl` configured
- Container images built and pushed to a registry

### 12.2 Build & Push Images

```bash
# Backend
docker build -f deployment/docker/Dockerfile.backend -t techd/dspm-backend:0.1.0 .
docker push techd/dspm-backend:0.1.0

# Worker
docker build -f deployment/docker/Dockerfile.worker -t techd/dspm-worker:0.1.0 .
docker push techd/dspm-worker:0.1.0

# Frontend
docker build -f deployment/docker/Dockerfile.frontend -t techd/dspm-frontend:0.1.0 .
docker push techd/dspm-frontend:0.1.0
```

### 12.3 Deploy

```bash
# Create namespace
kubectl apply -f deployment/kubernetes/namespace.yaml

# Create ConfigMap
kubectl apply -f deployment/kubernetes/configmap.yaml

# Create secrets (edit with your values first)
kubectl create secret generic dspm-secrets -n dspm \
  --from-literal=DSPM_SECRET_KEY=$(openssl rand -hex 32) \
  --from-literal=DSPM_CREDENTIAL_ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())") \
  --from-literal=DSPM_DATABASE_URL="postgresql+asyncpg://dspm:password@postgres.dspm.svc:5432/dspm"

# Deploy backend and workers
kubectl apply -f deployment/kubernetes/backend-deployment.yaml
kubectl apply -f deployment/kubernetes/worker-deployment.yaml

# Deploy ingress
kubectl apply -f deployment/kubernetes/ingress.yaml

# Verify
kubectl get pods -n dspm
kubectl get svc -n dspm
```

### 12.4 ConfigMap Reference

See `deployment/kubernetes/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dspm-config
  namespace: dspm
data:
  DSPM_APP_NAME: "TechD DSPM"
  DSPM_DEBUG: "false"
  DSPM_LOG_LEVEL: "INFO"
  DSPM_MAX_SCAN_WORKERS: "10"
  DSPM_SCAN_SAMPLE_SIZE: "1000"
  DSPM_MAX_FILE_SIZE_MB: "100"
  DSPM_CORS_ORIGINS: '["https://dspm.techd.com"]'
  DSPM_ELASTICSEARCH_URL: "http://elasticsearch.dspm.svc.cluster.local:9200"
  DSPM_REDIS_URL: "redis://redis.dspm.svc.cluster.local:6379/0"
  DSPM_CELERY_BROKER_URL: "redis://redis.dspm.svc.cluster.local:6379/1"
  DSPM_CELERY_RESULT_BACKEND: "redis://redis.dspm.svc.cluster.local:6379/2"
```

---

## 13. Helm Chart Deployment

For customer-managed deployments:

### 13.1 Install

```bash
# Add dependency charts
helm repo add bitnami https://charts.bitnami.com/bitnami
helm dependency update deployment/helm/

# Install
helm install dspm deployment/helm/ \
  --namespace dspm \
  --create-namespace \
  --set postgresql.auth.password=<db-password> \
  --set-json 'ingress.hosts[0]={"host":"dspm.yourcompany.com","paths":[{"path":"/","pathType":"Prefix","service":"frontend"}]}' \
  --set-json 'ingress.hosts[1]={"host":"api.dspm.yourcompany.com","paths":[{"path":"/","pathType":"Prefix","service":"backend"}]}'
```

### 13.2 Key Helm Values

```yaml
# deployment/helm/values.yaml

replicaCount:
  backend: 3       # API replicas
  worker: 4        # Scan worker replicas
  frontend: 2      # Frontend replicas

autoscaling:
  worker:
    enabled: true
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilization: 70

resources:
  backend:
    requests: { cpu: 250m, memory: 512Mi }
    limits:   { cpu: "1", memory: 1Gi }
  worker:
    requests: { cpu: 500m, memory: 1Gi }
    limits:   { cpu: "2", memory: 2Gi }
  frontend:
    requests: { cpu: 100m, memory: 128Mi }
    limits:   { cpu: 500m, memory: 256Mi }
```

### 13.3 Upgrade

```bash
helm upgrade dspm deployment/helm/ --namespace dspm --reuse-values \
  --set image.backend.tag=0.2.0 \
  --set image.worker.tag=0.2.0 \
  --set image.frontend.tag=0.2.0
```

---

## 14. Security Hardening

### 14.1 Required for Production

| Item | Action |
|------|--------|
| Secret Key | Set `DSPM_SECRET_KEY` to a unique 64-char hex string |
| Encryption Key | Set `DSPM_CREDENTIAL_ENCRYPTION_KEY` to a Fernet key |
| Debug Mode | Set `DSPM_DEBUG=false` |
| CORS | Restrict `DSPM_CORS_ORIGINS` to your frontend domain only |
| TLS | Enable TLS termination at ingress/load balancer |
| Database | Use strong passwords, restrict network access |
| MFA | Enable `mfa_required` on the organization |
| IP Restrictions | Configure `allowed_ips` on the organization |
| Session Timeout | Set appropriate `session_timeout_minutes` |

### 14.2 Credential Security

- All connector credentials are encrypted at rest using Fernet symmetric encryption
- Credentials are never returned in API responses
- Use a secrets vault (HashiCorp Vault, AWS Secrets Manager) for the encryption key in production
- Rotate `DSPM_CREDENTIAL_ENCRYPTION_KEY` periodically (re-encrypt all stored credentials)

### 14.3 Network Security

```yaml
# Recommended: NetworkPolicy to restrict pod communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dspm-backend-policy
  namespace: dspm
spec:
  podSelector:
    matchLabels:
      app: dspm-backend
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: dspm-frontend
      ports:
        - port: 8000
```

### 14.4 API Security

- JWT tokens expire after 60 minutes (configurable)
- API rate limiting is enforced
- All endpoints require authentication (except `/health`, `/docs`)
- Role-based access control enforced per endpoint
- API tokens support scoped permissions

---

## 15. API Reference

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|--------------|
| POST | `/auth/register` | Register new user + org | No |
| POST | `/auth/login` | Login, get JWT tokens | No |

### Connector Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/connectors` | Create connector | super_admin, org_admin |
| GET | `/connectors` | List connectors | Any authenticated |
| GET | `/connectors/{id}` | Get connector details | Any authenticated |
| PATCH | `/connectors/{id}` | Update connector | super_admin, org_admin |
| DELETE | `/connectors/{id}` | Delete connector | super_admin, org_admin |
| POST | `/connectors/test` | Test connectivity | super_admin, org_admin |
| GET | `/connectors/{id}/health` | Get health status | Any authenticated |

### Scan Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/scans` | Trigger new scan | super_admin, org_admin, security_analyst |
| GET | `/scans` | List scan jobs | Any authenticated |
| GET | `/scans/{id}` | Get scan status | Any authenticated |
| POST | `/scans/{id}/pause` | Pause running scan | super_admin, org_admin, security_analyst |
| POST | `/scans/{id}/cancel` | Cancel scan | super_admin, org_admin, security_analyst |
| GET | `/scans/{id}/assets` | Get discovered assets | Any authenticated |

### Classification Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/classification/rules` | List classification rules |
| POST | `/classification/rules` | Create custom rule |
| GET | `/classification/results` | Get classification results |
| POST | `/classification/results/{id}/false-positive` | Mark as false positive |

### Asset Inventory Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/assets` | List/filter assets |
| GET | `/assets/{id}` | Get asset details |
| PATCH | `/assets/{id}/owner` | Update asset owner |
| GET | `/assets/summary` | Get asset summary stats |

### Identity & Access Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/identity/access/{asset_id}` | Who can access this asset? |
| GET | `/identity/user/{user_id}/assets` | What can this user access? |
| GET | `/identity/stale-access` | Find stale/orphaned access |

### Risk Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/risk/scores` | List risk scores |
| GET | `/risk/scores/{asset_id}` | Get asset risk score |
| GET | `/risk/summary` | Org-wide risk summary |
| GET | `/risk/trend` | Risk score over time |

### Policy Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/policies/rules` | List policy rules |
| POST | `/policies/rules` | Create custom policy |
| GET | `/policies/violations` | List violations |
| GET | `/policies/compliance/coverage` | Compliance coverage by framework |

### Alert Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/alerts` | List alerts |
| GET | `/alerts/{id}` | Get alert details |
| PATCH | `/alerts/{id}/status` | Update alert status |
| POST | `/alerts/{id}/assign` | Assign alert owner |
| POST | `/alerts/{id}/comments` | Add comment |

### Report Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reports` | Generate report |
| GET | `/reports` | List reports |
| GET | `/reports/{id}` | Get/download report |
| GET | `/reports/dashboards` | List dashboards |

### Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/users` | List users |
| POST | `/admin/users` | Create user |
| GET | `/admin/users/{id}` | Get user |
| DELETE | `/admin/users/{id}` | Deactivate user |
| GET | `/admin/roles` | List roles |
| POST | `/admin/api-tokens` | Create API token |
| GET | `/admin/api-tokens` | List API tokens |
| DELETE | `/admin/api-tokens/{id}` | Revoke token |

### Audit Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/audit/logs` | Search audit logs |
| GET | `/audit/export` | Export audit logs |

### Utility Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc documentation |
| GET | `/openapi.json` | OpenAPI schema |

---

## 16. Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check if PostgreSQL is reachable
pg_isready -h localhost -p 5432

# Check if Redis is reachable
redis-cli ping

# Check environment variables
grep DSPM_ backend/.env

# Run with debug logging
DSPM_DEBUG=true DSPM_LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

**Database connection errors:**
```bash
# Verify connection string format
# Must use asyncpg driver: postgresql+asyncpg://user:pass@host:5432/dbname

# Test direct connection
psql -U dspm -h localhost -d dspm
```

**Celery workers not processing tasks:**
```bash
# Check Redis connectivity
redis-cli -n 1 ping

# Check Celery worker status
celery -A app.workers.celery_app inspect active

# Check for queued tasks
celery -A app.workers.celery_app inspect reserved
```

**Frontend can't reach backend:**
```bash
# Verify CORS origins include frontend URL
echo $DSPM_CORS_ORIGINS

# Check NEXT_PUBLIC_API_URL points to backend
echo $NEXT_PUBLIC_API_URL

# Test backend directly
curl http://localhost:8000/health
```

**Elasticsearch connection issues:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health

# Verify DSPM_ELASTICSEARCH_URL is set correctly
curl $DSPM_ELASTICSEARCH_URL
```

**Scan failures:**
```bash
# Check scan status via API
curl http://localhost:8000/api/v1/scans/<scan-id> -H "Authorization: Bearer <token>"

# Check Celery worker logs
docker compose logs worker

# Check connector health
curl http://localhost:8000/api/v1/connectors/<id>/health -H "Authorization: Bearer <token>"
```

### Log Locations

| Component | Docker Compose | Kubernetes |
|-----------|---------------|------------|
| Backend | `docker compose logs backend` | `kubectl logs -l app=dspm-backend -n dspm` |
| Worker | `docker compose logs worker` | `kubectl logs -l app=dspm-worker -n dspm` |
| Frontend | `docker compose logs frontend` | `kubectl logs -l app=dspm-frontend -n dspm` |
| PostgreSQL | `docker compose logs postgres` | Depends on deployment |
| Redis | `docker compose logs redis` | Depends on deployment |

### Health Check Endpoints

```bash
# Backend
curl http://localhost:8000/health
# Expected: {"status": "healthy", "version": "0.1.0"}

# Elasticsearch
curl http://localhost:9200/_cluster/health
# Expected: {"status": "green" or "yellow"}

# Redis
redis-cli ping
# Expected: PONG
```
