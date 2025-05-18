import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableForeignKeyOptions,
} from 'typeorm';
import {
  EnumSubscriptionHistoryStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../../../types/enum/app_enum';

const subscriptionStatuses: EnumSubscriptionStatus[] = [
  EnumSubscriptionStatus.ACTIVE,
  EnumSubscriptionStatus.CANCELLED,
  EnumSubscriptionStatus.SUSPENDED,
  EnumSubscriptionStatus.DOWNGRADED,
  EnumSubscriptionStatus.EXPIRED,
  EnumSubscriptionStatus.GRACE,
  EnumSubscriptionStatus.RENEWED,
  EnumSubscriptionStatus.TRIAL,
  EnumSubscriptionStatus.UPGRADED,
];

const subscriptionHistoryStatus: EnumSubscriptionHistoryStatus[] = [
  EnumSubscriptionHistoryStatus.ACTIVE,
  EnumSubscriptionHistoryStatus.INACTIVE,
];

const subscriptionPlans: EnumSubscriptionPlan[] = [
  EnumSubscriptionPlan.FREEMIUM,
  EnumSubscriptionPlan.MONTHLY,
  EnumSubscriptionPlan.ANNUALLY,
];

export class SubscriptionHistory1747067417327 implements MigrationInterface {
  tableName: string = 'subscription_history';
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
        columnNames: ['customer_subscriptions_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customer_subscriptions',
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
            name: 'subscription_plan_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: subscriptionHistoryStatus,
            enumName: 'enum_subscription_history_status',
            default: `'${EnumSubscriptionHistoryStatus.ACTIVE}'`,
          },
          {
            name: 'from_status',
            type: 'enum',
            enum: subscriptionPlans,
            enumName: 'enum_subscription_history_from_status',
            default: `'${EnumSubscriptionPlan.FREEMIUM}'`,
          },
          {
            name: 'to_status',
            type: 'enum',
            enum: subscriptionPlans,
            enumName: 'enum_subscription_history_to_status',
            default: `'${EnumSubscriptionPlan.FREEMIUM}'`,
          },
          {
            name: 'subscription_status',
            type: 'enum',
            enum: subscriptionStatuses,
            enumName: 'enum_subscription_history_subscription_status',
            default: `'${EnumSubscriptionStatus.TRIAL}'`,
          },
          {
            name: 'customer_subscriptions_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
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
    await queryRunner.dropTable(this.tableName);
    await queryRunner.query(`DROP TYPE IF EXISTS "enum_subscription_status"`);
  }
}
