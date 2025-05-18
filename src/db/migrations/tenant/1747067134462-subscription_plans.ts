import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  EnumSubscriptionPlan,
  EnumSubscriptionPlanStatus,
} from '../../../types/enum/app_enum';

const subscriptionPlans: EnumSubscriptionPlan[] = [
  EnumSubscriptionPlan.FREEMIUM,
  EnumSubscriptionPlan.MONTHLY,
  EnumSubscriptionPlan.ANNUALLY,
];
const subscriptionPlansStatus: EnumSubscriptionPlanStatus[] = [
  EnumSubscriptionPlanStatus.ACTIVE,
  EnumSubscriptionPlanStatus.INACTIVE,
];

export class SubscriptionPlans1747067134462 implements MigrationInterface {
  tableName: string = 'subscription_plans';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '64',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '64',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'billing_cycle',
            type: 'enum',
            enumName: 'enum_subscription_plans_billing_cycle',
            enum: subscriptionPlans,
            default: `'${EnumSubscriptionPlan.FREEMIUM}'`,
          },
          {
            name: 'price',
            type: 'decimal',
          },
          {
            name: 'trial_period_days',
            type: 'varchar',
            default: 30,
          },
          {
            name: 'grace_period_days',
            type: 'varchar',
            default: 30,
          },
          {
            name: 'time_period',
            type: 'varchar',
            default: '7',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'enum_subscription_plan_status',
            enum: subscriptionPlansStatus,
            default: `'${EnumSubscriptionPlanStatus.ACTIVE}'`,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: `'{}'`,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "enum_subscription_plan_status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "enum_subscription_plans_billing_cycle"`,
    );
  }
}
