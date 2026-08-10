import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { scoreService } from '../services/scoreService';
import { achievementService } from '../services/achievementService';
import { auditLogService } from '../services/auditLogService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAll();
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Invalid user id' });
    }

    const existing = await userService.getById(userId);
    if (!existing) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const { isActive, role } = req.body;
    if (role !== undefined && role !== 'USER' && role !== 'ADMIN') {
      return res.status(400).json({ status: 'fail', message: 'Role must be USER or ADMIN' });
    }
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({ status: 'fail', message: 'isActive must be a boolean' });
    }

    const updated = await userService.update(userId, { isActive, role });
    await auditLogService.create({
      action: 'ADMIN_UPDATE_USER',
      userId: req.user?.id,
      entity: 'User',
      entityId: userId,
      ipAddress: req.ip,
    });

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    next(error);
  }
};

export const getScores = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scores = await scoreService.getAllForAdmin();
    res.status(200).json({ status: 'success', data: scores });
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const achievements = await achievementService.getAllForAdmin();
    const data = achievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      requirement: achievement.requirement,
      createdAt: achievement.createdAt,
      unlockedCount: achievement.userAchievements.length,
    }));
    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await auditLogService.getAll();
    res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    next(error);
  }
};
