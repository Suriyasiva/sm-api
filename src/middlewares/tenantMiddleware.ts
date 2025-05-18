import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const tenantId = req.headers['x-tenant-id'] as string;

  req.tenantId = tenantId;
  res.locals.tenantId = tenantId;
  next();
}
