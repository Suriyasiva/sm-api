import { addDays, addMonths } from 'date-fns';
import AppDataSource from '../../db/data-source';
import { TenantService } from '../../db/tenant-service';
import { CustomerSubscriptionEntity } from '../../entities/tenant/customer_subscription.entity';
import { CustomerEntity } from '../../entities/tenant/customers.entity';
import { SubscriptionHistoryEntity } from '../../entities/tenant/subscription_history.entity';
import { SubscriptionPlanEntity } from '../../entities/tenant/subscription_plans.entity';
import {
  EnumCustomerSubscriptionStatus,
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../../types/enum/app_enum';
import { ICustomer } from '../../types/interface/app_interface';
import bcrypt from 'bcrypt';
import { getTenantRepository } from '../../repository/tenant/tenancy.repository';

export class CustomerService {
  async createCustomer(
    schema: string,
    payload: ICustomer,
  ): Promise<{ message: string }> {
    const tenantService = new TenantService();
    const dataSource = AppDataSource;

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const tenantDataSource = await tenantService.getTenantDataSource(schema);

      const customerEntity = tenantDataSource.getRepository(CustomerEntity);
      const subscriptionPlansEntity = tenantDataSource.getRepository(
        SubscriptionPlanEntity,
      );
      const customerSubScriptionEntity = tenantDataSource.getRepository(
        CustomerSubscriptionEntity,
      );
      const subScriptionHistoryEntity = tenantDataSource.getRepository(
        SubscriptionHistoryEntity,
      );

      const customer = await customerEntity.save({
        firstName: payload.firstName,
        lastName: payload.lastName,
        encryptedPassword: hashedPassword,
        email: payload.email,
      });

      const subscription = await subscriptionPlansEntity.findOne({
        where: {
          billingCycle: EnumSubscriptionPlan.FREEMIUM,
        },
      });
      const expiredAt = addDays(new Date(), +subscription?.timePeriod!);
      const customerSubscription = await customerSubScriptionEntity.save({
        autoRenew: false,
        customerId: customer.id,
        status: EnumCustomerSubscriptionStatus.ACTIVE,
        subscriptionPlanId: subscription?.id,
        subscriptionStatus: EnumSubscriptionPlan.FREEMIUM,
        startedAt: new Date(),
        expiredAt: expiredAt,
      });

      await subScriptionHistoryEntity.save({
        customerId: customer.id,
        customerSubscriptionsId: customerSubscription.id,
        fromStatus: EnumSubscriptionPlan.FREEMIUM,
        toStatus: EnumSubscriptionPlan.FREEMIUM,
        subscriptionStatus: EnumSubscriptionStatus.TRIAL,
        status: EnumSubscriptionHistoryStatus.ACTIVE,
        subscriptionPlanId: subscription?.id,
      });

      await queryRunner.commitTransaction();
      return {
        message: `Activated a TRIAL plan to ${customer.firstName} ${customer.lastName}`,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerSubscription(schema: string, customerId: string) {
    const customerSubscriptionRepo = await getTenantRepository(
      schema,
      CustomerSubscriptionEntity,
    );

    return await customerSubscriptionRepo.findOne({
      where: {
        customerId: customerId,
        status: EnumCustomerSubscriptionStatus.ACTIVE,
      },
      relations: {
        subscriptionPlan: true,
        customer: true,
      },
    });
  }

  async getCustomerSubscriptionHistory(schema: string, customerId: string) {
    const customerSubscriptionHistoryRepo = await getTenantRepository(
      schema,
      SubscriptionHistoryEntity,
    );
    const customerSubscriptionHistory =
      await customerSubscriptionHistoryRepo.find({
        where: {
          customerId: customerId,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return customerSubscriptionHistory;
  }
}
