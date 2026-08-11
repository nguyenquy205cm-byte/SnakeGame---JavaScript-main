import { Request, Response, NextFunction } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { logger } from '../utils/logger';

interface AppError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const status = err.status || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  if (status >= 500) {
    const span = trace.getActiveSpan();
    span?.recordException(err);
    span?.setStatus({ code: SpanStatusCode.ERROR });
  }

  logger.error(err.message, { status, code, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack });
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code,
  });
};
