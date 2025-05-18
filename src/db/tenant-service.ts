import { DataSource } from 'typeorm';
import AppDataSource from './data-source';
import { ormConfig } from './orm.config';
import { resolve } from 'path';
import { SubscriptionPlanEntity } from '../entities/tenant/subscription_plans.entity';
import subscriptionPlansData from '../constant/subscription_plans';

const tenantEntityLocation = resolve(
  __dirname,
  '../entities/tenant/**/*{.ts,.js}',
);
const tenantMigrationLocation = resolve(
  __dirname,
  '../db/migrations/tenant/**/*{.ts,.js}',
);

export class TenantService {
  async createTenant(schema: string) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      const tenantDataSource = await this.getTenantDataSource(schema);

      console.log(`---- Started migration for ${schema} -----`);
      await tenantDataSource.runMigrations();

      await this.addSubscriptionPlansToTenant(tenantDataSource);
      console.log(`----  Migration completed for ${schema} -----`);

      console.log(`Schema '${schema}' initialized successfully.`);
    } catch (error) {
      console.error(`Failed to initialize schema '${schema}':`, error);
      throw error;
    }
  }

  private async addSubscriptionPlansToTenant(
    tenantDataSource: DataSource,
  ): Promise<SubscriptionPlanEntity[]> {
    const subscriptionPlansRepo = tenantDataSource.getRepository(
      SubscriptionPlanEntity,
    );

    const subscriptionPlans = await subscriptionPlansRepo.save(
      subscriptionPlansData,
    );
    return subscriptionPlans;
  }

  async getTenantDataSource(schema: string): Promise<DataSource> {
    const tenantDataSource = new DataSource({
      ...ormConfig,
      schema,
      name: schema,
      entities: [tenantEntityLocation],
      migrations: [tenantMigrationLocation],
    });

    if (!tenantDataSource.isInitialized) {
      await tenantDataSource.initialize();
    }

    return tenantDataSource;
  }
}
