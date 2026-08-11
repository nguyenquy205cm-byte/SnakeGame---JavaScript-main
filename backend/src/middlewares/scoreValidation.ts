import { Request, Response, NextFunction } from 'express';

interface CreateScorePayload {
  score: number;
  level?: number;
  playerName?: string;
}

const isValidScorePayload = (payload: unknown): payload is CreateScorePayload => {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.score !== 'number' || !Number.isFinite(record.score) || record.score < 0) {
    return false;
  }
  if (record.level !== undefined && (typeof record.level !== 'number' || !Number.isInteger(record.level) || record.level < 1)) {
    return false;
  }
  if (record.playerName !== undefined && typeof record.playerName !== 'string') {
    return false;
  }
  return true;
};

export const validateScorePayload = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidScorePayload(req.body)) {
    return res.status(400).json({
      status: 'error',
      message: 'Payload must include score (non-negative number). level (integer >= 1) and playerName (string) are optional.',
    });
  }

  const body: Record<string, unknown> = { score: req.body.score };
  if (req.body.level !== undefined) {
    body.level = req.body.level;
  }
  if (req.body.playerName !== undefined) {
    body.playerName = req.body.playerName;
  }
  req.body = body;

  next();
};
