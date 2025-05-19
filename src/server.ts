import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { errorStatusCodes } from './custom_exceptions/http_status_codes';
import dotenv from 'dotenv';
import router from './routes/index';
import { AppResponse, sendResponse } from './injectors/response.injector';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import AppDataSource from './db/data-source';
import './config/passportJwt';
import passport from 'passport';
import { tenantMiddleware } from './middlewares/tenantMiddleware';
import cron from 'node-cron';
import scheduleService from './services/tenant/schedule.service';

dotenv.config();

const app = express();

const server = async () => {
  const APP_STARTED_LOG = `
==== SM API 🚚💥 =====
PORT: ${process.env.PORT}
ENVIRONMENT: ${process.env.NODE_ENV}
STARTED AT: ${new Date()}
Listening...
=======\n`;

  app.use(
    cors({
      origin: '*',
    }),
  );

  app.use(express.json());
  app.use(passport.initialize());
  app.use(tenantMiddleware);

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  });

  app.use(helmet());
  app.use(limiter);

  app.use('/v1', router);

  // HANDLE 404 - route not found
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(
      AppResponse.error({
        data: { error: 'Not Found' },
        statusCode: errorStatusCodes.NOT_FOUND,
      }),
    );
  });

  // FINAL RESPONSE FORMATTER
  app.use(
    (appResponse: any, _req: Request, res: Response, _next: NextFunction) => {
      const response = sendResponse(appResponse);
      res.status(appResponse.statusCode || 500).json(response);
    },
  );

  AppDataSource.initialize()
    .then(() => {
      console.log('📦 Data Source has been initialized!');
    })
    .catch((err) => {
      console.error('❌ Error during Data Source initialization', err);
    });

  const PORT = process.env.PORT || 5143;

  cron.schedule('0 0 * * *', () => {
    scheduleService.updateSubscriptionStatus();
    scheduleService.autoRenewSubscription();
  });

  app.listen(PORT, (error?: Error) => {
    if (error) console.error('Server error:', error);
    console.log(APP_STARTED_LOG);
  });
};

export default server;
