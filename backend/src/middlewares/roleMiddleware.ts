import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Authentication required' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden: insufficient role' });
    }

    return next();
  };
};
