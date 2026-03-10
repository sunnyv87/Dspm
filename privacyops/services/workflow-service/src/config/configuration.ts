export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl: boolean;
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
  port: parseInt(process.env.PORT || '3011', 10),

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'privacyops',
    password: process.env.DB_PASSWORD || 'privacyops',
    database: process.env.DB_DATABASE || 'workflow_service',
    ssl: process.env.DB_SSL === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'workflow:',
  },

  jwt: {
    secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-only-secret'),
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL || '900', 10),
    refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL || '604800', 10),
    issuer: process.env.JWT_ISSUER || 'privacyops-auth',
  },

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'workflow-service',
    groupId: process.env.KAFKA_GROUP_ID || 'workflow-service-group',
    ssl: process.env.KAFKA_SSL === 'true',
    saslUsername: process.env.KAFKA_SASL_USERNAME || '',
    saslPassword: process.env.KAFKA_SASL_PASSWORD || '',
  },

  dspm: {
    serviceName: 'workflow-service',
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  },
});
