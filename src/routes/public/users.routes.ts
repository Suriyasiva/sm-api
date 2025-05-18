import { NextFunction, Request, Response, Router } from 'express';
import ROUTES from '../../constant/routes';
import asyncHandler from '../../utils/async_handler';
import { UsersService } from '../../services/public/users.service';
import { ICreateUser } from '../../types/interface/app_interface';
import { AppResponse } from '../../injectors/response.injector';

const usersRouter = Router();
const userService = new UsersService();

usersRouter.post(
  ROUTES.public.createUser,
  asyncHandler(
    async (
      request: Request<{}, {}, ICreateUser>,
      _: Response,
      next: NextFunction,
    ) => {
      const response = await userService.createUser(request.body);
      return next(AppResponse.success({ data: response }));
    },
  ),
);

export default usersRouter;
