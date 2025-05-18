import { Router } from 'express';
import usersRouter from './users.routes';
import authRouter from './auth.routes';

const publicRouter: Router = Router();

const routes: Router[] = [authRouter, usersRouter];

for (let i = 0; i < routes.length; i++) {
  publicRouter.use(routes[i]);
}

export default publicRouter;
