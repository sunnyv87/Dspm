# TechD DSPM — Data Security Posture Management Platform

A comprehensive enterprise-grade platform for discovering, classifying, and securing sensitive data across your entire infrastructure — cloud, on-prem, SaaS, databases, and code repositories.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────────────────┐
│   Next.js    │────▶│   FastAPI    │────▶│       PostgreSQL 16          │
│  Frontend    │     │   Backend    │     │    (async via asyncpg)       │
│  Port 3000   │     │  Port 8000   │     └──────────────────────────────┘
└──────────────┘     └──────┬───────┘
                            │          ┌──────────────────────────────┐
                            ├────────▶│     Redis 7 (Cache/Broker)   │
                            │          └──────────────────────────────┘
                            │          ┌──────────────────────────────┐
                            ├────────▶│   Elasticsearch 8.12         │
                            │          └──────────────────────────────┘
                            │          ┌──────────────────────────────┐
                            └────────▶│   Celery Workers (×2)        │
                                       │   Scan Pipeline Engine       │
                                       └──────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS | 14.1, 18.2, 5.3, 3.4 |
| Backend | FastAPI, SQLAlchemy, Pydantic | 0.109, 2.0, 2.6 |
| Database | PostgreSQL (asyncpg) | 16 |
| Cache/Queue | Redis | 7 |
| Search | Elasticsearch | 8.12 |
| Task Queue | Celery | 5.3 |
| NLP/PII | spaCy, Presidio | 3.7, 2.2 |
| Auth | JWT (python-jose), bcrypt | HS256 |
| State Mgmt | Zustand, React Query | 4.5, 5.17 |
| Charts | Recharts | 2.12 |
| Containers | Docker, Docker Compose, Kubernetes, Helm | — |

## Core Modules (12)

| # | Module | Description |
|---|--------|-------------|
| 1 | **Admin & Access** | Users, roles (RBAC), organizations, API tokens |
| 2 | **Connector Engine** | 59 connector types across 10 categories |
| 3 | **Discovery & Scanning** | Automated asset discovery via Celery pipeline |
| 4 | **Classification Engine** | 26 regex patterns for PII, secrets, financial data |
| 5 | **Asset Inventory** | Centralized catalog with tagging and ownership |
| 6 | **Identity & Access** | IAM analysis — excessive permissions, toxic combos, orphaned accounts |
| 7 | **Risk Scoring** | Weighted multi-factor risk calculation (0–100) |
| 8 | **Policy & Compliance** | 10 frameworks (ISO 27001, SOC2, GDPR, DPDPA, PCI DSS, etc.) |
| 9 | **Alerts & Remediation** | Severity-based alerts with workflow lifecycle |
| 10 | **Reporting** | Executive dashboards, custom reports, PDF/XLSX export |
| 11 | **Audit Logging** | Immutable event trail for compliance |
| 12 | **AI Security Assistant** | Natural language queries for CISO reporting |

## Connector Coverage (59 Types)

| Category | Connectors | Count |
|----------|-----------|-------|
| **Cloud Storage** | AWS S3, Azure Blob, ADLS, GCS, OneDrive, SharePoint Online, Google Drive, Box, Dropbox, Egnyte | 10 |
| **Databases** | PostgreSQL, MySQL, MSSQL, Oracle, MariaDB, IBM Db2, MongoDB, Cassandra | 8 |
| **Data Warehouses** | Snowflake, BigQuery, Redshift, Azure Synapse, Databricks, HDFS | 6 |
| **SaaS / Collaboration** | Microsoft 365, Teams, Google Workspace, Gmail, Slack, Jira, Confluence, Salesforce | 8 |
| **On-Prem Storage** | SMB (Windows File Server), NFS, Local FS, On-Prem SharePoint | 4 |
| **Cloud Infrastructure** | AWS (full account), Azure Subscription, GCP (full project) | 3 |
| **Identity & Access** | Azure AD, AWS IAM, Google IAM, LDAP, Microsoft AD, Okta, Ping Identity | 7 |
| **DevOps / Code Repos** | GitHub, GitLab, Bitbucket, Azure DevOps | 4 |
| **Security Platforms** | Forcepoint DLP, Splunk SIEM, IBM QRadar, SOAR, CASB | 5 |
| **Backup & Snapshot** | AWS EBS Snapshots, Azure VM Snapshots, Backup Repos, Archive Storage | 4 |

Each connector implements: `test_connection()`, `list_assets()`, `fetch_metadata()`, `scan_content()`

## Sensitive Data Detection (26 Patterns)

| Category | Patterns |
|----------|----------|
| **India PII** | PAN, Aadhaar, GSTIN, IFSC, Passport, Driving Licence, Voter ID, UPI ID, Bank Account, CIN |
| **Global PII** | Email, SSN, Phone Number, Date of Birth |
| **Financial** | Visa/MasterCard/Amex card numbers |
| **Auth Secrets** | Passwords, API keys, tokens in config files |
| **DevOps Secrets** | AWS keys (AKIA), Private keys, GCP service accounts, Azure client secrets, GitHub tokens, Slack tokens, JWTs, DB connection strings, SSH keys, Certificates |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- `openssl` (for secret generation)

### 1. Clone and configure

```bash
git clone https://github.com/sunnyv87/Dspm.git
cd Dspm

# Generate required secrets
cp backend/.env.example .env

# Generate secret key
echo "DSPM_SECRET_KEY=$(openssl rand -hex 32)" >> .env

# Generate encryption key
echo "DSPM_CREDENTIAL_ENCRYPTION_KEY=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')" >> .env

# Set passwords (change these for production)
echo "POSTGRES_PASSWORD=your_secure_pg_password" >> .env
echo "REDIS_PASSWORD=your_secure_redis_password" >> .env
echo "ELASTIC_PASSWORD=your_secure_es_password" >> .env
```

### 2. Start all services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **Elasticsearch 8.12** on `localhost:9200`
- **FastAPI Backend** on `localhost:8000`
- **Celery Workers** (2 replicas, 4 concurrency each)
- **Next.js Frontend** on `localhost:3000`

### 3. Run database migrations

```bash
docker-compose exec backend alembic upgrade head
```

### 4. Access the platform

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Register a new account (if `DSPM_ALLOW_PUBLIC_REGISTRATION=true`)
- Or contact your administrator for credentials
- Default new accounts receive the `read_only` role

## API Reference

**Base URL:** `http://localhost:8000/api/v1`

### Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "YourPassword123!"}'

# Response: { "access_token": "eyJ...", "refresh_token": "eyJ...", "token_type": "bearer" }
```

### Endpoints

| Module | Prefix | Key Operations |
|--------|--------|---------------|
| Auth | `/auth` | Login, register |
| Connectors | `/connectors` | CRUD, test connectivity, health check |
| Scans | `/scans` | Create, list, pause, cancel, view assets |
| Classification | `/classification` | Rules, results, feedback (false positive) |
| Assets | `/assets` | List, filter, tag, assign owners |
| Identity | `/identity` | Users, permissions, findings |
| Risk | `/risk` | Scores, factors, history |
| Policies | `/policies` | Frameworks, rules, violations |
| Alerts | `/alerts` | List, acknowledge, comment, remediate |
| Reports | `/reports` | Generate, dashboards, widgets |
| Admin | `/admin` | Users, roles, API tokens, org settings |
| Audit | `/audit` | Event log (immutable) |
| AI Query | `/ai_query` | Natural language security queries |

### Example: Add a connector and scan

```bash
TOKEN="eyJ..."

# 1. Create an AWS S3 connector
curl -X POST http://localhost:8000/api/v1/connectors/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production S3",
    "connector_type": "aws_s3",
    "credential_type": "api_key",
    "config": { "region": "ap-south-1" },
    "credentials": [
      { "key_name": "access_key", "value": "AKIA..." },
      { "key_name": "secret_key", "value": "wJa..." }
    ]
  }'

# 2. Test connectivity
curl -X POST http://localhost:8000/api/v1/connectors/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connector_type": "aws_s3",
    "config": { "region": "ap-south-1" },
    "credentials": [
      { "key_name": "access_key", "value": "AKIA..." },
      { "key_name": "secret_key", "value": "wJa..." }
    ]
  }'

# 3. Trigger a scan
curl -X POST http://localhost:8000/api/v1/scans/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connector_id": "<connector-uuid>",
    "scan_type": "full"
  }'
```

## Scan Pipeline

When a scan is triggered, the Celery worker executes this pipeline:

```
1. DISCOVERY          → Connector handler enumerates all assets
2. METADATA           → Fetch encryption, exposure, size, region per asset
3. CONTENT SCAN       → Retrieve content samples (first 64KB)
4. CLASSIFICATION     → Run 26 regex patterns against content
5. RISK SCORING       → Calculate weighted score (sensitivity, exposure, encryption, access)
6. POLICY EVALUATION  → Check against compliance framework rules
7. ALERT GENERATION   → Create alerts for policy violations
```

**Risk Score Weights:**

| Factor | Weight |
|--------|--------|
| Data sensitivity | 3.0 |
| Public accessibility | 2.5 |
| Encryption status | 2.0 |
| External sharing | 2.0 |
| Privileged user access | 1.5 |
| Dev/test exposure | 1.5 |
| Data duplication | 1.0 |
| Data staleness | 0.5 |

## Compliance Frameworks

Built-in support for 10 compliance frameworks:

- ISO 27001
- SOC 2
- PCI DSS
- GDPR
- HIPAA
- DPDPA (India)
- RBI (India)
- SEBI (India)
- IRDAI (India)
- Custom

**Built-in policy rules:**
1. No publicly accessible sensitive data (CRITICAL)
2. Sensitive data must be encrypted (HIGH)
3. No sensitive data in non-production environments (HIGH)
4. No external sharing of restricted data (CRITICAL)
5. India data residency — Aadhaar/PAN must be in India region (HIGH)

## Project Structure

```
Dspm/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── core/                   # Config, database, security
│   │   ├── api/v1/                 # 13 endpoint modules
│   │   ├── models/                 # 11 SQLAlchemy model modules
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── services/               # 12 business logic services
│   │   │   └── connector/
│   │   │       ├── service.py      # Connector CRUD
│   │   │       └── handlers.py     # 60 connector handler classes
│   │   ├── workers/                # Celery scan pipeline
│   │   └── utils/                  # Integration utilities
│   ├── migrations/                 # Alembic database migrations
│   ├── tests/                      # pytest test suite
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                    # Next.js pages
│   │   ├── components/             # React components by feature
│   │   │   ├── ai/                 # AI Security Assistant
│   │   │   ├── alerts/             # Alert management
│   │   │   ├── assets/             # Asset inventory
│   │   │   ├── compliance/         # Compliance dashboard
│   │   │   ├── connectors/         # Connector configuration
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   ├── common/             # Shared components
│   │   │   └── layout/             # Sidebar, login
│   │   ├── lib/                    # API client, state store
│   │   └── types/                  # TypeScript definitions
│   └── package.json
├── deployment/
│   ├── docker/                     # Dockerfiles (backend, frontend, worker)
│   ├── kubernetes/                 # K8s manifests
│   └── helm/                       # Helm charts
├── docs/
│   └── USER_GUIDE.md              # Full user guide with connector reference
└── docker-compose.yml              # Local development stack
```

## Local Development (without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your database/redis URLs

# Run migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --workers 1

# Start Celery worker (separate terminal)
celery -A app.workers.celery_app worker --loglevel=info --concurrency=4
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start dev server
npm run dev
```

## Kubernetes Deployment

```bash
# Using manifests
kubectl apply -f deployment/kubernetes/namespace.yaml
kubectl apply -f deployment/kubernetes/configmap.yaml
kubectl apply -f deployment/kubernetes/backend-deployment.yaml
kubectl apply -f deployment/kubernetes/worker-deployment.yaml
kubectl apply -f deployment/kubernetes/ingress.yaml

# Using Helm
helm install dspm deployment/helm/ \
  --set secrets.secretKey=$(openssl rand -hex 32) \
  --set secrets.encryptionKey=$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DSPM_SECRET_KEY` | Yes | — | JWT signing key (`openssl rand -hex 32`) |
| `DSPM_CREDENTIAL_ENCRYPTION_KEY` | Yes | — | Fernet key for credential encryption |
| `DSPM_DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `DSPM_REDIS_URL` | Yes | — | Redis connection string |
| `DSPM_CELERY_BROKER_URL` | Yes | — | Celery broker (Redis) |
| `DSPM_CELERY_RESULT_BACKEND` | Yes | — | Celery results (Redis) |
| `DSPM_ELASTICSEARCH_URL` | Yes | — | Elasticsearch connection |
| `DSPM_CORS_ORIGINS` | No | `["http://localhost:3000"]` | Allowed CORS origins |
| `DSPM_DEBUG` | No | `false` | Debug mode |
| `DSPM_LOG_LEVEL` | No | `INFO` | Logging level |
| `DSPM_MAX_SCAN_WORKERS` | No | `10` | Max concurrent scan workers |
| `DSPM_SCAN_SAMPLE_SIZE` | No | `1000` | Rows sampled per table |
| `DSPM_MAX_FILE_SIZE_MB` | No | `100` | Max file size for scanning |
| `DSPM_ALLOW_PUBLIC_REGISTRATION` | No | `false` | Allow self-registration |
| `DSPM_KAFKA_BOOTSTRAP_SERVERS` | No | `localhost:9092` | Kafka broker for events |

## Security Features

- **Credential Encryption** — All connector credentials encrypted at rest (Fernet)
- **SSRF Protection** — Blocks connections to internal/private/reserved IP ranges and cloud metadata endpoints
- **JWT Authentication** — HS256 with issuer/audience validation, 60-min access + 7-day refresh tokens
- **Password Policy** — 12+ characters, uppercase, lowercase, digit, special character
- **RBAC** — 4 roles: `super_admin`, `org_admin`, `security_analyst`, `read_only`
- **Tenant Isolation** — All queries scoped by `org_id`
- **Field Allowlisting** — Prevents mass assignment on updates
- **Rate Limiting** — Per-IP throttling on auth endpoints
- **Audit Trail** — Immutable log of all user actions
- **Secure Cookies** — HTTP-only, SameSite=Strict, Secure flags

## AI Security Assistant

Ask questions in plain English. All processing is on-premise (rule-based NLP, no external APIs).

```
"What is our overall security posture?"
"Show me all critical alerts"
"Are any sensitive assets publicly exposed?"
"What is our GDPR compliance status?"
"Any excessive access findings?"
"Are all connectors healthy?"
```

The AI module supports 25+ intent types across 6 categories: executive overview, risk & threats, data exposure, compliance, identity & access, and infrastructure health.

## License

Proprietary — TechD Solutions. All rights reserved.
