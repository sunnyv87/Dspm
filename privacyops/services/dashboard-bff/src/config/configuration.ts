export default () => ({
  port: parseInt(process.env.PORT, 10) || 3010,
  environment: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    clientId: 'dashboard-bff',
    groupId: 'dashboard-bff-group',
  },
  services: {
    discoveryUrl: process.env.DISCOVERY_SERVICE_URL || 'http://localhost:3005',
    consentUrl: process.env.CONSENT_SERVICE_URL || 'http://localhost:3006',
    auditUrl: process.env.AUDIT_SERVICE_URL || 'http://localhost:3007',
    classificationUrl: process.env.CLASSIFICATION_SERVICE_URL || 'http://localhost:3008',
    privacyRiskUrl: process.env.PRIVACY_RISK_SERVICE_URL || 'http://localhost:3009',
    vendorRiskUrl: process.env.VENDOR_RISK_SERVICE_URL || 'http://localhost:3012',
    breachUrl: process.env.BREACH_SERVICE_URL || 'http://localhost:3013',
    complianceAiUrl: process.env.COMPLIANCE_AI_SERVICE_URL || 'http://localhost:3014',
    rightsUrl: process.env.RIGHTS_SERVICE_URL || 'http://localhost:3015',
    retentionUrl: process.env.RETENTION_SERVICE_URL || 'http://localhost:3016',
  },
  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT, 10) || 5000,
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS, 10) || 3,
  },
});
