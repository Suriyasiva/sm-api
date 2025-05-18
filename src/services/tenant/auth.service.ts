import { JsonWebTokenError } from 'jsonwebtoken';
import { CustomerEntity } from '../../entities/tenant/customers.entity';
import { getTenantRepository } from '../../repository/tenant/tenancy.repository';
import { ILogin } from '../../types/interface/app_interface';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export class AuthService {
  async login(schema: string, payload: ILogin) {
    const customerRepository = await getTenantRepository(
      schema,
      CustomerEntity,
    );

    const customer = await customerRepository.findOne({
      where: { email: payload.email },
    });

    if (!customer) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(
      payload.password,
      customer.encryptedPassword,
    );

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: customer.id, email: customer.email },
      JWT_SECRET!,
      {
        expiresIn: '48h',
      },
    );

    return { token, ...customer };
  }

  async lookup(schema: string) {
    
  }
}
