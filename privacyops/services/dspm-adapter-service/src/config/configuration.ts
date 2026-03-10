export default () => ({
  port: parseInt(process.env.PORT || '3005', 10),
  dspm: {
    baseUrl: process.env.DSPM_API_URL || 'http://localhost:8000/api/v1',
    timeout: parseInt(process.env.DSPM_TIMEOUT || '30000', 10),
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'privacyops',
    password: process.env.DB_PASSWORD || 'privacyops',
    database: process.env.DB_DATABASE || 'privacyops_dspm',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.DB_LOGGING === 'true',
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS || 'localhost:9092',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
});
