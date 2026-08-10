import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { getUsers, updateUser, getScores, getAchievements, getAuditLogs } from '../controllers/adminController';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole('ADMIN'));

adminRouter.get('/users', getUsers);
adminRouter.patch('/users/:id', updateUser);
adminRouter.get('/scores', getScores);
adminRouter.get('/achievements', getAchievements);
adminRouter.get('/audit-logs', getAuditLogs);
