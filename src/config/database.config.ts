import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging:
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  poolSize: process.env.NODE_ENV === 'production' ? 20 : 5,
  connectTimeout: 10000,
  charset: 'utf8mb4',
  timezone: 'Z',
  // Docker дотор (mysql контейнер) SSL хэрэггүй. Managed DB (RDS г.м) бол DB_SSL=true
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));
