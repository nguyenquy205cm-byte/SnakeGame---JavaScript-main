import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  username: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const parseAuthUser = (req: AuthRequest): AuthUser | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = jwt.verify(token, secret) as { id: number; username: string; role: string };
  return {
    id: payload.id,
    username: payload.username,
    role: payload.role,
  };
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = parseAuthUser(req);
    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Authorization header missing or malformed' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    req.user = parseAuthUser(req) ?? undefined;
  } catch {
    req.user = undefined;
  }
  return next();
};
