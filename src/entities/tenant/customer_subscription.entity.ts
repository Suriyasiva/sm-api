import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../base_entity';
import { CustomerEntity } from './customers.entity';
import { SubscriptionPlanEntity } from './subscription_plans.entity';
import {
  EnumCustomerSubscriptionStatus,
  EnumSubscriptionPlan,
} from '../../types/enum/app_enum';

@Entity('customer_subscriptions')
export class CustomerSubscriptionEntity extends BaseEntity {
  @Column({ name: 'customer_id', type: 'uuid', unique: true })
  customerId: string;

  @Column({ name: 'subscription_plan_id', type: 'uuid' })
  subscriptionPlanId: string;

  @Column({
    type: 'enum',
    enum: EnumCustomerSubscriptionStatus,
    enumName: 'enum_customer_subscription_status',
    default: EnumCustomerSubscriptionStatus.ACTIVE,
  })
  status: EnumCustomerSubscriptionStatus;

  @Column({
    type: 'enum',
    enum: EnumSubscriptionPlan,
    enumName: 'enum_customer_subscription_subscription_status',
    default: EnumSubscriptionPlan.FREEMIUM,
    name: 'subscription_status',
  })
  subscriptionStatus: EnumSubscriptionPlan;

  @Column({
    name: 'started_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startedAt: Date;

  @Column({ name: 'expired_at', type: 'timestamp' })
  expiredAt: Date;

  @Column({ name: 'auto_renew', type: 'boolean', default: false })
  autoRenew: boolean;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => SubscriptionPlanEntity)
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity;
}
