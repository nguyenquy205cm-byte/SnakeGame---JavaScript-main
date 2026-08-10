import { Router } from 'express';
import { getAchievements, getAchievementsByUser } from '../controllers/achievementController';
import { requireAuth } from '../middlewares/authMiddleware';

export const achievementRouter = Router();

achievementRouter.get('/', getAchievements);
achievementRouter.get('/me', requireAuth, getAchievementsByUser);
