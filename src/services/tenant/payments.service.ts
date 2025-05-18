import { CustomerSubscriptionEntity } from '../../entities/tenant/customer_subscription.entity';
import { PaymentTransactionEntity } from '../../entities/tenant/payment_transactions.entity';
import { SubscriptionPlanEntity } from '../../entities/tenant/subscription_plans.entity';
import { getTenantRepository } from '../../repository/tenant/tenancy.repository';
import {
  EnumPaymentPaymentProvider,
  EnumPaymentStatus,
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../../types/enum/app_enum';
import { IPaymentOptions } from '../../types/interface/app_interface';
import {
  calculateDaysProgress,
  calculateRemainingCreditAndCharge,
  isUpgradeSubscription,
} from '../../utils/common';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionService } from './subscription.service';
import { SubscriptionHistoryEntity } from '../../entities/tenant/subscription_history.entity';

const subscriptionService = new SubscriptionService();

export class PaymentTransactionsService {
  async calculatePaymentAmountForSubscription(
    schema: string,
    customerId: string,
    subscriptionPlanId: string,
  ) {
    const [subscriptionPlanRepository, customerSubscriptionRepository] =
      await Promise.all([
        getTenantRepository(schema, SubscriptionPlanEntity),
        getTenantRepository(schema, CustomerSubscriptionEntity),
      ]);

    const newSubscriptionPlan = await subscriptionPlanRepository.findOne({
      where: { id: subscriptionPlanId },
    });
    const currentSubscription = await customerSubscriptionRepository.findOne({
      where: { customerId },
      relations: { subscriptionPlan: true },
    });

    if (!newSubscriptionPlan) {
      throw new Error('Selected subscription plan not found.');
    }

    if (!currentSubscription || !currentSubscription.subscriptionPlan) {
      throw new Error(
        'Current subscription details are incomplete or missing.',
      );
    }

    if (
      newSubscriptionPlan.billingCycle ===
      currentSubscription.subscriptionPlan.billingCycle
    ) {
      throw new Error(
        'You’re already subscribed to this plan. Please select another one.',
      );
    }

    const { daysCompleted, daysRemaining } = calculateDaysProgress(
      currentSubscription.startedAt,
      currentSubscription.expiredAt,
    );

    const calculatedAmount = calculateRemainingCreditAndCharge({
      currentAmount: +currentSubscription.subscriptionPlan.price,
      daysCompleted,
      daysRemaining,
      newPlanAmount: +newSubscriptionPlan.price,
    });

    return { calculatedAmount, newSubscriptionPlan, currentSubscription };
  }

  async createPayment(
    tenantId: string,
    customerId: string,
    paymentOptions: IPaymentOptions,
  ) {
    try {
      const paymentRepository = await getTenantRepository(
        tenantId,
        PaymentTransactionEntity,
      );
      const subscriptionPlanRepository = await getTenantRepository(
        tenantId,
        SubscriptionPlanEntity,
      );
      const customerSubscriptionRepository = await getTenantRepository(
        tenantId,
        CustomerSubscriptionEntity,
      );
      const subscriptionHistoryRepository = await getTenantRepository(
        tenantId,
        SubscriptionHistoryEntity,
      );

      //  get new subscription plan
      const subscriptionPlan = await subscriptionPlanRepository.findOne({
        where: { id: paymentOptions.subscriptionPlanId },
      });

      if (!subscriptionPlan) {
        throw new Error('Subscription Plan not found');
      }

      //  get customer current subscription plan
      const customerSubscription = await customerSubscriptionRepository.findOne(
        {
          where: { customerId: customerId },
          relations: {
            subscriptionPlan: true,
          },
        },
      );

      // checking the plan is upgrading
      const isUpgrading = isUpgradeSubscription(
        customerSubscription?.subscriptionStatus!,
        subscriptionPlan.billingCycle,
      );

      // checking the plan is downgrading
      const isDowngrading =
        !isUpgrading &&
        customerSubscription?.subscriptionStatus !==
          subscriptionPlan.billingCycle;

      const { daysCompleted, daysRemaining } = calculateDaysProgress(
        customerSubscription?.startedAt!,
        customerSubscription?.expiredAt!,
      );

      const calculatedAmount = calculateRemainingCreditAndCharge({
        currentAmount: +customerSubscription?.subscriptionPlan?.price!,
        daysCompleted,
        daysRemaining,
        newPlanAmount: +subscriptionPlan.price,
      });

      const paymentPayload = {
        customerId: customerId,
        amount: calculatedAmount.payableAmount,
        customerSubscriptionId: paymentOptions.customerSubscriptionId,
        externalOrderId:
          paymentOptions.externalOrderId || Date.now().toString(),
        externalTransactionId: paymentOptions.externalTransactionId || uuidv4(),
        paymentProvider:
          paymentOptions.paymentProvider || EnumPaymentPaymentProvider.RAZORPAY,
        status: paymentOptions.status || EnumPaymentStatus.SUCCESS,
        subscriptionPlanId: paymentOptions.subscriptionPlanId,
        type: paymentOptions.type || 'CREDIT',
        metaData: paymentOptions.metaData,
      };

      if (subscriptionPlan.billingCycle === EnumSubscriptionPlan.FREEMIUM) {
        paymentOptions.type = 'REFUND';
        paymentPayload.type = 'REFUND';
        paymentPayload.amount = calculatedAmount.remainingAmount;

        // Inactivate old subscription history
        await subscriptionHistoryRepository.update(
          { customerSubscriptionsId: customerSubscription?.id },
          { status: EnumSubscriptionHistoryStatus.INACTIVE },
        );

        // Update current customer subscription
        await customerSubscriptionRepository.update(customerSubscription?.id!, {
          subscriptionPlanId: subscriptionPlan.id,
          subscriptionStatus: EnumSubscriptionPlan.FREEMIUM,
        });

        // Create new active subscription history
        await subscriptionHistoryRepository.save({
          subscriptionPlanId: subscriptionPlan.id,
          fromStatus: customerSubscription?.subscriptionStatus,
          toStatus: EnumSubscriptionPlan.FREEMIUM,
          status: EnumSubscriptionHistoryStatus.ACTIVE,
          subscriptionStatus: EnumSubscriptionStatus.DOWNGRADED,
          customerSubscriptionsId: customerSubscription?.id,
          customerId: customerId,
        });
      }

      if (isUpgrading) {
        await subscriptionService.upgrade(
          tenantId,
          customerId,
          {
            newPlan: subscriptionPlan.billingCycle,
            newSubscriptionStatus: subscriptionPlan.billingCycle,
          },
          paymentOptions.status,
        );
      }

      if (isDowngrading) {
        await subscriptionService._downGrade(
          tenantId,
          customerId,
          {
            newPlan: subscriptionPlan.billingCycle,
            newSubscriptionStatus: subscriptionPlan.billingCycle,
          },
          paymentOptions.status,
        );

        if (calculatedAmount.remainingAmount > 0) {
          const _paymentPayload = {
            customerId: customerId,
            amount: calculatedAmount.remainingAmount - subscriptionPlan.price,
            customerSubscriptionId: paymentOptions.customerSubscriptionId,
            externalOrderId:
              paymentOptions.externalOrderId || Date.now().toString(),
            externalTransactionId:
              paymentOptions.externalTransactionId || uuidv4(),
            paymentProvider:
              paymentOptions.paymentProvider ||
              EnumPaymentPaymentProvider.RAZORPAY,
            status: paymentOptions.status || EnumPaymentStatus.SUCCESS,
            subscriptionPlanId: customerSubscription?.subscriptionPlan.id,
            type: 'REFUND',
            metaData: paymentOptions.metaData,
          };

          // refund remaining amount
          await paymentRepository.save(_paymentPayload);
          paymentPayload.type = 'CREDIT';
          paymentPayload.amount = subscriptionPlan.price;
        }
      }

      const savedTransaction = await paymentRepository.save(paymentPayload);

      return savedTransaction;
    } catch (error: any) {
      console.log('error :>> ', error);
      throw new Error(error);
    }
  }

  async createPaymentFailedTransaction(
    tenantId: string,
    customerId: string,
    paymentOptions: IPaymentOptions,
  ) {
    try {
      const paymentRepository = await getTenantRepository(
        tenantId,
        PaymentTransactionEntity,
      );
      const subscriptionPlanRepository = await getTenantRepository(
        tenantId,
        SubscriptionPlanEntity,
      );
      const customerSubscriptionRepository = await getTenantRepository(
        tenantId,
        CustomerSubscriptionEntity,
      );
      const subscriptionHistoryRepository = await getTenantRepository(
        tenantId,
        SubscriptionHistoryEntity,
      );

      //  get new subscription plan
      const subscriptionPlan = await subscriptionPlanRepository.findOne({
        where: { id: paymentOptions.subscriptionPlanId },
      });

      if (!subscriptionPlan) {
        throw new Error('Subscription Plan not found');
      }

      //  get customer current subscription plan
      const customerSubscription = await customerSubscriptionRepository.findOne(
        {
          where: { customerId: customerId },
          relations: {
            subscriptionPlan: true,
          },
        },
      );

      // checking the plan is upgrading
      const isUpgrading = isUpgradeSubscription(
        customerSubscription?.subscriptionStatus!,
        subscriptionPlan.billingCycle,
      );

      // checking the plan is downgrading
      const isDowngrading =
        !isUpgrading &&
        customerSubscription?.subscriptionStatus !==
          subscriptionPlan.billingCycle;

      const { daysCompleted, daysRemaining } = calculateDaysProgress(
        customerSubscription?.startedAt!,
        customerSubscription?.expiredAt!,
      );

      const calculatedAmount = calculateRemainingCreditAndCharge({
        currentAmount: +customerSubscription?.subscriptionPlan?.price!,
        daysCompleted,
        daysRemaining,
        newPlanAmount: +subscriptionPlan.price,
      });

      const paymentPayload = {
        customerId: customerId,
        amount: calculatedAmount.payableAmount,
        customerSubscriptionId: paymentOptions.customerSubscriptionId,
        externalOrderId:
          paymentOptions.externalOrderId || Date.now().toString(),
        externalTransactionId: paymentOptions.externalTransactionId || uuidv4(),
        paymentProvider:
          paymentOptions.paymentProvider || EnumPaymentPaymentProvider.RAZORPAY,
        status: paymentOptions.status || EnumPaymentStatus.SUCCESS,
        subscriptionPlanId: paymentOptions.subscriptionPlanId,
        type: paymentOptions.type || 'CREDIT',
        metaData: paymentOptions.metaData,
      };

      if (subscriptionPlan.billingCycle === EnumSubscriptionPlan.FREEMIUM) {
        paymentOptions.type = 'REFUND';
        paymentPayload.type = 'REFUND';
        paymentPayload.amount = calculatedAmount.remainingAmount;

        // Inactivate old subscription history
        await subscriptionHistoryRepository.update(
          { customerSubscriptionsId: customerSubscription?.id },
          { status: EnumSubscriptionHistoryStatus.INACTIVE },
        );

        // Update current customer subscription
        await customerSubscriptionRepository.update(customerSubscription?.id!, {
          subscriptionPlanId: subscriptionPlan.id,
          subscriptionStatus: EnumSubscriptionPlan.FREEMIUM,
        });

        // Create new active subscription history
        await subscriptionHistoryRepository.save({
          subscriptionPlanId: subscriptionPlan.id,
          fromStatus: customerSubscription?.subscriptionStatus,
          toStatus: EnumSubscriptionPlan.FREEMIUM,
          status: EnumSubscriptionHistoryStatus.ACTIVE,
          subscriptionStatus:
            paymentOptions.status === EnumPaymentStatus.FAILED
              ? EnumSubscriptionStatus.GRACE
              : EnumSubscriptionStatus.DOWNGRADED,
          customerSubscriptionsId: customerSubscription?.id,
          customerId: customerId,
        });
      }

      if (isUpgrading) {
        await subscriptionService.upgrade(tenantId, customerId, {
          newPlan: subscriptionPlan.billingCycle,
          newSubscriptionStatus: subscriptionPlan.billingCycle,
        });
      }

      if (isDowngrading) {
        await subscriptionService._downGrade(tenantId, customerId, {
          newPlan: subscriptionPlan.billingCycle,
          newSubscriptionStatus: subscriptionPlan.billingCycle,
        });

        if (calculatedAmount.remainingAmount > 0) {
          const _paymentPayload = {
            customerId: customerId,
            amount: calculatedAmount.remainingAmount - subscriptionPlan.price,
            customerSubscriptionId: paymentOptions.customerSubscriptionId,
            externalOrderId:
              paymentOptions.externalOrderId || Date.now().toString(),
            externalTransactionId:
              paymentOptions.externalTransactionId || uuidv4(),
            paymentProvider:
              paymentOptions.paymentProvider ||
              EnumPaymentPaymentProvider.RAZORPAY,
            status: paymentOptions.status || EnumPaymentStatus.SUCCESS,
            subscriptionPlanId: customerSubscription?.subscriptionPlan.id,
            type: 'REFUND',
            metaData: paymentOptions.metaData,
          };

          // refund remaining amount
          await paymentRepository.save(_paymentPayload);
          paymentPayload.type = 'CREDIT';
          paymentPayload.amount = subscriptionPlan.price;
        }
      }

      const savedTransaction = await paymentRepository.save(paymentPayload);

      return savedTransaction;
    } catch (error: any) {
      console.log('error :>> ', error);
      throw new Error(error);
    }
  }

  async getCustomerPaymentTransactions(
    tenantId: string,
    customerId: string,
  ): Promise<PaymentTransactionEntity[]> {
    const paymentTransactionRepo = await getTenantRepository(
      tenantId,
      PaymentTransactionEntity,
    );

    const paymentTransactions = await paymentTransactionRepo.find({
      where: {
        customerId: customerId,
      },
      relations: {
        subscriptionPlan: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return paymentTransactions;
  }
}
