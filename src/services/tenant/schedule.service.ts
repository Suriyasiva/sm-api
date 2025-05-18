import { endOfDay, isToday, parse, startOfDay } from 'date-fns';
import AppDataSource from '../../db/data-source';
import { CustomerSubscriptionEntity } from '../../entities/tenant/customer_subscription.entity';
import { SubscriptionHistoryEntity } from '../../entities/tenant/subscription_history.entity';
import { getTenantRepository } from '../../repository/tenant/tenancy.repository';
import { Between, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  EnumCustomerSubscriptionStatus,
  EnumPaymentStatus,
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionStatus,
} from '../../types/enum/app_enum';
import { PaymentTransactionEntity } from '../../entities/tenant/payment_transactions.entity';

class ScheduleService {
  async updateSubscriptionStatus() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    const schemas: { schema_name: string }[] = await AppDataSource.query(
      `
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'public')
      AND schema_name NOT LIKE 'pg_temp%'
      AND schema_name NOT LIKE 'pg_toast_temp%';
  `,
    );

    const tenants = schemas.map(async ({ schema_name }) => {
      const customerSubscriptionRepo = await getTenantRepository(
        schema_name,
        CustomerSubscriptionEntity,
      );

      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      const expiringSubscriptions = await customerSubscriptionRepo.find({
        where: {
          expiredAt: Between(todayStart, todayEnd),
          status: EnumCustomerSubscriptionStatus.ACTIVE,
          autoRenew: false,
        },
        relations: {
          customer: true,
          subscriptionPlan: true,
        },
      });

      const subscriptionIds = expiringSubscriptions.map((s) => s.id);

      const customerSubscriptionHistoryRepo = await getTenantRepository(
        schema_name,
        SubscriptionHistoryEntity,
      );

      const activeHistories = await customerSubscriptionHistoryRepo.find({
        where: {
          status: EnumSubscriptionHistoryStatus.ACTIVE,
          subscriptionPlanId: In(subscriptionIds),
        },
      });

      // Update histories
      for (const history of activeHistories) {
        history.status = EnumSubscriptionHistoryStatus.INACTIVE;
        history.subscriptionStatus = EnumSubscriptionStatus.EXPIRED;
      }

      await customerSubscriptionHistoryRepo.save(activeHistories);

      // Update subscriptions
      for (const sub of expiringSubscriptions) {
        sub.status = EnumCustomerSubscriptionStatus.INACTIVE;
      }

      await customerSubscriptionRepo.save(expiringSubscriptions);

      return expiringSubscriptions;
    });

    return await Promise.all(tenants);
  }

  async autoRenewSubscription() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const schemas: { schema_name: string }[] = await AppDataSource.query(
      `
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'public')
      AND schema_name NOT LIKE 'pg_temp%'
      AND schema_name NOT LIKE 'pg_toast_temp%';
      `,
    );

    const tenants = schemas.map(async ({ schema_name }) => {
      const customerSubscriptionRepo = await getTenantRepository(
        schema_name,
        CustomerSubscriptionEntity,
      );
      const paymentTransactionRepo = await getTenantRepository(
        schema_name,
        PaymentTransactionEntity,
      );
      const subscriptionHistoryRepo = await getTenantRepository(
        schema_name,
        SubscriptionHistoryEntity,
      );

      const autoRenewSubscriptions = await customerSubscriptionRepo.find({
        where: { autoRenew: true },
        relations: { subscriptionPlan: true },
      });

      if (autoRenewSubscriptions.length === 0) return [];

      // Create transactions
      const now = Date.now();
      const transactions = autoRenewSubscriptions.map((sub, index) => ({
        status: EnumPaymentStatus.SUCCESS,
        type: 'CREDIT_BY_AUTO_RENEWAL',
        subscriptionPlanId: sub.subscriptionPlanId,
        customerSubscriptionId: sub.id,
        customerId: sub.customerId,
        externalTransactionId: uuidv4(),
        externalOrderId: `${now + index}-${uuidv4()}`,
        amount: sub.subscriptionPlan.price,
        metaData: {
          usedAmount: 0,
          remainingAmount: 0,
          payableAmount: sub.subscriptionPlan.price,
        },
      }));

      await paymentTransactionRepo.save(transactions);

      // Update subscription histories

      const subIds = autoRenewSubscriptions.map((s) => s.id);

      const activeHistories = await subscriptionHistoryRepo.find({
        where: {
          status: EnumSubscriptionHistoryStatus.ACTIVE,
          customerSubscriptionsId: In(subIds),
        },
      });

      // Inactivate old subscription histories
      for (const history of activeHistories) {
        history.status = EnumSubscriptionHistoryStatus.INACTIVE;
      }

      // Create new active copies
      const newHistories = activeHistories.map((h) => {
        return {
          ...h,
          status: EnumSubscriptionHistoryStatus.ACTIVE,
        };
      });

      await subscriptionHistoryRepo.save(activeHistories);
      await subscriptionHistoryRepo.save(newHistories);
    });

    return await Promise.all(tenants);
  }
}

const scheduleService = new ScheduleService();
export default scheduleService;
