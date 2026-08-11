import { prisma } from '../config/database';

interface CreateScorePayload {
  userId: number | null;
  score: number;
  level: number;
  playerName?: string | null;
}

export const scoreService = {
  createScore: async (payload: CreateScorePayload) => {
    return prisma.score.create({
      data: {
        userId: payload.userId,
        playerName: payload.playerName ?? null,
        score: payload.score,
        level: payload.level,
      },
    });
  },

  getTopScores: async () => {
    return prisma.score.findMany({
      take: 10,
      orderBy: [
        { score: 'desc' },
        { createdAt: 'asc' },
      ],
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
  },

  getScoreHistory: async (userId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const data = await prisma.score.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
    const total = await prisma.score.count({ where: { userId } });
    return { data, total };
  },

  getById: async (scoreId: number) => {
    return prisma.score.findUnique({ where: { id: scoreId } });
  },

  getAllForAdmin: async () => {
    return prisma.score.findMany({
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  },

  deleteById: async (scoreId: number) => {
    return prisma.score.delete({ where: { id: scoreId } });
  },
};
