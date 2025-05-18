import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base_entity';

@Entity('customers')
export class CustomerEntity extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 64 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 64 })
  lastName: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'encrypted_password', type: 'varchar' })
  encryptedPassword: string;
}
