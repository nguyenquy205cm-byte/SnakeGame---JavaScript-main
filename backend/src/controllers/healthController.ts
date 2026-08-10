import { Request, Response } from 'express';
import { healthService } from '../services/healthService';
import { logger } from '../utils/logger';

export const getHealth = (_req: Request, res: Response) => {
  const result = healthService.getHealth();
  res.status(200).json(result);
};

export const getHealthDb = async (_req: Request, res: Response) => {
  try {
    const result = await healthService.getDatabaseHealth();
    res.status(200).json(result);
  } catch (error) {
    logger.error('Database health check failed', error instanceof Error ? error.message : String(error));
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Database is not reachable',
    });
  }
};
