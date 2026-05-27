import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async seedDefaultRoles() {
    const existingRoles = await this.prisma.role.findMany();
    if (existingRoles.length > 0) return;

    const defaultRoles = [
      {
        name: 'SUPER_ADMIN',
        permissions: JSON.stringify([
          'manage:all',
          'manage:companies',
          'manage:users',
          'manage:roles',
          'read:audit',
        ]),
      },
      {
        name: 'COMPANY_ADMIN',
        permissions: JSON.stringify([
          'manage:users',
          'manage:drivers',
          'read:trips',
          'read:audit',
          'manage:settings',
        ]),
      },
      {
        name: 'DISPATCHER',
        permissions: JSON.stringify([
          'read:trips',
          'read:drivers',
          'write:alerts',
        ]),
      },
      {
        name: 'DRIVER',
        permissions: JSON.stringify(['write:trips', 'read:trips:own']),
      },
    ];

    for (const role of defaultRoles) {
      await this.prisma.role.create({ data: role });
    }
  }
}
