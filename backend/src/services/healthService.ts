import { HealthResponse } from '../types/app';
import { prisma } from '../config/database';

export const healthService = {
  getHealth: (): HealthResponse => ({
    status: 'ok',
    service: 'snake-cloud-api',
    uptime: process.uptime(),
  }),

  getDatabaseHealth: async (): Promise<{ status: string; database: string }> => {
    await prisma.$executeRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  },
};
