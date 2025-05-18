import { HttpInternalServerError } from '../custom_exceptions/http.error';

interface AppResponseOptions {
  data?: any;
  statusCode?: number;
  error?: Error;
}

interface ErrorResponse {
  statusCode: number;
  error: any;
  timestamp: Date;
  stack?: string;
}

interface SuccessResponse {
  statusCode: number;
  data: any;
  timestamp: Date;
}

class AppResponse {
  statusCode: number;
  data: any;
  timestamp: Date;
  error?: any;
  stack?: string;
  success?: boolean;

  constructor(options: AppResponseOptions) {
    this.statusCode = options.statusCode ?? 200;
    this.data = options.data ?? options;
    this.timestamp = new Date();

    if (options.error) {
      this.error = options.error.message;
      this.stack = options.error.stack;
    }
  }

  static success = ({
    data = {},
    statusCode = 200,
  }: AppResponseOptions = {}): SuccessResponse => ({
    statusCode,
    data,
    timestamp: new Date(),
  });

  static error = ({
    data = {},
    statusCode = 500,
    error = new HttpInternalServerError('Something went wrong!'),
  }: AppResponseOptions = {}): ErrorResponse => ({
    statusCode,
    error: (data as any).error ?? data,
    timestamp: new Date(),
    stack: error.stack,
  });
}

const sendResponse = (appResponse: AppResponse) => {
  appResponse.success =
    appResponse.statusCode >= 200 && appResponse.statusCode < 400;

  return {
    success: appResponse.success,
    statusCode: appResponse.statusCode,
    timestamp: appResponse.timestamp,
    data: appResponse.data,
    error: appResponse.error,
    stack: appResponse.stack,
  };
};

export { AppResponse, sendResponse };
