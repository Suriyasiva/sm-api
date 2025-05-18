import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpError } from '../custom_exceptions/http.error';
import { errorStatusCodes } from '../custom_exceptions/http_status_codes';
import { AppResponse } from '../injectors/response.injector';

/**
 * Handles error and returns the error response instance
 */
export const handleError = (error: Error | HttpError) => {
  return AppResponse.error({
    statusCode:
      (error as HttpError).statusCode || errorStatusCodes.INTERNAL_SERVER_ERROR,
    data: {
      message: error.message,
    },
    error,
  });
};

/**
 * Wraps async route handler and forwards errors to Express error handler
 */
const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      const errorResponse = handleError(err);
      next(errorResponse);
    });
  };

export default asyncHandler;
