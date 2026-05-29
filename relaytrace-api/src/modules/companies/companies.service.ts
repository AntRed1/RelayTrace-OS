import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService, AuditActor } from '../audit/audit.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  RequestAccessDto,
  ProcessRequestDto,
} from './dto/companies.dtos';
import {
  ResourceNotFoundException,
  ConflictException,
} from '../../common/exceptions/custom.exceptions';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit:  AuditService,
  ) {}

  // ─── Company CRUD ──────────────────────────────────────────────────────────

  async create(dto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Company email already exists');

    return this.prisma.company.create({ data: dto });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new ResourceNotFoundException('Company', id);
    return company;
  }

  async findAll(status?: string) {
    const where = status ? { subscriptionStatus: status } : {};
    return this.prisma.company.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionStatus: true,
        createdAt: true,
        _count: { select: { users: true, trips: true } },
      },
      where,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async getCompanyContext(companyId: string) {
    return this.findOne(companyId);
  }

  // ─── Public request-access flow ───────────────────────────────────────────

  async requestAccess(dto: RequestAccessDto) {
    const existing = await this.prisma.companyRequest.findFirst({
      where: { email: dto.email, status: 'pending' },
    });
    if (existing) {
      throw new ConflictException(
        'A pending request for this email already exists',
      );
    }

    return this.prisma.companyRequest.create({ data: dto });
  }

  // ─── SUPER_ADMIN — manage requests ────────────────────────────────────────

  async findAllRequests(status?: string) {
    const where = status ? { status } : {};
    return this.prisma.companyRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequest(id: string) {
    const req = await this.prisma.companyRequest.findUnique({ where: { id } });
    if (!req) throw new ResourceNotFoundException('CompanyRequest', id);
    return req;
  }

  async processRequest(id: string, dto: ProcessRequestDto, actor?: AuditActor) {
    const request = await this.findRequest(id);

    const updated = await this.prisma.companyRequest.update({
      where: { id },
      data:  { status: dto.status },
    });

    if (actor) {
      const action = dto.status === 'rejected' ? 'reject_company' : 'approve_company';
      await this.audit.log({
        action,
        actor,
        metadata: { requestId: id, companyName: request.companyName, email: request.email },
      });
    }

    return updated;
  }

  /**
   * Aprueba la solicitud, crea la Company y el COMPANY_ADMIN user en un
   * solo paso atómico para mantener consistencia.
   */
  async approveAndOnboard(
    requestId:    string,
    adminEmail:   string,
    adminName:    string,
    passwordHash: string,
    plan?:        string,
    actor?:       AuditActor,
  ) {
    const request = await this.findRequest(requestId);

    if (request.status !== 'pending') {
      throw new ConflictException('Request has already been processed');
    }

    // Check existing company
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: request.email },
    });
    if (existingCompany) {
      throw new ConflictException('A company with this email already exists');
    }

    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'COMPANY_ADMIN' },
    });
    if (!adminRole) {
      throw new ResourceNotFoundException('Role', 'COMPANY_ADMIN');
    }

    // Atomic: company + admin user + mark request approved
    const [company] = await this.prisma.$transaction([
      this.prisma.company.create({
        data: {
          name: request.companyName,
          email: request.email,
          subscriptionStatus: 'active',
          plan: plan ?? 'starter',
        },
      }),
    ]);

    const adminUser = await this.prisma.user.create({
      data: {
        companyId: company.id,
        roleId: adminRole.id,
        name: adminName,
        email: adminEmail,
        passwordHash,
        status: 'active',
      },
      include: { role: true },
    });

    await this.prisma.companyRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    });

    if (actor) {
      await this.audit.log({
        action: 'approve_company',
        actor,
        metadata: {
          requestId,
          companyId:   company.id,
          companyName: company.name,
          adminEmail,
          plan:        plan ?? 'starter',
        },
      });
    }

    const { passwordHash: _ph, ...safeUser } = adminUser;
    return { company, adminUser: safeUser };
  }
}
