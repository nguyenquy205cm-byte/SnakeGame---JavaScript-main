import { Router } from 'express';
import { getTopScores, getScoreById, getScoreHistory, createScore, deleteScore } from '../controllers/scoreController';
import { validateScorePayload } from '../middlewares/scoreValidation';
import { requireAuth, optionalAuth } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

export const scoreRouter = Router();

scoreRouter.get('/top', getTopScores);
scoreRouter.get('/history', requireAuth, getScoreHistory);
scoreRouter.get('/:id', requireAuth, getScoreById);
scoreRouter.post('/', optionalAuth, validateScorePayload, createScore);
scoreRouter.delete('/:id', requireAuth, requireRole('ADMIN'), deleteScore);
