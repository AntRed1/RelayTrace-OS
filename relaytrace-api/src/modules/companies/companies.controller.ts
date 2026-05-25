import { Controller, Post, Body, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/companies.dtos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Crear empresa',
    description: 'Registra una nueva empresa en el SaaS.',
  })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Empresa creada' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Obtener empresa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos de la empresa' })
  getMyCompany(@CurrentUser('companyId') companyId: string) {
    return this.companiesService.getCompanyContext(companyId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Actualizar empresa del usuario autenticado' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Empresa actualizada' })
  updateMyCompany(
    @CurrentUser('companyId') companyId: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(companyId, updateCompanyDto);
  }
}
