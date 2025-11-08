// src/lib/http-exception.filter.ts
// ...

import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

// src/lib/http-exception.filter.ts
interface HttpExceptionResponse {
  statusCode: number; // HTTP status code (400, 404, 500, etc.)
  timestamp: string; // Wanneer de error optrad
  message: string; // Error boodschap
  details?: object | null; // Extra error details (optioneel)
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const responseBody: HttpExceptionResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message,
      details: null,
    };

    // 👇
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse &&
        typeof exceptionResponse.message === 'string'
      ) {
        responseBody.message = exceptionResponse.message; // we nemen de custom message over ipv de basis error message
      }

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'details' in exceptionResponse &&
        typeof exceptionResponse.details === 'object'
      ) {
        responseBody.details = exceptionResponse.details;
      }
    }

    new Logger('HttpExceptionFilter').error(
      `HTTP Exception: ${JSON.stringify(responseBody)}`,
    );

    response.status(status).json(responseBody);
  }
}
