import { prisma } from '../config/database';

interface AuditLogPayload {
  action: string;
  userId?: number | null;
  entity?: string | null;
  entityId?: number | null;
  ipAddress?: string | null;
}

export const auditLogService = {
  create: async (payload: AuditLogPayload) => {
    return prisma.auditLog.create({
      data: {
        action: payload.action,
        userId: payload.userId ?? null,
        entity: payload.entity ?? null,
        entityId: payload.entityId ?? null,
        ipAddress: payload.ipAddress ?? null,
      },
    });
  },

  getAll: async () => {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
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
};
