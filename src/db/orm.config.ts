import { resolve } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

const entityLocation = resolve(__dirname, '../entities/public/*{.ts,.js}');
const migrations = resolve(__dirname, '../db/migrations/public/*{.ts,.js}');

const host = 'db.pquyqtznsrxulgqlmilu.supabase.co';
const dbPort = 5432;
const dbUser = 'postgres';
const dbPassword = '0PVuZUNmKdLTQIqT';
const dbName = 'postgres';

export const ormConfig: any = {
  type: 'postgres',
  host: host,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,

  entities: [entityLocation],
  migrations: [migrations],

  migrationsTableName: 'migration',
  synchronize: false,

  timezone: 'Z',
};
