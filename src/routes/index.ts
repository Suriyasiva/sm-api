import { Router } from 'express';
import tenantRouter from './tenants/index';
import publicRouter from './public';

const router: Router = Router({});

const routes = [publicRouter, tenantRouter];

for (let i = 0; i < routes.length; i++) {
  const route = routes[i];
  router.use(route);
}

export default router;
