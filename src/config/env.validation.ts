import * as Joi from 'joi';

/**
 * Орчны хувьсагчийн шалгалт (khurd-api-тай ижил зарчим).
 * Шаардлагатай утга дутвал апп асахгүй — алдааг шууд харуулна.
 */
export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3003),

  // Database (MySQL 8)
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS — kueneree (дэлгүүр) болон kueneere-admin-ий хаягууд, таслалаар
  CORS_ORIGINS: Joi.string().required(),

  // Startup
  RUN_MIGRATIONS_ON_BOOT: Joi.boolean().default(false),

  // GraphQL
  GRAPHQL_PLAYGROUND: Joi.boolean().default(false),
  GRAPHQL_INTROSPECTION: Joi.boolean().default(false),
  GRAPHQL_DEBUG: Joi.boolean().default(false),

  // Public URL / local uploads (S3 тохируулаагүй үед)
  PUBLIC_URL: Joi.string().uri().optional(),
  UPLOAD_DIR: Joi.string().default('uploads'),

  // Store
  FREE_DELIVERY_THRESHOLD: Joi.number().default(150000),
  DELIVERY_FEE: Joi.number().default(6000),

  // QPay (сонголттой — хоосон бол төлбөрийн mutation алдаа буцаана)
  QPAY_USERNAME: Joi.string().allow('').optional(),
  QPAY_PASSWORD: Joi.string().allow('').optional(),
  QPAY_INVOICE_CODE: Joi.string().allow('').optional(),
  QPAY_CALLBACK_URL: Joi.string().allow('').optional(),

  // AWS S3 (сонголттой)
  AWS_S3_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_S3_SECRET_KEY: Joi.string().allow('').optional(),
  AWS_S3_REGION: Joi.string().allow('').optional(),
  AWS_S3_BUCKET: Joi.string().allow('').optional(),

  // Анхны админ (seed)
  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string().min(8).optional(),
});
