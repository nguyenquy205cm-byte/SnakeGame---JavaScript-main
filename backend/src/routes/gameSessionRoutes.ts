import { Router } from 'express';
import { createGameSession, getGameSessionsByUser, endGameSession } from '../controllers/gameSessionController';
import { requireAuth } from '../middlewares/authMiddleware';

export const gameSessionRouter = Router();

gameSessionRouter.post('/', requireAuth, createGameSession);
gameSessionRouter.get('/', requireAuth, getGameSessionsByUser);
gameSessionRouter.post('/:id/end', requireAuth, endGameSession);
