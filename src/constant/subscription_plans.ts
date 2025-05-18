import { SubscriptionPlanEntity } from '../entities/tenant/subscription_plans.entity';
import {
  EnumSubscriptionPlan,
  EnumSubscriptionPlanStatus,
} from '../types/enum/app_enum';

const subscriptionPlansData: Partial<SubscriptionPlanEntity>[] = [
  {
    name: 'Freemium Plan',
    code: 'FREEMIUM',
    description: 'Basic access to limited features at no cost.',
    billingCycle: EnumSubscriptionPlan.FREEMIUM,
    price: 0.0,
    trialPeriodDays: '7',
    gracePeriodDays: '0',
    status: EnumSubscriptionPlanStatus.ACTIVE,
    timePeriod: '7',
    metadata: {
      tags: [],
    },
  },
  {
    name: 'Monthly Plan',
    code: 'MONTHLY_BASIC',
    description: 'Full access with a monthly subscription.',
    billingCycle: EnumSubscriptionPlan.MONTHLY,
    price: 19.99,
    trialPeriodDays: '0',
    gracePeriodDays: '7',
    timePeriod: '30',
    status: EnumSubscriptionPlanStatus.ACTIVE,
    metadata: {
      tags: ['isPromoted'],
    },
  },
  {
    name: 'Annual Plan',
    code: 'ANNUAL_PREMIUM',
    description: 'Yearly subscription with added benefits.',
    billingCycle: EnumSubscriptionPlan.ANNUALLY,
    price: 199.99,
    trialPeriodDays: '0',
    gracePeriodDays: '15',
    timePeriod: '365',
    status: EnumSubscriptionPlanStatus.ACTIVE,
    metadata: {
      tags: [],
    },
  },
];

export default subscriptionPlansData;
