import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import {
  EnumPaymentPaymentProvider,
  EnumPaymentStatus,
} from '../../../types/enum/app_enum';

const paymentStatus: EnumPaymentStatus[] = [
  EnumPaymentStatus.FAILED,
  EnumPaymentStatus.PENDING,
  EnumPaymentStatus.SUCCESS,
];

const paymentProvider: EnumPaymentPaymentProvider[] = [
  EnumPaymentPaymentProvider.RAZORPAY,
  EnumPaymentPaymentProvider.BILL_DESK,
  EnumPaymentPaymentProvider.STRIP,
];

export class CreatePaymentTransactions1747236035348
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableForeignKeys = [
      new TableForeignKey({
        columnNames: ['subscription_plan_id'],
        referencedTableName: 'subscription_plans',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['customer_subscription_id'],
        referencedTableName: 'customer_subscriptions',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedTableName: 'customers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ];

    await queryRunner.createTable(
      new Table({
        name: 'payment_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'status',
            type: 'enum',
            enumName: 'payment_transaction_status_enum',
            enum: paymentStatus,
            default: `'${EnumPaymentStatus.PENDING}'`,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'subscription_plan_id',
            type: 'uuid',
          },
          {
            name: 'customer_subscription_id',
            type: 'uuid',
          },
          {
            name: 'customer_id',
            type: 'uuid',
          },
          {
            name: 'payment_provider',
            type: 'enum',
            enumName: 'enum_payment_payment_provider',
            enum: paymentProvider,
            default: `'${EnumPaymentPaymentProvider.RAZORPAY}'`,
          },
          {
            name: 'external_transaction_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'external_order_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'amount',
            type: 'numeric',
            isNullable: false,
          },
          {
            name: 'meta_data',
            type: 'jsonb',
            default: "'{}'",
            comment: `Example: {backgroundColor: '#fff',  fontColor: '#000'}`,
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
    await queryRunner.dropTable('payment_transactions', true, true);
    await queryRunner.query(`DROP TYPE "payment_transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "enum_payment_payment_provider"`);
  }
}
