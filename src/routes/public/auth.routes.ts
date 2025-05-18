import ROUTES from '../../constant/routes';
import { AppResponse } from '../../injectors/response.injector';
import AuthService from '../../services/public/auth.service';
import asyncHandler from '../../utils/async_handler';

interface LoginRequestBody {
  email: string;
  password: string;
}

import { NextFunction, Request, Response, Router } from 'express';
const authService = new AuthService();

const authRouter = Router();

authRouter.post(
  ROUTES.auth.login,
  asyncHandler(
    async (
      request: Request<{}, {}, LoginRequestBody>,
      _: Response,
      next: NextFunction,
    ) => {
      const response = await authService.login(request.body);
      return next(AppResponse.success({ data: response }));
    },
  ),
);

authRouter.post(
  ROUTES.auth.findOrganization,
  asyncHandler(
    async (
      request: Request<{}, {}, { organizationIdentifier: string }>,
      _: Response,
      next: NextFunction,
    ) => {
      const response = await authService.findOrganizationByIdentifierCode(
        request.body.organizationIdentifier,
      );
      return next(AppResponse.success({ data: response }));
    },
  ),
);

export default authRouter;
