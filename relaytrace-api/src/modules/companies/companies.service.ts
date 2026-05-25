import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/companies.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existing) {
      throw new ConflictException('Company email already exists');
    }

    return this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new ResourceNotFoundException('Company', id);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async getCompanyContext(companyId: string) {
    return this.findOne(companyId);
  }
}
