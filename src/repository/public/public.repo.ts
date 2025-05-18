import { Repository } from 'typeorm';
import AppDataSource from '../../db/data-source';
import { OrganizationEntity } from '../../entities/public/organization.entity';
import { UserEntity } from '../../entities/public/users.entity';

function userRepository(): Repository<UserEntity> {
  const userRepository = AppDataSource.getRepository(UserEntity);
  return userRepository;
}

function organizationRepository(): Repository<OrganizationEntity> {
  const organizationRepository =
    AppDataSource.getRepository(OrganizationEntity);
  return organizationRepository;
}

export { userRepository, organizationRepository };
