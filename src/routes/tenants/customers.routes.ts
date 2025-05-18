import { NextFunction, Request, Response, Router } from 'express';
import ROUTES from '../../constant/routes';
import asyncHandler from '../../utils/async_handler';
import { ICustomer } from '../../types/interface/app_interface';
import { CustomerService } from '../../services/tenant/customer.service';
import { AppResponse } from '../../injectors/response.injector';
import passport from 'passport';

const customerRouter = Router();
const customerService = new CustomerService();

customerRouter.post(
  ROUTES.tenants.customers.create,
  asyncHandler(
    async (
      request: Request<{}, {}, ICustomer>,
      _: Response,
      next: NextFunction,
    ) => {
      const schema: string = request.tenantId as string;
      const response = await customerService.createCustomer(
        schema,
        request.body,
      );
      return next(AppResponse.success({ data: response }));
    },
  ),
);

customerRouter.get(
  ROUTES.tenants.customers.subscriptions,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const schema: string = request.headers['x-tenant-id'] as string;
    const response = await customerService.getCustomerSubscription(
      schema,
      request.currentUser?.id!,
    );
    return next(AppResponse.success({ data: response }));
  }),
);

customerRouter.get(
  ROUTES.tenants.subscriptionHistory.history,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const schema: string = request.headers['x-tenant-id'] as string;
    const response = await customerService.getCustomerSubscriptionHistory(
      schema,
      request.currentUser?.id!,
    );
    return next(AppResponse.success({ data: response }));
  }),
);

export default customerRouter;
