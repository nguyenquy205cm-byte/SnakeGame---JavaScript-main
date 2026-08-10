import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const getJwtConfig = () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!secret || !refreshSecret) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be configured');
  }

  return {
    secret,
    refreshSecret,
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
    refreshExpiresIn: refreshExpiresIn as jwt.SignOptions['expiresIn'],
  };
};

const createAccessToken = (user: { id: number; username: string; role: string }) => {
  const { secret, expiresIn } = getJwtConfig();
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn });
};

const createRefreshToken = (userId: number) => {
  const { refreshSecret, refreshExpiresIn } = getJwtConfig();
  return jwt.sign({ id: userId }, refreshSecret, { expiresIn: refreshExpiresIn });
};

export const authService = {
  register: async (payload: RegisterPayload) => {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    const normalizedUsername = payload.username?.trim();

    if (!normalizedUsername || normalizedUsername.length < 3) {
      throw Object.assign(new Error('Username must be at least 3 characters long'), { status: 400 });
    }

    if (!normalizedEmail || !/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(normalizedEmail)) {
      throw Object.assign(new Error('Email is invalid'), { status: 400 });
    }

    if (!payload.password || payload.password.length < 8) {
      throw Object.assign(new Error('Password must be at least 8 characters long'), { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: normalizedEmail }, { username: normalizedUsername }] } });
    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw Object.assign(new Error('Email already exists'), { status: 409 });
      }
      throw Object.assign(new Error('Username already exists'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        role: 'USER',
      },
    });

    const accessToken = createAccessToken({ id: user.id, username: user.username, role: user.role });
    const refreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  },

  login: async (payload: LoginPayload) => {
    const normalizedEmail = payload.email?.trim().toLowerCase();
    if (!normalizedEmail || !payload.password) {
      throw Object.assign(new Error('Email and password are required'), { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.isActive) {
      throw Object.assign(new Error('Invalid credentials or inactive account'), { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatches) {
      throw Object.assign(new Error('Invalid credentials or inactive account'), { status: 401 });
    }

    const accessToken = createAccessToken({ id: user.id, username: user.username, role: user.role });
    const refreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  },

  refreshToken: async (token: string) => {
    if (!token) {
      throw Object.assign(new Error('Refresh token is required'), { status: 400 });
    }

    const { refreshSecret } = getJwtConfig();
    let payload: { id: number };
    try {
      payload = jwt.verify(token, refreshSecret) as { id: number };
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }

    const existingToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!existingToken || existingToken.expiresAt < new Date()) {
      throw Object.assign(new Error('Refresh token expired or not found'), { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || !user.isActive) {
      throw Object.assign(new Error('User not found or inactive'), { status: 401 });
    }

    const accessToken = createAccessToken({ id: user.id, username: user.username, role: user.role });
    const newRefreshToken = createRefreshToken(user.id);

    await prisma.refreshToken.update({
      where: { token },
      data: {
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  },

  logout: async (token: string) => {
    if (!token) {
      throw Object.assign(new Error('Refresh token is required'), { status: 400 });
    }

    await prisma.refreshToken.deleteMany({ where: { token } });
  },
};
