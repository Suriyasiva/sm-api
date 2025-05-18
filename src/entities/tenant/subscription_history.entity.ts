import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../../types/enum/app_enum';
import { BaseEntity } from '../base_entity';
import { SubscriptionPlanEntity } from './subscription_plans.entity';
import { CustomerSubscriptionEntity } from './customer_subscription.entity';
import { CustomerEntity } from './customers.entity';

@Entity('subscription_history')
export class SubscriptionHistoryEntity extends BaseEntity {
  @Column({ name: 'subscription_plan_id', type: 'uuid' })
  subscriptionPlanId: string;

  @Column({
    type: 'enum',
    enum: EnumSubscriptionHistoryStatus,
    enumName: 'enum_subscription_history_status',
    default: EnumSubscriptionHistoryStatus.ACTIVE,
  })
  status: EnumSubscriptionHistoryStatus;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: EnumSubscriptionPlan,
    enumName: 'enum_subscription_history_from_status',
    default: EnumSubscriptionPlan.FREEMIUM,
  })
  fromStatus: EnumSubscriptionPlan;

  @Column({
    name: 'to_status',
    type: 'enum',
    enum: EnumSubscriptionPlan,
    enumName: 'enum_subscription_history_to_status',
    default: EnumSubscriptionPlan.FREEMIUM,
  })
  toStatus: EnumSubscriptionPlan;

  @Column({
    name: 'subscription_status',
    type: 'enum',
    enum: EnumSubscriptionStatus,
    enumName: 'enum_subscription_history_to_status',
    default: EnumSubscriptionStatus.ACTIVE,
  })
  subscriptionStatus: EnumSubscriptionStatus;

  @Column({ name: 'customer_subscriptions_id', type: 'uuid' })
  customerSubscriptionsId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity;

  @ManyToOne(() => CustomerSubscriptionEntity)
  @JoinColumn({ name: 'customer_subscriptions_id' })
  customerSubscription: CustomerSubscriptionEntity;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
