# TechD PrivacyOps — Privacy Operations Microservices Platform

> **Version:** 2.0 | **Last Updated:** March 2026
>
> Enterprise-grade privacy operations platform built on NestJS microservices architecture, extending the TechD DSPM module with comprehensive privacy management capabilities including consent management, data subject rights (DSAR), breach monitoring, vendor risk, compliance AI with ISO 27701/GDPR/CCPA/HIPAA, workflow orchestration, and unified reporting.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                                │
│                              Port 3000                                      │
└───────────────────────┬─────────────────────┬───────────────────────────────┘
                        │                     │
                        ▼                     ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│      Dashboard BFF           │  │      Auth Service             │
│      Port 3010               │  │      Port 3001                │
│  (Aggregates all services)   │  │  (JWT, RBAC, Multi-tenant)    │
└──────────┬───────────────────┘  └───────────────────────────────┘
           │
           │  HTTP / Kafka
           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Domain Microservices                                  │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐      │
│  │ Discovery   │ │ Classific.  │ │ Consent      │ │ Privacy Risk     │      │
│  │ Port 3005   │ │ Port 3008   │ │ Port 3006    │ │ Port 3009        │      │
│  └─────────────┘ └─────────────┘ └──────────────┘ └──────────────────┘      │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐      │
│  │ Vendor Risk │ │ Breach Mon. │ │ Compliance   │ │ Rights (DSAR)    │      │
│  │ Port 3012   │ │ Port 3013   │ │ AI Port 3014 │ │ Port 3015        │      │
│  └─────────────┘ └─────────────┘ └──────────────┘ └──────────────────┘      │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐      │
│  │ Retention   │ │ Reporting   │ │ Workflow Svc │ │ Workflow Engine   │      │
│  │ Port 3016   │ │ Port 3017   │ │ Port 3011    │ │ (internal)       │      │
│  └─────────────┘ └─────────────┘ └──────────────┘ └──────────────────┘      │
│                                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐                           │
│  │ Audit       │ │ Notific.    │ │ DSPM Adapter │                           │
│  │ Port 3007   │ │ (internal)  │ │ Port 3004    │                           │
│  └─────────────┘ └─────────────┘ └──────────────┘                           │
└──────────────────────────────────────────────────────────────────────────────┘
           │                     │                      │
           ▼                     ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌───────────────────┐
│   PostgreSQL 16  │  │  Apache Kafka    │  │  Redis 7 (Cache)  │
│   (per-service)  │  │  (Event Bus)     │  │                   │
└──────────────────┘  └──────────────────┘  └───────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Microservices | NestJS, TypeScript | 10.3, 5.3 |
| Database | PostgreSQL + TypeORM | 16, 0.3 |
| Event Bus | Apache Kafka (KafkaJS) | 2.2 |
| Auth | JWT (HMAC SHA-256), RBAC | Custom |
| API Docs | Swagger / OpenAPI | 7.2 |
| Cache | Redis | 7 |
| Search | OpenSearch | 2.x |
| Containers | Docker (multi-stage Node 20 Alpine) | — |
| Validation | class-validator, class-transformer | 0.14, 0.5 |

## Services Overview (17)

### Core Infrastructure

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **auth-service** | 3001 | auth | JWT authentication, RBAC, user management, multi-tenant |
| **audit-ledger-service** | 3007 | audit_ledger | Immutable audit logging, OpenSearch integration |
| **notification-service** | — | — | Event-driven notifications (email, webhook) |
| **dashboard-bff** | 3010 | — (aggregator) | Backend-For-Frontend aggregating all services for the UI |

### Data Discovery & Classification

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **discovery-service** | 3005 | discovery | Automated data asset discovery, lineage mapping |
| **classification-service** | 3008 | classification | Data classification policies, review workflows, DSPM client |
| **dspm-adapter-service** | 3004 | privacyops_dspm | Bridge to TechD DSPM module (connectors, scans, assets, risk) |

### Privacy Operations

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **consent-service** | 3006 | consent | Consent purpose management, policy versions, tracking, webhooks, analytics |
| **rights-service** | 3015 | rights_service | Data Subject Access Requests (DSAR), task management, data subjects |
| **privacy-risk-service** | 3009 | privacy_risk | Privacy impact assessments, processing activities |
| **retention-service** | 3016 | retention_service | Retention policies, schedules, automated execution |

### Risk & Compliance

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **vendor-risk-service** | 3012 | vendor_risk | Vendor assessments, questionnaires, risk findings |
| **breach-monitoring-service** | 3013 | breach_monitoring | Breach incidents, GDPR 72h notifications, timeline tracking |
| **compliance-ai-service** | 3014 | compliance_ai | AI compliance scans, ISO 27701/GDPR/CCPA/HIPAA frameworks, DSPM integration |

### Workflow & Reporting

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **workflow-service** | 3011 | workflow_service | Workflow definitions, instances, tasks, approvals |
| **workflow-engine** | — | — | Step execution engine (internal) |
| **reporting-service** | 3017 | reporting_service | Report definitions, scheduled generation, execution tracking |

## Compliance Frameworks

The compliance-ai-service includes pre-built framework seeds with full control sets:

| Framework | Controls | Coverage |
|-----------|----------|----------|
| **ISO 27701:2019** | 63 controls | PIMS — Clauses 5-8, Annex A/B (Controllers + Processors) |
| **GDPR** | 25 controls | EU 2016/679 — Articles 5-44 |
| **CCPA/CPRA** | 14 controls | California Consumer Privacy Act |
| **HIPAA** | 20 controls | Health Insurance Portability — Privacy, Security, Breach Rules |

### ISO 27701 PIMS Control Categories

| Category | Controls | Severity |
|----------|----------|----------|
| Data Protection | 14 | CRITICAL |
| Data Subject Rights | 6 | CRITICAL |
| Consent Management | 4 | CRITICAL |
| Data Transfer | 5 | HIGH |
| Data Retention | 5 | HIGH |
| Encryption | 3 | HIGH |
| Access Control | 2 | HIGH |
| Vendor Management | 6 | HIGH |
| Incident Response | 2 | HIGH |
| Compliance | 4 | HIGH |
| Governance | 6 | MEDIUM |
| Risk Management | 3 | MEDIUM |
| Transparency | 2 | MEDIUM |
| Audit Logging | 2 | MEDIUM |
| Documentation | 2 | LOW |
| Training | 1 | LOW |
| Business Continuity | 1 | MEDIUM |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- Apache Kafka
- Redis 7
- Docker (optional)

### 1. Clone & Install

```bash
cd privacyops
npm install   # from monorepo root
```

### 2. Environment Configuration

Each service reads from `.env` or `.env.local`. Required variables:

```bash
# Database (per service)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=privacyops
DB_PASSWORD=privacyops
DB_DATABASE=<service_db_name>

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT (shared secret across all services)
JWT_SECRET=<your-secret-key>

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# DSPM Adapter (for compliance-ai-service)
DSPM_ADAPTER_SERVICE_URL=http://localhost:3004
```

### 3. Create Databases

```sql
CREATE DATABASE auth;
CREATE DATABASE consent;
CREATE DATABASE audit_ledger;
CREATE DATABASE discovery;
CREATE DATABASE classification;
CREATE DATABASE privacy_risk;
CREATE DATABASE privacyops_dspm;
CREATE DATABASE vendor_risk;
CREATE DATABASE breach_monitoring;
CREATE DATABASE compliance_ai;
CREATE DATABASE workflow_service;
CREATE DATABASE rights_service;
CREATE DATABASE retention_service;
CREATE DATABASE reporting_service;
```

### 4. Start Services

```bash
# Start individual service
cd services/compliance-ai-service
npm run start:dev

# Or with Docker
docker-compose up -d
```

### 5. Seed Compliance Frameworks

```bash
# Seed ISO 27701 for a tenant
curl -X POST http://localhost:3014/api/v1/compliance-ai/frameworks/seeds/ISO27701 \
  -H "Authorization: Bearer <token>"

# Seed all frameworks (ISO27701, GDPR, CCPA, HIPAA)
curl -X POST http://localhost:3014/api/v1/compliance-ai/frameworks/seeds \
  -H "Authorization: Bearer <token>"

# List available seeds (public endpoint)
curl http://localhost:3014/api/v1/compliance-ai/frameworks/seeds/available
```

## API Documentation

Each service exposes Swagger documentation:

| Service | Swagger URL |
|---------|------------|
| Consent | http://localhost:3006/api/docs/consent |
| Audit Ledger | http://localhost:3007/api/docs |
| Vendor Risk | http://localhost:3012/api/docs/vendor-risk |
| Breach Monitoring | http://localhost:3013/api/docs/breach |
| Compliance AI | http://localhost:3014/api/docs/compliance-ai |
| Rights (DSAR) | http://localhost:3015/api/docs/rights |
| Retention | http://localhost:3016/api/docs/retention |
| Reporting | http://localhost:3017/api/docs/reports |
| Dashboard BFF | http://localhost:3010/api/docs/dashboard |
| Workflow | http://localhost:3011/api/docs/workflows |

## Authentication & Multi-Tenancy

All services use a shared JWT-based auth pattern:

```
Authorization: Bearer <jwt-token>
```

JWT payload must include:
```json
{
  "sub": "<user-id>",
  "email": "user@example.com",
  "tenantId": "<tenant-uuid>",
  "roles": ["admin"],
  "permissions": ["compliance.scan.read", "compliance.framework.manage"],
  "iat": 1710000000,
  "exp": 1710003600
}
```

**Multi-tenancy**: All data is scoped by `tenantId`. The `TenantGuard` ensures users can only access data within their tenant. Super admins (`role: super_admin`) can access any tenant.

## Event-Driven Architecture

Services communicate via Kafka events:

| Topic Pattern | Examples |
|---------------|----------|
| `consent.*` | `consent.captured`, `consent.withdrawn` |
| `breach.*` | `breach.detected`, `breach.notification.sent` |
| `compliance-ai.*` | `compliance-ai.scan.completed`, `compliance-ai.framework.seeded` |
| `vendor-risk.*` | `vendor-risk.assessment.completed` |
| `rights.*` | `rights.request.submitted`, `rights.task.completed` |
| `retention.*` | `retention.execution.completed` |
| `workflow.*` | `workflow.task.completed`, `workflow.approval.submitted` |
| `audit.*` | `audit.entry.created` |

## DSPM Integration

The platform integrates with the TechD DSPM module via two paths:

1. **dspm-adapter-service**: Direct proxy to the DSPM API for connectors, scans, assets, classifications, and risk scores.
2. **compliance-ai DSPM Integration**: Pulls DSPM posture data to enrich compliance scans with actual data security context.

```
TechD DSPM Module ←→ dspm-adapter-service ←→ compliance-ai-service
                                            ←→ dashboard-bff
                                            ←→ discovery-service
```

### DSPM Posture Endpoint

```bash
GET /api/v1/compliance-ai/dspm/posture
```

Returns aggregated DSPM data: discovered assets, classifications, risk scores, policy violations, and security alerts.

## Security

### Authentication
- JWT tokens with HMAC SHA-256 signature verification
- Token expiration checking
- `@Public()` decorator to skip auth on specific endpoints (e.g., health checks)

### Authorization
- Role-Based Access Control (RBAC) via `@Permissions()` decorator
- Tenant isolation enforced by `TenantGuard`
- Super admin bypass for cross-tenant operations

### Input Validation
- `class-validator` with `whitelist: true` and `forbidNonWhitelisted: true`
- All DTOs validated via `ValidationPipe`
- `ParseUUIDPipe` for all ID parameters

### API Security
- CORS configuration per service
- Global exception filter prevents stack trace leakage
- Audit interceptor logs all mutation operations

### Infrastructure
- Kafka SSL/SASL support
- PostgreSQL SSL support
- Redis password authentication

## Project Structure

```
privacyops/
├── services/
│   ├── auth-service/              # JWT auth, RBAC, users
│   ├── audit-ledger-service/      # Immutable audit logging
│   ├── breach-monitoring-service/ # Breach incidents, notifications
│   ├── classification-service/    # Data classification
│   ├── compliance-ai-service/     # AI compliance + ISO 27701
│   │   └── src/modules/framework/seed/
│   │       ├── iso27701-controls.ts  # 63 PIMS controls
│   │       └── framework-seeds.ts    # All framework seeds
│   ├── consent-service/           # Consent management
│   ├── dashboard-bff/             # UI aggregation layer
│   ├── discovery-service/         # Asset discovery
│   ├── dspm-adapter-service/      # DSPM module bridge
│   ├── notification-service/      # Event notifications
│   ├── privacy-risk-service/      # Privacy risk assessments
│   ├── reporting-service/         # Report generation
│   ├── retention-service/         # Data retention policies
│   ├── rights-service/            # DSAR management
│   ├── vendor-risk-service/       # Third-party vendor risk
│   ├── workflow-engine/           # Step execution engine
│   └── workflow-service/          # Workflow orchestration
└── README.md                      # This file
```

## Docker Deployment

Each service includes a production-optimized Dockerfile:

```bash
# Build a single service
docker build -t privacyops/compliance-ai-service ./services/compliance-ai-service

# Run with environment variables
docker run -p 3014:3014 \
  -e DB_HOST=postgres \
  -e KAFKA_BROKERS=kafka:9092 \
  -e JWT_SECRET=your-secret \
  privacyops/compliance-ai-service
```

## License

Copyright (c) 2026 TechD. All rights reserved.
