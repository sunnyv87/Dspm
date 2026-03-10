export default () => ({
  port: parseInt(process.env.PORT, 10) || 3007,
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'audit_ledger',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 20,
  },

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'audit-ledger-service',
    groupId: process.env.KAFKA_GROUP_ID || 'audit-ledger-consumer',
    ssl: process.env.KAFKA_SSL === 'true',
    saslMechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
    saslUsername: process.env.KAFKA_SASL_USERNAME,
    saslPassword: process.env.KAFKA_SASL_PASSWORD,
    connectionTimeout: parseInt(process.env.KAFKA_CONNECTION_TIMEOUT, 10) || 3000,
    requestTimeout: parseInt(process.env.KAFKA_REQUEST_TIMEOUT, 10) || 30000,
  },

  opensearch: {
    node: process.env.OPENSEARCH_NODE || 'https://localhost:9200',
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin',
    ssl: {
      rejectUnauthorized: process.env.OPENSEARCH_SSL_VERIFY !== 'false',
    },
    indexPrefix: process.env.OPENSEARCH_INDEX_PREFIX || 'audit',
    numberOfShards: parseInt(process.env.OPENSEARCH_SHARDS, 10) || 3,
    numberOfReplicas: parseInt(process.env.OPENSEARCH_REPLICAS, 10) || 1,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    keyPrefix: 'audit:',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },

  internalApiKey: process.env.INTERNAL_API_KEY || 'change-me-in-production',

  retention: {
    defaultDays: parseInt(process.env.DEFAULT_RETENTION_DAYS, 10) || 2555,
    archiveAfterDays: parseInt(process.env.ARCHIVE_AFTER_DAYS, 10) || 365,
  },

  export: {
    maxRows: parseInt(process.env.EXPORT_MAX_ROWS, 10) || 100000,
    chunkSize: parseInt(process.env.EXPORT_CHUNK_SIZE, 10) || 5000,
  },
});
