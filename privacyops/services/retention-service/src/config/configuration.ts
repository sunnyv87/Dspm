export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
  synchronize: boolean;
  logging: boolean;
  maxConnections: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  keyPrefix: string;
}

export interface JwtConfig {
  secret: string;
  algorithm: string;
  accessTokenTtl: number;
  refreshTokenTtl: number;
  issuer: string;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
  ssl: boolean;
  saslUsername: string;
  saslPassword: string;
}

export interface DspmConfig {
  serviceName: string;
  environment: string;
  logLevel: string;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
  discoveryServiceUrl: string;
}

export interface AppConfig {
  port: number;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  kafka: KafkaConfig;
  dspm: DspmConfig;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3010', 10),

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'privacyops',
    password: process.env.DB_PASSWORD || 'privacyops',
    database: process.env.DB_DATABASE || 'privacyops_retention',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    logging: process.env.DB_LOGGING === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'retention:',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10),
    refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL || '604800', 10),
    issuer: process.env.JWT_ISSUER || 'privacyops-auth',
  },

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'retention-service',
    groupId: process.env.KAFKA_GROUP_ID || 'retention-service-group',
    ssl: process.env.KAFKA_SSL === 'true',
    saslUsername: process.env.KAFKA_SASL_USERNAME || '',
    saslPassword: process.env.KAFKA_SASL_PASSWORD || '',
  },

  dspm: {
    serviceName: 'retention-service',
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
    discoveryServiceUrl: process.env.DISCOVERY_SERVICE_URL || 'http://localhost:3004',
  },
});
