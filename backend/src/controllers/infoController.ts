import { Request, Response } from 'express';
import { infoService } from '../services/infoService';

export const getInfo = (_req: Request, res: Response) => {
  const result = infoService.getInfo();
  res.status(200).json(result);
};
