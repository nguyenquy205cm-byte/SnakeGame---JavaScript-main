import { Request, Response, NextFunction } from 'express';
import type { CookieOptions } from 'express';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { auditLogService } from '../services/auditLogService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { loadConfig } from '../config';

const config = loadConfig();

const getRefreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    const { user, accessToken, refreshToken } = result;
    await auditLogService.create({ action: 'REGISTER', userId: user.id, entity: 'User', entityId: user.id, ipAddress: req.ip });
    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.status(201).json({
      status: 'success',
      data: {
        user: { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    await auditLogService.create({ action: 'LOGIN', userId: user.id, entity: 'User', entityId: user.id, ipAddress: req.ip });

    res.cookie('refreshToken', refreshToken, getRefreshCookieOptions());
    res.status(200).json({
      status: 'success',
      data: {
        user: { id: user.id, username: user.username, email: user.email, role: user.role, isActive: user.isActive },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.body.token || req.cookies?.refreshToken;
    const result = await authService.refreshToken(token);
    res.cookie('refreshToken', result.refreshToken, getRefreshCookieOptions());
    res.status(200).json({ status: 'success', data: { accessToken: result.accessToken } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.body.token || req.cookies?.refreshToken;
    await authService.logout(token);
    res.clearCookie('refreshToken', getRefreshCookieOptions());
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }

    const user = await userService.getById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
