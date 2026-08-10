import { prisma } from '../config/database';

interface CreateGameSessionPayload {
  userId: number;
  score: number;
  level: number;
  duration: number;
  startedAt: Date;
  endedAt: Date;
}

interface EndGameSessionPayload {
  score: number;
  level: number;
  duration: number;
  endedAt: Date;
}

export const gameSessionService = {
  createSession: async (payload: CreateGameSessionPayload) => {
    return prisma.gameSession.create({
      data: {
        userId: payload.userId,
        score: payload.score,
        level: payload.level,
        duration: payload.duration,
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
      },
    });
  },

  getByUserId: async (userId: number) => {
    return prisma.gameSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
  },

  endSession: async (id: number, payload: EndGameSessionPayload) => {
    return prisma.gameSession.update({
      where: { id },
      data: {
        score: payload.score,
        level: payload.level,
        duration: payload.duration,
        endedAt: payload.endedAt,
      },
    });
  },

  getById: async (id: number) => {
    return prisma.gameSession.findUnique({ where: { id } });
  },
};
