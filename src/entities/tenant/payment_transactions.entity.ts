import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import {
  EnumPaymentPaymentProvider,
  EnumPaymentStatus,
} from '../../types/enum/app_enum';
import { BaseEntity } from '../base_entity';
import { CustomerEntity } from './customers.entity';
import { CustomerSubscriptionEntity } from './customer_subscription.entity';
import { SubscriptionPlanEntity } from './subscription_plans.entity';

@Entity({ name: 'payment_transactions' })
export class PaymentTransactionEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: EnumPaymentStatus,
    enumName: 'payment_transaction_status_enum',
    default: EnumPaymentStatus.PENDING,
  })
  status: EnumPaymentStatus;

  @Column({ type: 'varchar', default: 'CREDIT' })
  type: string;

  @Column({ name: 'subscription_plan_id', type: 'uuid', nullable: true })
  subscriptionPlanId: string;

  @Column({ name: 'customer_subscription_id', type: 'uuid', nullable: true })
  customerSubscriptionId: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'external_transaction_id', type: 'uuid', nullable: true })
  externalTransactionId: string;

  @Column({ name: 'external_order_id', type: 'varchar', nullable: true })
  externalOrderId: string;

  @Column({ type: 'numeric' })
  amount: number;

  @Column({
    name: 'meta_data',
    type: 'jsonb',
  })
  metaData: Record<string, any>;

  @ManyToOne(() => CustomerSubscriptionEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'customer_subscription_id' })
  customerSubscription: CustomerSubscriptionEntity;

  @Column({
    type: 'enum',
    enum: EnumPaymentPaymentProvider,
    enumName: 'enum_payment_payment_provider',
    default: EnumPaymentPaymentProvider.RAZORPAY,
    name: 'payment_provider',
  })
  paymentProvider: EnumPaymentPaymentProvider;

  @ManyToOne(() => SubscriptionPlanEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subscription_plan_id' })
  subscriptionPlan: SubscriptionPlanEntity;

  @ManyToOne(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;
}
