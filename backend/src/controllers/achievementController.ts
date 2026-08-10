import { Response, NextFunction } from 'express';
import { achievementService } from '../services/achievementService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getAchievements = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const achievements = await achievementService.getAll();
    res.status(200).json({ status: 'success', data: achievements });
  } catch (error) {
    next(error);
  }
};

export const getAchievementsByUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'User not authenticated' });
    }

    const achievements = await achievementService.getByUserId(userId);
    const data = achievements.map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      requirement: achievement.requirement,
      createdAt: achievement.createdAt,
      unlockedAt: achievement.userAchievements.length > 0 ? achievement.userAchievements[0].unlockedAt : null,
    }));

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
