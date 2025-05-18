import { DataSource } from 'typeorm';
import { ormConfig } from './orm.config';
import * as dotenv from 'dotenv';


dotenv.config();
const AppDataSource = new DataSource(ormConfig);
export default AppDataSource;
