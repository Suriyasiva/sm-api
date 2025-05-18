import { NextFunction, Request, Response, Router } from 'express';
import ROUTES from '../../constant/routes';
import asyncHandler from '../../utils/async_handler';
import { ILogin } from '../../types/interface/app_interface';
import { AppResponse } from '../../injectors/response.injector';
import { AuthService } from '../../services/tenant/auth.service';
import passport from 'passport';

const authRouter = Router();
const authService = new AuthService();

authRouter.post(
  ROUTES.tenants.auth.login,
  asyncHandler(
    async (
      request: Request<{}, {}, ILogin>,
      _: Response,
      next: NextFunction,
    ) => {
      const schema: string = request.headers['x-tenant-id'] as string;

      const response = await authService.login(schema, request.body);

      return next(AppResponse.success({ data: response }));
    },
  ),
);

authRouter.get(
  ROUTES.tenants.auth.lookup,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: any, _: Response, next: NextFunction) => {
    delete request.currentUser.encryptedPassword
    return next(AppResponse.success({ data: { ...request.currentUser } }));
  }),
);

export default authRouter;
