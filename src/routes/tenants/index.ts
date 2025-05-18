import { Router } from 'express';
import customerRouter from './customers.routes';
import subscriptionRouter from './subscription.routes';
import paymentRouter from './payment.routes';
import authRouter from './auth.routes';

const router: Router = Router();

const routes: Router[] = [
  customerRouter,
  subscriptionRouter,
  paymentRouter,
  authRouter,
];

for (let i = 0; i < routes.length; i++) {
  router.use(routes[i]);
}

export default router;
