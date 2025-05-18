import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableForeignKeyOptions,
} from 'typeorm';

export class Organizations1747065734103 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableForeignKeys: TableForeignKeyOptions[] = [
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
      }),
    ];

    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'domain',
            type: 'varchar',
            length: '128',
          },
          {
            name: 'identifier',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'organization_name',
            type: 'varchar',
            length: '164',
          },
          {
            name: 'organization_code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
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
    await queryRunner.dropTable('organizations');
  }
}
