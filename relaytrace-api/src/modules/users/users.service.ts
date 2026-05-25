/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
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
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('User email already exists');
    }

    const passwordHash = await this.authService.hashPassword(
      createUserDto.password,
    );
    const { password, ...rest } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
      include: { role: true, company: true },
    });
  }

  async findById(id: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true, company: true },
    });

    if (!user || user.companyId !== companyId) {
      throw new ResourceNotFoundException('User', id);
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { companyId },
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
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { companyId } }),
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

  async update(id: string, companyId: string, updateUserDto: UpdateUserDto) {
    await this.findById(id, companyId);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: { role: true },
    });
  }

  async delete(id: string, companyId: string) {
    await this.findById(id, companyId);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
