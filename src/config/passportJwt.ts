import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import { getTenantRepository } from '../repository/tenant/tenancy.repository';
import { CustomerEntity } from '../entities/tenant/customers.entity';

declare global {
  namespace Express {
    interface Request {
      currentUser?: CustomerEntity;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const opts: any = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(opts, async (req: any, jwtPayload: any, done: any) => {
    try {
      const tenantRepository = await getTenantRepository(
        req.tenantId,
        CustomerEntity,
      );

      const customer = await tenantRepository.findOne({
        where: {
          email: jwtPayload.email,
        },
      });

      req.user = customer;
      req.currentUser = customer;

      if (!customer) {
        return done(null, false, {
          message: 'Customer not found',
        });
      }

      return done(null, jwtPayload);
    } catch (err) {
      return done(err, false);
    }
  }),
);
