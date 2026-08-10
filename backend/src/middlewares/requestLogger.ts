import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - startedAt}ms`);
  });

  next();
};
