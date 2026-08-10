import { Request, Response, NextFunction } from 'express';

interface CreateScorePayload {
  score: number;
  level: number;
}

const isValidScorePayload = (payload: unknown): payload is CreateScorePayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;
  return (
    typeof record.score === 'number' && Number.isFinite(record.score) && record.score >= 0 &&
    typeof record.level === 'number' && Number.isInteger(record.level) && record.level >= 1
  );
};

export const validateScorePayload = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidScorePayload(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Payload must include score (non-negative number) and level (integer >= 1).',
    });
  }

  req.body = {
    score: req.body.score,
    level: req.body.level,
  };

  next();
};
