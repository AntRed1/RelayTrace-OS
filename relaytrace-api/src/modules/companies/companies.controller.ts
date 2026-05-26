import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  RequestAccessDto,
  ProcessRequestDto,
  OnboardCompanyDto,
} from './dto/companies.dtos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from '../auth/auth.service';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly authService: AuthService,
  ) {}

  // ─── Public endpoints (no auth) ───────────────────────────────────────────

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Solicitar acceso (landing page)',
    description:
      'Endpoint público. La empresa llena el formulario de la landing page y queda en estado "pending" hasta que SUPER_ADMIN la onboarde.',
  })
  @ApiBody({ type: RequestAccessDto })
  @ApiResponse({ status: 201, description: 'Solicitud recibida' })
  @ApiResponse({ status: 409, description: 'Solicitud duplicada' })
  requestAccess(@Body() dto: RequestAccessDto) {
    return this.companiesService.requestAccess(dto);
  }

  // ─── Authenticated endpoints ───────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear empresa directamente' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar todas las empresas (SUPER_ADMIN)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de empresas con conteos' })
  findAll(@Query('status') status?: string) {
    return this.companiesService.findAll(status);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener empresa del usuario autenticado' })
  getMyCompany(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.getCompanyContext(companyId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar empresa del usuario autenticado' })
  @ApiBody({ type: UpdateCompanyDto })
  updateMyCompany(
    @CurrentUser('companyId') companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(companyId, dto);
  }

  // ─── SUPER_ADMIN — onboarding requests ────────────────────────────────────

  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Listar solicitudes de acceso (SUPER_ADMIN)' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'approved', 'rejected'],
  })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes' })
  findAllRequests(@Query('status') status?: string) {
    return this.companiesService.findAllRequests(status);
  }

  @Get('requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener solicitud por ID (SUPER_ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  findRequest(@Param('id') id: string) {
    return this.companiesService.findRequest(id);
  }

  @Patch('requests/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Aprobar o rechazar solicitud (sin onboarding)' })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  @ApiBody({ type: ProcessRequestDto })
  processRequest(@Param('id') id: string, @Body() dto: ProcessRequestDto) {
    return this.companiesService.processRequest(id, dto);
  }

  @Post('requests/:id/onboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Aprobar + crear empresa + crear COMPANY_ADMIN (SUPER_ADMIN)',
    description:
      'Flujo completo de onboarding: aprueba la solicitud, crea la Company y el primer usuario administrador.',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud' })
  @ApiBody({ type: OnboardCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa y admin creados' })
  async onboard(
    @Param('id') requestId: string,
    @Body() dto: OnboardCompanyDto,
  ) {
    const passwordHash = await this.authService.hashPassword(
      dto.temporaryPassword,
    );
    return this.companiesService.approveAndOnboard(
      requestId,
      dto.adminEmail,
      dto.adminName,
      passwordHash,
    );
  }
}
