import { prisma } from '../config/database';

export const userService = {
  getById: async (id: number) => {
    return prisma.user.findUnique({ where: { id } });
  },

  getAll: async () => {
    return prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  },

  update: async (id: number, data: { isActive?: boolean; role?: string }) => {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};
