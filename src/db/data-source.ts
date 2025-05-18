import { DataSource } from 'typeorm';
import { ormConfig } from './orm.config';
import * as dotenv from 'dotenv';

dotenv.config();
const AppDataSource = new DataSource({
  ...ormConfig,
  extra: {
    family: 4,
    ssl: {
      rejectUnauthorized: false,
    },
  },
  ssl: true,
  logging: true,
});
export default AppDataSource;
