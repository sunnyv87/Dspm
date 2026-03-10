export default () => ({
  serviceName: 'privacy-risk-service',
  port: parseInt(process.env.PORT, 10) || 3009,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'privacyops_privacy_risk',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
    clientId: 'privacy-risk-service',
    groupId: 'privacy-risk-service-group',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    keyPrefix: 'privacy-risk:',
  },
});
