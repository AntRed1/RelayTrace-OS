import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create_trip'
  | 'update_trip'
  | 'delete_trip'
  | 'create_user'
  | 'update_user';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    action: AuditAction;
    userId: string;
    companyId: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: params.action,
          userId: params.userId,
          companyId: params.companyId,
          metadata: params.metadata ? JSON.stringify(params.metadata) : '{}',
        },
      });
    } catch (err) {
      this.logger.error(`Audit log failed: ${err.message}`, err.stack);
    }
  }
}
