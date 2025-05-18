import { addDays } from 'date-fns';
import { CustomerSubscriptionEntity } from '../../entities/tenant/customer_subscription.entity';
import { CustomerEntity } from '../../entities/tenant/customers.entity';
import { getTenantRepository } from '../../repository/tenant/tenancy.repository';
import {
  IPlanDowngrade,
  IPlanUpgrade,
} from '../../types/interface/app_interface';
import { SubscriptionPlanEntity } from '../../entities/tenant/subscription_plans.entity';
import { SubscriptionHistoryEntity } from '../../entities/tenant/subscription_history.entity';
import {
  EnumCustomerSubscriptionStatus,
  EnumPaymentStatus,
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionStatus,
} from '../../types/enum/app_enum';

export class SubscriptionService {
  async upgrade(
    schema: string,
    currentUserId: string,
    payload: IPlanUpgrade,
    paymentStatus?: EnumPaymentStatus,
  ) {
    try {
      const [
        customerRepository,
        customerSubscriptionRepository,
        subscriptionPlansRepository,
        subscriptionHistoryRepository,
      ] = await Promise.all([
        getTenantRepository(schema, CustomerEntity),
        getTenantRepository(schema, CustomerSubscriptionEntity),
        getTenantRepository(schema, SubscriptionPlanEntity),
        getTenantRepository(schema, SubscriptionHistoryEntity),
      ]);

      const customer = await customerRepository.findOne({
        where: { id: currentUserId },
      });

      if (!customer) throw new Error('Customer not found');

      const customerSubscription = await customerSubscriptionRepository.findOne(
        {
          where: { customerId: customer.id },
        },
      );
      if (!customerSubscription)
        throw new Error('Customer subscription not found');

      const subscriptionPlan = await subscriptionPlansRepository.findOne({
        where: { billingCycle: payload.newPlan },
      });
      if (!subscriptionPlan) throw new Error('Subscription plan not found');

      const activeHistory = await subscriptionHistoryRepository.findOne({
        where: { status: EnumSubscriptionHistoryStatus.ACTIVE },
      });

      const expiredAt = addDays(
        new Date(),
        paymentStatus === EnumPaymentStatus.SUCCESS
          ? +subscriptionPlan.timePeriod
          : +subscriptionPlan.gracePeriodDays,
      );

      const updatedCustomerSubscription =
        await customerSubscriptionRepository.save({
          ...customerSubscription,
          startedAt: new Date(),
          expiredAt,
          subscriptionPlanId: subscriptionPlan.id,
          subscriptionStatus: payload.newPlan,
        });

      if (activeHistory) {
        activeHistory.status = EnumSubscriptionHistoryStatus.INACTIVE;
        await subscriptionHistoryRepository.save(activeHistory);
      }

      await subscriptionHistoryRepository.save({
        customerId: customer.id,
        customerSubscriptionsId: updatedCustomerSubscription.id,
        fromStatus: customerSubscription.subscriptionStatus,
        toStatus: payload.newSubscriptionStatus,
        status: EnumSubscriptionHistoryStatus.ACTIVE,
        subscriptionStatus:
          paymentStatus === EnumPaymentStatus.SUCCESS
            ? EnumSubscriptionStatus.UPGRADED
            : EnumSubscriptionStatus.GRACE,
        subscriptionPlanId: subscriptionPlan.id,
      });

      return { message: `Plan changed to ${payload.newPlan}` };
    } catch (error) {
      throw error;
    }
  }

  async downGrade(
    schema: string,
    currentUserId: string,
    payload: IPlanDowngrade,
  ) {
    const customerRepository = await getTenantRepository(
      schema,
      CustomerEntity,
    );

    const customerSubscriptionRepository = await getTenantRepository(
      schema,
      CustomerSubscriptionEntity,
    );

    const subscriptionPlansRepository = await getTenantRepository(
      schema,
      SubscriptionPlanEntity,
    );

    const subscriptionHistoryRepository = await getTenantRepository(
      schema,
      SubscriptionHistoryEntity,
    );

    const customer = await customerRepository.findOne({
      where: {
        id: currentUserId,
      },
    });

    const customerSubscription = await customerSubscriptionRepository.findOne({
      where: {
        customerId: customer?.id,
      },
    });

    const subscriptionPlan = await subscriptionPlansRepository.findOne({
      where: {
        billingCycle: payload.newPlan,
      },
    });

    const activeSubscriptionHistory =
      await subscriptionHistoryRepository.findOne({
        where: {
          status: EnumSubscriptionHistoryStatus.ACTIVE,
        },
      });

    const expiredAt = addDays(new Date(), +subscriptionPlan?.timePeriod!);

    const updatedCustomerSubscription =
      await customerSubscriptionRepository.save({
        ...customerSubscription,
        startedAt: new Date(),
        expiredAt: expiredAt,
        status: EnumCustomerSubscriptionStatus.ACTIVE,
        subscriptionPlanId: subscriptionPlan?.id,
        subscriptionStatus: payload.newSubscriptionStatus,
      });

    await subscriptionHistoryRepository.save({
      ...activeSubscriptionHistory,
      status: EnumSubscriptionHistoryStatus.INACTIVE,
    });

    const updatedHistorySubscription = await subscriptionHistoryRepository.save(
      {
        customerId: customer?.id,
        customerSubscriptionsId: updatedCustomerSubscription.id,
        fromStatus: customerSubscription?.subscriptionStatus,
        toStatus: payload.newSubscriptionStatus,
        status: EnumSubscriptionHistoryStatus.ACTIVE,
        subscriptionPlanId: subscriptionPlan?.id,
      },
    );
    try {
    } catch (error) {
      throw error;
    }
  }

  async getSubscriptionPlans(
    schema: string,
  ): Promise<SubscriptionPlanEntity[]> {
    const subscriptionRepository = await getTenantRepository(
      schema,
      SubscriptionPlanEntity,
    );

    return await subscriptionRepository.find({
      order: {
        price: 'ASC',
      },
    });
  }

  async toggleAutoRenewal(
    schema: string,
    customerId: string,
  ): Promise<{ message: string }> {
    const customerSubscriptionRepository = await getTenantRepository(
      schema,
      CustomerSubscriptionEntity,
    );

    const customerSubscription = await customerSubscriptionRepository.findOne({
      where: {
        status: EnumCustomerSubscriptionStatus.ACTIVE,
        customerId: customerId,
      },
    });

    if (!customerSubscription) {
      throw new Error('Subscription not found');
    }

    await customerSubscriptionRepository.save({
      ...customerSubscription,
      autoRenew: !customerSubscription.autoRenew,
    });

    return {
      message: 'AutoRenewal Successfully ',
    };
  }

  async _downGrade(
    schema: string,
    currentUserId: string,
    payload: IPlanUpgrade,
    paymentStatus?: EnumPaymentStatus,
  ) {
    try {
      const [
        customerRepository,
        customerSubscriptionRepository,
        subscriptionPlansRepository,
        subscriptionHistoryRepository,
      ] = await Promise.all([
        getTenantRepository(schema, CustomerEntity),
        getTenantRepository(schema, CustomerSubscriptionEntity),
        getTenantRepository(schema, SubscriptionPlanEntity),
        getTenantRepository(schema, SubscriptionHistoryEntity),
      ]);

      const customer = await customerRepository.findOne({
        where: { id: currentUserId },
      });

      if (!customer) throw new Error('Customer not found');

      const customerSubscription = await customerSubscriptionRepository.findOne(
        {
          where: { customerId: customer.id },
        },
      );
      if (!customerSubscription)
        throw new Error('Customer subscription not found');

      const subscriptionPlan = await subscriptionPlansRepository.findOne({
        where: { billingCycle: payload.newPlan },
      });
      if (!subscriptionPlan) throw new Error('Subscription plan not found');

      const activeHistory = await subscriptionHistoryRepository.findOne({
        where: { status: EnumSubscriptionHistoryStatus.ACTIVE },
      });

      const expiredAt = addDays(
        new Date(),
        paymentStatus === EnumPaymentStatus.SUCCESS
          ? +subscriptionPlan.timePeriod
          : +subscriptionPlan.gracePeriodDays,
      );

      const updatedCustomerSubscription =
        await customerSubscriptionRepository.save({
          ...customerSubscription,
          startedAt: new Date(),
          expiredAt,
          subscriptionPlanId: subscriptionPlan.id,
          subscriptionStatus: payload.newPlan,
        });

      if (activeHistory) {
        activeHistory.status = EnumSubscriptionHistoryStatus.INACTIVE;
        await subscriptionHistoryRepository.save(activeHistory);
      }

      await subscriptionHistoryRepository.save({
        customerId: customer.id,
        customerSubscriptionsId: updatedCustomerSubscription.id,
        fromStatus: customerSubscription.subscriptionStatus,
        toStatus: payload.newSubscriptionStatus,
        status: EnumSubscriptionHistoryStatus.ACTIVE,
        subscriptionStatus:
        paymentStatus === EnumPaymentStatus.SUCCESS
          ? EnumSubscriptionStatus.DOWNGRADED
          : EnumSubscriptionStatus.GRACE,
        subscriptionPlanId: subscriptionPlan.id,
      });

      return { message: `Plan changed to ${payload.newPlan}` };
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
