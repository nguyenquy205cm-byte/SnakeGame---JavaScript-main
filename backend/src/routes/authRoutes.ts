import { Router } from 'express';
import { login, logout, refreshToken, register, getCurrentUser } from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';
import { authRateLimiter } from '../middlewares/authRateLimiter';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, register);
authRouter.post('/login', authRateLimiter, login);
authRouter.post('/refresh', refreshToken);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, getCurrentUser);
