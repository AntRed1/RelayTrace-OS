/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { PlanService } from '../plan/plan.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private planService: PlanService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('User email already exists');
    }

    // ── Plan enforcement ──────────────────────────────────────────────────
    // Look up the role name to decide which limits to check
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
      select: { name: true },
    });

    if (role?.name === 'DRIVER') {
      // Check driver slot limit for the target company
      await this.planService.assertDriverLimit(createUserDto.companyId);
    }

    if (role?.name === 'DISPATCHER') {
      // Dispatcher role is a Growth+ feature
      await this.planService.assertFeature(
        createUserDto.companyId,
        'dispatcher_role',
      );
    }
    // ─────────────────────────────────────────────────────────────────────

    const passwordHash = await this.authService.hashPassword(
      createUserDto.password,
    );
    const { password, ...rest } = createUserDto;

    return this.prisma.user.create({
      data: { ...rest, passwordHash },
      include: { role: true, company: true },
    });
  }

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
    page = 1,
    limit = 20,
    role?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (companyId) where.companyId = companyId;
    if (role) where.role = { name: role.toUpperCase() };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          companyId: true,
          roleId: true,
          createdAt: true,
          updatedAt: true,
          role: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, companyId: string | null, updateUserDto: UpdateUserDto) {
    await this.findById(id, companyId);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });
  }

  async delete(id: string, companyId: string | null) {
    await this.findById(id, companyId);
    return this.prisma.user.delete({ where: { id } });
  }
}
