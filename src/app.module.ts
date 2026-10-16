import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ASTNode, GraphQLError, GraphQLFormattedError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import graphqlConfig from './config/graphql.config';
import jwtConfig from './config/jwt.config';
import { validationSchema } from './config/env.validation';
import { CommonModule } from './common/common.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { UploadModule } from './modules/upload/upload.module';
import { LookModule } from './modules/look/look.module';
import { ContentModule } from './modules/content/content.module';

/**
 * KUENEREE API
 *
 * khurd-api-ийн бүтцийг (NestJS + GraphQL code-first + TypeORM/MySQL +
 * nestjs-query) хадгалж, зөвхөн kueneree (дэлгүүр) болон kueneere-admin
 * (маркетинг/удирдлагын самбар)-д хэрэгтэй модулиудыг үлдээсэн.
 *
 * Хасагдсан: parcel, delivery, driver, attendance, sms, otapi sync, BullMQ/Redis,
 * post/comment/tag, website, address (хот/дүүрэг хүснэгт), wishlist, rbac/casl.
 */
interface GqlNode {
  selectionSet?: { selections: GqlNode[] };
}

/**
 * Helper function to calculate query depth
 * Used for query depth limiting security feature
 */
function getDepth(node: GqlNode, depth = 0): number {
  if (!node.selectionSet) {
    return depth;
  }
  return Math.max(
    ...node.selectionSet.selections.map((selection) =>
      getDepth(selection, depth + 1),
    ),
  );
}

@Module({
  imports: [
    // Configuration module with environment validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, graphqlConfig, jwtConfig],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
    }),

    // TypeORM module with async configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [join(__dirname, '**/*.entity{.ts,.js}')],
        migrations: [join(__dirname, 'database/migrations/*{.ts,.js}')],
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
        logging: configService.get('database.logging'),
        charset: configService.get<string>('database.charset'),
        timezone: configService.get<string>('database.timezone'),
        extra: {
          connectionLimit: configService.get<number>('database.poolSize'),
          connectTimeout: configService.get<number>('database.connectTimeout'),
          waitForConnections: true,
          queueLimit: 0,
        },
        ssl: configService.get('database.ssl'),
        autoLoadEntities: true,
      }),
    }),

    // GraphQL module with code-first approach (Requirements 17.1-17.9, 18.3, 18.4, 18.7, 18.8)
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Code-first approach: generate schema from TypeScript decorators
        // development: src/schema.gql файл үүсгэнэ (frontend-д codegen хийхэд тустай)
        // production (Docker): санах ойд
        autoSchemaFile:
          configService.get('app.nodeEnv') === 'development'
            ? join(process.cwd(), 'src/schema.gql')
            : true,
        sortSchema: configService.get<boolean>('graphql.sortSchema'),

        // GraphQL Playground configuration (dev only)
        playground: configService.get<boolean>('graphql.playground'),

        // Introspection configuration (dev only)
        introspection: configService.get<boolean>('graphql.introspection'),

        // Debug mode
        debug: configService.get<boolean>('graphql.debug'),

        // GraphQL context with request, response, and DataLoaders
        // Requirements: 11.4, 11.5
        context: ({ req, res }: any) => ({ req, res }),

        // Custom error formatting (Requirements 14.1-14.7, 14.13)
        formatError: (error: GraphQLFormattedError): GraphQLFormattedError => {
          const isProduction =
            configService.get('app.nodeEnv') === 'production';

          // Get the original error
          const originalError = error.extensions?.originalError as {
            statusCode?: number;
          } | null;
          const statusCode = originalError?.statusCode;

          // Map exception types to GraphQL error codes
          let code = 'INTERNAL_SERVER_ERROR';
          // Preserve custom codes set directly on the error (e.g. TOKEN_EXPIRED)
          const existingCode = error.extensions?.code as string | undefined;
          if (existingCode && existingCode !== 'INTERNAL_SERVER_ERROR') {
            code = existingCode;
          } else if (statusCode === 400) code = 'BAD_REQUEST';
          else if (statusCode === 401) code = 'UNAUTHENTICATED';
          else if (statusCode === 403) code = 'FORBIDDEN';
          else if (statusCode === 404) code = 'NOT_FOUND';
          else if (statusCode === 409) code = 'CONFLICT';
          else if (statusCode === 503) code = 'SERVICE_UNAVAILABLE';

          // In production, sanitize error messages and hide stack traces
          if (isProduction) {
            return {
              message:
                statusCode && statusCode < 500
                  ? error.message
                  : 'An internal server error occurred',
              extensions: {
                code,
                // Remove stack trace and other sensitive information in production
              },
            };
          }

          // In development, return full error details
          return {
            message: error.message,
            extensions: {
              code,
              stacktrace: error.extensions?.stacktrace,
              originalError: error.extensions?.originalError,
            },
            locations: error.locations,
            path: error.path,
          };
        },

        // Security settings: query depth and complexity limiting (Requirements 15.7-15.9, 15.16, 15.17)
        validationRules: [
          // Query depth limiting (max 10 levels)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          (_context: unknown) => {
            const maxDepth = 10;
            return {
              enter(node: ASTNode) {
                const n = node as GqlNode;
                if (n.selectionSet) {
                  const depth = getDepth(n);
                  if (depth > maxDepth) {
                    throw new GraphQLError(
                      `Query depth exceeds maximum allowed depth of ${maxDepth}`,
                      {
                        extensions: { code: 'QUERY_DEPTH_EXCEEDED' },
                      },
                    );
                  }
                }
              },
            };
          },
        ],

        // Query complexity limiting
        plugins: [
          {
            requestDidStart() {
              return Promise.resolve({
                didResolveOperation({
                  request,
                  document,
                  schema,
                }: {
                  request: {
                    operationName?: string;
                    variables?: Record<string, unknown>;
                  };
                  document: Parameters<typeof getComplexity>[0]['query'];
                  schema: Parameters<typeof getComplexity>[0]['schema'];
                }) {
                  const isProduction =
                    configService.get('app.nodeEnv') === 'production';
                  const maxComplexity = isProduction ? 500 : 2000;

                  const complexity = getComplexity({
                    schema,
                    operationName: request.operationName,
                    query: document,
                    variables: request.variables,
                    estimators: [
                      fieldExtensionsEstimator(),
                      simpleEstimator({ defaultComplexity: 1 }),
                    ],
                  });

                  if (complexity > maxComplexity) {
                    throw new GraphQLError(
                      `Query complexity of ${complexity} exceeds maximum allowed complexity of ${maxComplexity}`,
                      {
                        extensions: { code: 'QUERY_COMPLEXITY_EXCEEDED' },
                      },
                    );
                  }
                  return Promise.resolve();
                },
              });
            },
          },
        ],
      }),
    }),

    // Common module (global)
    CommonModule,

    // Feature modules
    AuthModule,
    UserModule,
    CatalogModule,
    OrderModule,
    PaymentModule,
    NewsletterModule,
    MarketingModule,
    UploadModule,
    LookModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
