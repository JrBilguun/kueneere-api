import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
import { join } from 'path';

// Docker дотор env-ийг compose дамжуулдаг; локалд .env.* файлаас уншина
if (!process.env.DB_HOST) {
  const envFile =
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development';
  config({ path: join(process.cwd(), envFile) });
}

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  logging:
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  charset: 'utf8mb4',
  timezone: 'Z',
  extra: {
    connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 5,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0,
  },
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
