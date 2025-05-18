import { organizationRepository } from '../../repository/public/public.repo';

class AuthService {
  async login(payload: any) {
    return payload;
  }

  async findOrganizationByIdentifierCode(organizationCode: any) {
    const organizationRepo = organizationRepository();

    return await organizationRepo.findOne({
      where: {
        organizationCode: organizationCode,
      },
      select: {
        identifier: true,
        organizationCode: true,
        organizationName: true,
      },
    });
  }
}

export default AuthService;
