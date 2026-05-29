/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable }    from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService }   from '../auth/auth.service';
import { PlanService }   from '../plan/plan.service';
import { AuditService, AuditActor } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/users.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';

@Injectable()
export class UsersService {
  constructor(
    private prisma:        PrismaService,
    private authService:   AuthService,
    private planService:   PlanService,
    private auditService:  AuditService,
  ) {}

  // ── Create ─────────────────────────────────────────────────────────────────

  async create(dto: CreateUserDto, actor?: AuditActor) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('User email already exists');

    // ── Plan enforcement ───────────────────────────────────────────────────
    const role = await this.prisma.role.findUnique({
      where:  { id: dto.roleId },
      select: { name: true },
    });

    if (role?.name === 'DRIVER')     await this.planService.assertDriverLimit(dto.companyId);
    if (role?.name === 'DISPATCHER') await this.planService.assertFeature(dto.companyId, 'dispatcher_role');
    // ──────────────────────────────────────────────────────────────────────

    const passwordHash = await this.authService.hashPassword(dto.password);
    const { password, ...rest } = dto;

    const user = await this.prisma.user.create({
      data: { ...rest, passwordHash },
      include: { role: true, company: true },
    });

    if (actor) {
      await this.auditService.log({
        action:   'create_user',
        actor,
        metadata: { targetUserId: user.id, email: user.email, role: role?.name },
      });
    }

    return user;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  async findById(id: string, companyId: string | null) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, company: true },
    });

    if (!user || (companyId && user.companyId !== companyId)) {
      throw new ResourceNotFoundException('User', id);
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findByCompany(
    companyId: string | null,
    page  = 1,
    limit = 20,
    role?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (role)      where.role = { name: role.toUpperCase() };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, status: true,
          companyId: true, roleId: true, createdAt: true,
          updatedAt: true, role: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { page, pageSize: limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Update (handles status changes → revoke / restore) ─────────────────────

  async update(
    id:       string,
    companyId: string | null,
    dto:      UpdateUserDto,
    actor?:   AuditActor,
  ) {
    const target = await this.findById(id, companyId);

    const updated = await this.prisma.user.update({
      where: { id },
      data:  dto,
      include: { role: true },
    });

    if (actor) {
      // Differentiate revoke / restore / generic update for richer traceability
      const action =
        dto.status === 'inactive' ? 'revoke_access'  :
        dto.status === 'active'   ? 'restore_access' :
                                    'update_user';

      await this.auditService.log({
        action,
        actor,
        metadata: { targetUserId: id, targetEmail: target.email, changes: dto },
      });
    }

    return updated;
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async delete(id: string, companyId: string | null, actor?: AuditActor) {
    const target = await this.findById(id, companyId);

    await this.prisma.user.delete({ where: { id } });

    if (actor) {
      await this.auditService.log({
        action:   'delete_user',
        actor,
        metadata: { targetUserId: id, targetEmail: target.email },
      });
    }
  }

  // ── Change password ────────────────────────────────────────────────────────

  async changePassword(
    targetId:           string,
    companyId:          string | null,
    actor:              AuditActor,
    dto:                ChangePasswordDto,
  ) {
    const target = await this.findById(targetId, companyId);

    const passwordHash = await this.authService.hashPassword(dto.newPassword);
    await this.prisma.user.update({ where: { id: targetId }, data: { passwordHash } });

    await this.auditService.log({
      action: 'change_password',
      actor,
      metadata: {
        targetUserId: targetId,
        targetEmail:  target.email,
        isSelfChange: actor.userId === targetId,
      },
    });

    return { message: 'Password updated successfully' };
  }
}
