import { Request, Response } from 'express';
import { versionService } from '../services/versionService';

export const getVersion = (_req: Request, res: Response) => {
  const result = versionService.getVersion();
  res.status(200).json(result);
};
