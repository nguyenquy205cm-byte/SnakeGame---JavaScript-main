import { Response, NextFunction } from 'express';
import { scoreService } from '../services/scoreService';
import { userService } from '../services/userService';
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

export const getTopScores = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scores = await scoreService.getTopScores();
    const data = scores.map((score, index) => ({
      rank: index + 1,
      username: score.user?.username ?? score.playerName ?? 'Guest',
      score: score.score,
      level: score.level,
      createdAt: score.createdAt,
    }));

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getScoreById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scoreId = Number(req.params.id);
    if (!Number.isInteger(scoreId) || scoreId <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid score id' });
    }

    const score = await scoreService.getById(scoreId);
    if (!score) {
      return res.status(404).json({ status: 'fail', message: 'Score not found' });
    }

    if (req.user?.role !== 'ADMIN' && req.user?.id !== score.userId) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden' });
    }

    res.status(200).json({ status: 'success', data: score });
  } catch (error) {
    next(error);
  }
};

export const getScoreHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const { data, total } = await scoreService.getScoreHistory(userId, page, limit);
    res.status(200).json({ status: 'success', data, meta: { total, page, limit } });
  } catch (error) {
    next(error);
  }
};

export const createScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { score, level, playerName } = req.body;
    const userId = req.user?.id ?? null;

    const created = await scoreService.createScore({
      userId,
      score: parseNumber(score),
      level: level !== undefined ? parseNumber(level) : 1,
      playerName: typeof playerName === 'string' && playerName.trim() ? playerName.trim() : null,
    });

    await auditLogService.create({
      action: 'CREATE_SCORE',
      userId,
      entity: 'Score',
      entityId: created.id,
      ipAddress: req.ip,
    });

    res.status(201).json({ status: 'success', data: created });
  } catch (error) {
    next(error);
  }
};

export const deleteScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scoreId = Number(req.params.id);
    if (!Number.isInteger(scoreId) || scoreId <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid score id' });
    }

    const existing = await scoreService.getById(scoreId);
    if (!existing) {
      return res.status(404).json({ status: 'fail', message: 'Score not found' });
    }

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ status: 'fail', message: 'Only ADMIN can delete scores' });
    }

    const deleted = await scoreService.deleteById(scoreId);
    await auditLogService.create({
      action: 'DELETE_SCORE',
      userId: deleted.userId ?? null,
      entity: 'Score',
      entityId: deleted.id,
      ipAddress: req.ip,
    });

    res.status(200).json({ status: 'success', data: deleted });
  } catch (error) {
    next(error);
  }
};
