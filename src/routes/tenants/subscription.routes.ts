import { NextFunction, Request, Response, Router } from 'express';
import ROUTES from '../../constant/routes';
import asyncHandler from '../../utils/async_handler';
import { IPlanUpgrade } from '../../types/interface/app_interface';
import { AppResponse } from '../../injectors/response.injector';
import { SubscriptionService } from '../../services/tenant/subscription.service';
import passport from 'passport';

const subscriptionRouter = Router();
const subscriptionService = new SubscriptionService();
const currentUserId = '5f6864d1-69d6-4a70-9a0f-b0a87d215243';

subscriptionRouter.post(
  ROUTES.tenants.customerSubscriptions.upgrade,
  asyncHandler(
    async (
      request: Request<{}, {}, IPlanUpgrade>,
      _: Response,
      next: NextFunction,
    ) => {
      const schema: string = request.headers['x-tenant-id'] as string;
      const response = await subscriptionService.upgrade(
        schema,
        currentUserId,
        request.body,
      );
      return next(AppResponse.success({ data: response }));
    },
  ),
);

subscriptionRouter.post(
  ROUTES.tenants.customerSubscriptions.downgrade,
  asyncHandler(
    async (
      request: Request<{}, {}, IPlanUpgrade>,
      _: Response,
      next: NextFunction,
    ) => {
      const schema: string = request.tenantId!;
      const response = await subscriptionService.downGrade(
        schema,
        currentUserId,
        request.body,
      );
      return next(AppResponse.success({ data: response }));
    },
  ),
);

subscriptionRouter.get(
  ROUTES.tenants.subscriptionPlans.plans,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const schema: string = request.tenantId!;

    const response = await subscriptionService.getSubscriptionPlans(schema);

    return next(AppResponse.success({ data: response }));
  }),
);

subscriptionRouter.put(
  ROUTES.tenants.customerSubscriptions.toggleAutoRenewal,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const schema: string = request.tenantId!;

    const response = await subscriptionService.toggleAutoRenewal(
      schema,
      request.currentUser?.id!,
    );

    return next(AppResponse.success({ data: response }));
  }),
);

export default subscriptionRouter;
