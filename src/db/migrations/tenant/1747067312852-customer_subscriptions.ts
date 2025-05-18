import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableForeignKeyOptions,
} from 'typeorm';
import {
  EnumCustomerSubscriptionStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../../../types/enum/app_enum';

const customerSubscriptionStatus: EnumCustomerSubscriptionStatus[] = [
  EnumCustomerSubscriptionStatus.ACTIVE,
  EnumCustomerSubscriptionStatus.INACTIVE,
];

const subscriptionPlans: EnumSubscriptionPlan[] = [
  EnumSubscriptionPlan.FREEMIUM,
  EnumSubscriptionPlan.MONTHLY,
  EnumSubscriptionPlan.ANNUALLY,
];

export class CustomerSubscriptions1747067312852 implements MigrationInterface {
  tableName: string = 'customer_subscriptions';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableForeignKeys: TableForeignKeyOptions[] = [
      new TableForeignKey({
        columnNames: ['subscription_plan_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'subscription_plans',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    ];

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
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'subscription_plan_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: customerSubscriptionStatus,
            enumName: 'enum_customer_subscription_status',
            default: `'${EnumCustomerSubscriptionStatus.ACTIVE}'`,
          },
          {
            name: 'subscription_status',
            type: 'enum',
            enum: subscriptionPlans,
            enumName: 'enum_customer_subscription_subscription_status',
            default: `'${EnumSubscriptionPlan.FREEMIUM}'`,
          },
          {
            name: 'started_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'expired_at',
            type: 'timestamp',
          },
          {
            name: 'auto_renew',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: tableForeignKeys,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tableName, true, true);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "enum_customer_subscription_status"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "enum_customer_subscription_subscription_status"`,
    );
  }
}
