import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import dataSource from './database/data-source';

const logger = new Logger('Bootstrap');

async function runMigrations(): Promise<void> {
  try {
    logger.log('Checking for pending migrations...');

    // Initialize data source if not already initialized
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      logger.log('Database connection established');
    }

    // Check if there are pending migrations
    const pendingMigrations = await dataSource.showMigrations();

    if (!pendingMigrations) {
      logger.log('No pending migrations');
      return;
    }

    // Execute pending migrations in chronological order within a transaction
    logger.log('Running pending migrations...');
    await dataSource.runMigrations({
      transaction: 'each',
    });

    // Verify migrations were applied
    const remainingMigrations = await dataSource.showMigrations();

    if (remainingMigrations) {
      throw new Error('Some migrations failed to apply');
    }

    logger.log('All migrations completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Migration execution failed:', errorMessage);
    if (errorStack) {
      logger.error(errorStack);
    }
    throw new Error(`Migration failed: ${errorMessage}`);
  }
}

async function bootstrap() {
  try {
    // Create NestJS application
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const isProduction = configService.get('app.nodeEnv') === 'production';

    // Security headers. CSP-г development-д унтраана (Apollo Sandbox ажиллахын тулд)
    app.use(
      helmet({
        contentSecurityPolicy: isProduction ? undefined : false,
        crossOriginEmbedderPolicy: false,
        // Зураг (/uploads)-ийг kueneree / admin өөр origin-оос ачаалах ёстой
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
    );

    // S3 тохируулаагүй үед локал upload-уудыг /uploads/... дээр үйлчилнэ
    const uploadDir = resolve(
      configService.get<string>('app.uploadDir', 'uploads'),
    );
    mkdirSync(uploadDir, { recursive: true });
    app.useStaticAssets(uploadDir, { prefix: '/uploads/', maxAge: '7d' });

    if (configService.get<boolean>('app.runMigrationsOnBoot')) {
      await runMigrations();
      await dataSource.destroy();
    } else {
      logger.log('Skipping migrations on boot');
    }

    // Configure global validation pipe (Requirements 9.1, 9.2, 9.3, 9.4)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true, // Enable implicit type conversion
        },
      }),
    );

    const corsOrigins = configService.get<string[]>('app.corsOrigins') ?? [];
    app.enableCors({
      // Use the explicit allow-list from CORS_ORIGINS. Wildcard origin with
      // credentials is rejected by browsers and is unsafe in production.
      origin: corsOrigins.length > 0 ? corsOrigins : false,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Start the server
    const port = configService.get<number>('app.port') ?? 3003;
    await app.listen(port, '0.0.0.0');
    logger.log(`Application is running on: http://0.0.0.0:${port}`);
    logger.log(`GraphQL endpoint:         http://localhost:${port}/graphql`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error('Application bootstrap failed:', errorMessage);
    if (errorStack) {
      logger.error(errorStack);
    }
    process.exit(1); // Exit with error code if bootstrap fails
  }
}

void bootstrap();
