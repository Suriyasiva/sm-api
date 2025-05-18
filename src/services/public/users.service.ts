import AppDataSource from '../../db/data-source';
import { TenantService } from '../../db/tenant-service';
import {
  organizationRepository,
  userRepository,
} from '../../repository/public/public.repo';
import { ICreateUser } from '../../types/interface/app_interface';
import bcrypt from 'bcrypt';

export class UsersService {
  async createUser(payload: ICreateUser) {
    const tenantService = new TenantService();
    const dataSource = AppDataSource;

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userRepo = userRepository();
      const hashedPassword = await bcrypt.hash(payload.password, 10);

      const user = await userRepo.save({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        encryptedPassword: hashedPassword,
      });

      const identifier = payload.organizationName
        .trim()
        .replace(/\s+/g, '_')
        .toLowerCase();

      const organizationRepo = organizationRepository();
      const randomFourDigit = Math.floor(1000 + Math.random() * 9000);

      const organization = await organizationRepo.save({
        domain: payload.domain,
        identifier: identifier,
        organizationName: payload.organizationName,
        userId: user.id,
        organizationCode: randomFourDigit.toString(),
      });

      await tenantService.createTenant(identifier);

      await queryRunner.commitTransaction();
      return { ...organization, ...user };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new Error(error);
    } finally {
      await queryRunner.release();
    }
  }
}
