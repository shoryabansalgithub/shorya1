import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { TenantContextService } from '../../iam/tenant-context/tenant-context.service';

interface ErrorResponseBody {
  statusCode: number;
  message: string;
  error: string;
  correlationId: string;
  timestamp: string;
}

/**
 * Global exception filter that catches ALL unhandled errors and formats
 * them into a consistent JSON envelope. Prevents stack trace leakage
 * in production and attaches the correlationId for log tracing.
 *
 * Response shape:
 * {
 *   statusCode: 500,
 *   message: "Internal server error",
 *   error: "InternalServerError",
 *   correlationId: "abc-123",
 *   timestamp: "2026-07-02T09:00:00.000Z"
 * }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId =
      TenantContextService.asAsyncLocalStorage.getStore()?.correlationId || 'unknown';

    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        // Support class-validator array messages
        message = Array.isArray(resp.message)
          ? resp.message.join('; ')
          : typeof resp.message === 'string'
            ? resp.message
            : exception.message;
      } else {
        message = exception.message;
      }

      error =
        HttpStatus[statusCode] ||
        exception.name ||
        'UnknownError';
    } else {
      // Unhandled / non-HTTP exception — NEVER expose internals
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';

      // Log the full error for operators; only the safe message reaches the client
      this.logger.error(
        `Unhandled exception [correlationId=${correlationId}]`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      statusCode,
      message,
      error,
      correlationId: String(correlationId),
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }
}
