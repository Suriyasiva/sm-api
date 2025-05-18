import { NextFunction, Request, Response, Router } from 'express';
import ROUTES from '../../constant/routes';
import asyncHandler from '../../utils/async_handler';
import { AppResponse } from '../../injectors/response.injector';
import { PaymentTransactionsService } from '../../services/tenant/payments.service';
import { IPaymentOptions } from '../../types/interface/app_interface';
import passport from 'passport';

const paymentRouter = Router();
const paymentTransactionService = new PaymentTransactionsService();

paymentRouter.get(
  ROUTES.tenants.payments.calculatePaymentAmount,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const tenantId: string = request.tenantId!;
    const subscriptionPlanId: string = request.params['subscriptionId'];

    const calculateAmount =
      await paymentTransactionService.calculatePaymentAmountForSubscription(
        tenantId,
        request.currentUser?.id!,
        subscriptionPlanId,
      );

    return next(
      AppResponse.success({
        data: calculateAmount,
      }),
    );
  }),
);

paymentRouter.get(
  ROUTES.tenants.payments.paymentTransactions,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(async (request: Request, _: Response, next: NextFunction) => {
    const tenantId: string = request.tenantId!;
    const customerId: string = request.currentUser?.id!;

    const transactions =
      await paymentTransactionService.getCustomerPaymentTransactions(
        tenantId,
        customerId,
      );

    return next(
      AppResponse.success({
        data: transactions,
      }),
    );
  }),
);

paymentRouter.post(
  ROUTES.tenants.payments.createPayment,
  passport.authenticate('jwt', { session: false }),
  asyncHandler(
    async (
      request: Request<{}, {}, IPaymentOptions>,
      _: Response,
      next: NextFunction,
    ) => {
      const tenantId: string = request.tenantId!;
      const paymentOptions = request.body;
      const customerId: string = request.currentUser?.id!;

      const calculateAmount = await paymentTransactionService.createPayment(
        tenantId,
        customerId,
        paymentOptions,
      );

      return next(
        AppResponse.success({
          data: calculateAmount,
        }),
      );
    },
  ),
);

export default paymentRouter;
