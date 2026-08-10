import { Response, NextFunction } from 'express';
import { gameSessionService } from '../services/gameSessionService';
import { auditLogService } from '../services/auditLogService';
import { AuthRequest } from '../middlewares/authMiddleware';

const parseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error('Invalid numeric value');
    }
    return parsed;
  }
  throw new Error('Invalid numeric value');
};

export const createGameSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const { score, level, duration, startedAt, endedAt } = req.body;
    const session = await gameSessionService.createSession({
      userId,
      score: parseNumber(score),
      level: parseNumber(level),
      duration: parseNumber(duration),
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
    });

    await auditLogService.create({
      action: 'CREATE_GAME_SESSION',
      userId,
      entity: 'GameSession',
      entityId: session.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ status: 'success', data: session });
  } catch (error) {
    next(error);
  }
};

export const getGameSessionsByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const sessions = await gameSessionService.getByUserId(userId);
    res.status(200).json({ status: 'success', data: sessions });
  } catch (error) {
    next(error);
  }
};

export const endGameSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid session id' });
    }

    const existingSession = await gameSessionService.getById(sessionId);
    if (!existingSession) {
      return res.status(404).json({ status: 'fail', message: 'Game session not found' });
    }

    if (req.user?.role !== 'ADMIN' && req.user?.id !== existingSession.userId) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden' });
    }

    const { score, level, duration, endedAt } = req.body;
    const updated = await gameSessionService.endSession(sessionId, {
      score: parseNumber(score),
      level: parseNumber(level),
      duration: parseNumber(duration),
      endedAt: new Date(endedAt),
    });

    await auditLogService.create({
      action: 'END_GAME_SESSION',
      userId: existingSession.userId,
      entity: 'GameSession',
      entityId: sessionId,
      ipAddress: req.ip,
    });

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};
