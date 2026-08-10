import { prisma } from '../config/database';

export const achievementService = {
  getAll: async () => {
    return prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
    });
  },

  getAllForAdmin: async () => {
    return prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        userAchievements: {
          select: {
            userId: true,
          },
        },
      },
    });
  },

  getByUserId: async (userId: number) => {
    return prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        userAchievements: {
          where: { userId },
          select: {
            unlockedAt: true,
          },
        },
      },
    });
  },
};
