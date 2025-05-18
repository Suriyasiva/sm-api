import { errorStatusCodes } from './http_status_codes';
import { HttpError } from './http.error';

interface DatabaseErrorOptions {
  message?: string;
  statusCode?: number;
  data?: any;
}

class DatabaseError extends HttpError {
  constructor({
    message = 'Database Error',
    statusCode = errorStatusCodes.INTERNAL_SERVER_ERROR,
    data,
  }: DatabaseErrorOptions = {}) {
    super({
      message,
      name: 'DATABASE_ERROR',
      statusCode,
      data,
    });
  }
}

export { DatabaseError };
