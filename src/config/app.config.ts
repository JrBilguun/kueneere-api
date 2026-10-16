import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3003', 10) || 3003,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  runMigrationsOnBoot: process.env.RUN_MIGRATIONS_ON_BOOT === 'true',
  freeDeliveryThreshold: parseInt(
    process.env.FREE_DELIVERY_THRESHOLD || '150000',
    10,
  ),
  deliveryFee: parseInt(process.env.DELIVERY_FEE || '6000', 10),
  /** Энэ API-ийн гаднаас харагдах хаяг (локал upload-ийн URL үүсгэхэд) */
  publicUrl:
    process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3003}`,
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
}));
