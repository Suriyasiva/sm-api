import { errorStatusCodes } from './http_status_codes';

interface HttpErrorOptions {
  message: string;
  name: string;
  statusCode: number;
  data?: any;
}

class HttpError extends Error {
  statusCode: number;
  data?: any;

  constructor({ message, name, statusCode, data }: HttpErrorOptions) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

class HttpBadRequest extends HttpError {
  constructor(message = 'Bad request', data?: any) {
    super({
      message,
      name: 'HTTP_BAD_REQUEST',
      statusCode: errorStatusCodes.BAD_REQUEST,
      data,
    });
  }
}

class HttpNotFound extends HttpError {
  constructor(message = 'Not Found', data?: any) {
    super({
      message,
      name: 'HTTP_NOT_FOUND',
      statusCode: errorStatusCodes.NOT_FOUND,
      data,
    });
  }
}

class HttpInternalServerError extends HttpError {
  constructor(message = 'Internal server error', data?: any) {
    super({
      message,
      name: 'HTTP_INTERNAL_SERVER_ERROR',
      statusCode: errorStatusCodes.INTERNAL_SERVER_ERROR,
      data,
    });
  }
}

class HttpUnAuthorized extends HttpError {
  constructor(message = 'Un Authorized', data?: any) {
    super({
      message,
      name: 'HTTP_UNAUTHORIZED',
      statusCode: errorStatusCodes.UNAUTHORIZED,
      data,
    });
  }
}

class HttpForbidden extends HttpError {
  constructor(message = 'Forbidden', data?: any) {
    super({
      message,
      name: 'FORBIDDEN',
      statusCode: errorStatusCodes.FORBIDDEN,
      data,
    });
  }
}

class HttpUnProcessableEntity extends HttpError {
  constructor(message = 'Unprocessable Entity', data?: any) {
    super({
      message,
      name: 'HTTP_UNPROCESSABLE_ENTITY',
      statusCode: errorStatusCodes.UNPROCESSABLE_ENTITY,
      data,
    });
  }
}

export {
  HttpError,
  HttpBadRequest,
  HttpNotFound,
  HttpInternalServerError,
  HttpUnAuthorized,
  HttpUnProcessableEntity,
  HttpForbidden,
};
