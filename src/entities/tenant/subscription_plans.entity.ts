import { Entity, Column } from 'typeorm';
import {
  EnumSubscriptionPlan,
  EnumSubscriptionPlanStatus,
} from '../../types/enum/app_enum';
import { BaseEntity } from '../base_entity';

@Entity('subscription_plans')
export class SubscriptionPlanEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: EnumSubscriptionPlan,
    name: 'billing_cycle',
    enumName: 'enum_subscription_plans_billing_cycle',
    default: EnumSubscriptionPlan.FREEMIUM,
  })
  billingCycle: EnumSubscriptionPlan;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ name: 'time_period', type: 'varchar', default: '7' })
  timePeriod: string;

  @Column({ name: 'trial_period_days', type: 'varchar', default: '30' })
  trialPeriodDays: string;

  @Column({ name: 'grace_period_days', type: 'varchar', default: '30' })
  gracePeriodDays: string;

  @Column({
    type: 'enum',
    enum: EnumSubscriptionPlanStatus,
    enumName: 'enum_subscription_plan_status',
    default: EnumSubscriptionPlanStatus.ACTIVE,
  })
  status: EnumSubscriptionPlanStatus;

  @Column({ type: 'jsonb', default: () => `'{}'` })
  metadata: Record<string, any>;
}
