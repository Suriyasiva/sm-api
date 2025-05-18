import { resolve } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const entityLocation = resolve(__dirname, '../entities/public/*{.ts,.js}');
const migrations = resolve(__dirname, '../db/migrations/public/*{.ts,.js}');

export const ormConfig: any = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [entityLocation],
  migrations: [migrations],

  migrationsTableName: 'migration',
  synchronize: false,

  timezone: 'Z',
};
