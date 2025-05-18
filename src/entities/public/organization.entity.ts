import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './users.entity';
import { BaseEntity } from '../base_entity';

@Entity('organizations')
export class OrganizationEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 128 })
  domain: string;

  @Column({ type: 'varchar', unique: true })
  identifier: string;

  @Column({ name: 'organization_name', type: 'varchar', length: 164 })
  organizationName: string;

  @Column({ name: 'organization_code', type: 'varchar', unique: true })
  organizationCode: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
