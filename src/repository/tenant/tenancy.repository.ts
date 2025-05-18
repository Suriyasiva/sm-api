import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import AppDataSource from '../../db/data-source';
import { SubscriptionPlanEntity } from '../../entities/tenant/subscription_plans.entity';
import { CustomerEntity } from '../../entities/tenant/customers.entity';
import { TenantService } from '../../db/tenant-service';

function subscriptionPlansRepository(): Repository<SubscriptionPlanEntity> {
  const subscriptionPlanRepository = AppDataSource.getRepository(
    SubscriptionPlanEntity,
  );
  return subscriptionPlanRepository;
}

function customerRepository(): Repository<CustomerEntity> {
  const userRepository = AppDataSource.getRepository(CustomerEntity);
  return userRepository;
}

async function getTenantRepository<T extends ObjectLiteral>(
  schema: string,
  entity: EntityTarget<T>,
): Promise<Repository<T>> {
  const tenantService = new TenantService();

  const tenantDataSource = await tenantService.getTenantDataSource(schema);

  return tenantDataSource.getRepository<T>(entity);
}

export { subscriptionPlansRepository, customerRepository, getTenantRepository };
