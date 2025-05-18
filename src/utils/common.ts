import { differenceInDays, isBefore } from 'date-fns';
import { EnumSubscriptionPlan } from '../types/enum/app_enum';

type DaysProgress = {
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
};

type IRemainingCreditAndCharge = {
  usedAmount: number;
  remainingAmount: number;
  payableAmount: number;
};

interface IRemainingCreditAndChargeOption {
  daysCompleted: number;
  daysRemaining: number;
  currentAmount: number;
  newPlanAmount: number;
}

function getSubscriptionWeight(plan: EnumSubscriptionPlan): number {
  switch (plan) {
    case EnumSubscriptionPlan.FREEMIUM:
      return 0;
    case EnumSubscriptionPlan.MONTHLY:
      return 1;
    case EnumSubscriptionPlan.ANNUALLY:
      return 2;
    default:
      return -1;
  }
}

/**
 *
 * @param currentSubscription custom current subscription plan
 * @param newSubscription customer new plan
 * @returns
 */
export function isUpgradeSubscription(
  currentSubscription: EnumSubscriptionPlan,
  newSubscription: EnumSubscriptionPlan,
): boolean {
  return (
    getSubscriptionWeight(newSubscription) >
    getSubscriptionWeight(currentSubscription)
  );
}

export function isDowngradeSubscription(
  currentSubscription: EnumSubscriptionPlan,
  newSubscription: EnumSubscriptionPlan,
): boolean {
  return (
    getSubscriptionWeight(newSubscription) <
    getSubscriptionWeight(currentSubscription)
  );
}

export function calculateDaysProgress(
  startsAt: Date,
  expiresAt: Date,
): DaysProgress {
  const now = new Date();

  const totalDays = Math.max(differenceInDays(expiresAt, startsAt), 0);

  const daysCompleted = isBefore(now, startsAt)
    ? 0
    : Math.min(differenceInDays(now, startsAt), totalDays);

  const daysRemaining = Math.max(totalDays - daysCompleted, 0);

  return {
    totalDays,
    daysCompleted,
    daysRemaining,
  };
}

/**
 *
 * @param daysCompleted completed days
 * @param daysRemaining daysRemaining days
 * @param currentAmount current subscription amount
 * @param newPlanAmount new plan amount
 * @returns
 */

export function calculateRemainingCreditAndCharge(
  params: IRemainingCreditAndChargeOption,
): IRemainingCreditAndCharge {
  const { daysCompleted, daysRemaining, currentAmount, newPlanAmount } = params;
  const totalDays = daysCompleted + daysRemaining;

  if (totalDays === 0) {
    return {
      usedAmount: 0,
      remainingAmount: 0,
      payableAmount: newPlanAmount,
    };
  }

  const usedAmount = (daysCompleted / totalDays) * currentAmount;
  const remainingAmount = currentAmount - usedAmount;

  const payableAmount = Math.max(newPlanAmount - remainingAmount, 0);

  return {
    usedAmount: parseFloat(usedAmount.toFixed(2)),
    remainingAmount: parseFloat(remainingAmount.toFixed(2)),
    payableAmount: parseFloat(payableAmount.toFixed(2)),
  };
}
