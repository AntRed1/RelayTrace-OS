import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COMPANY_ADMIN', 'DISPATCHER', 'SUPER_ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen operacional',
    description:
      'KPIs del día: viajes, conductores activos y alertas pendientes. SUPER_ADMIN ve métricas globales.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del dashboard',
    schema: {
      example: {
        tripsToday: 12,
        activeDrivers: 5,
        totalTrips: 120,
        pendingAlerts: 2,
      },
    },
  })
  getSummary(@Request() req) {
    // SUPER_ADMIN → companyId=null (métricas globales)
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.dashboardService.getSummary(companyId);
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Actividad reciente',
    description:
      'Últimos viajes registrados con info del conductor y empresa. SUPER_ADMIN ve todos.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Lista de actividad reciente' })
  getActivity(@Request() req, @Query('limit') limit = 10) {
    const companyId =
      req.user.role === 'SUPER_ADMIN' ? null : req.user.companyId;
    return this.dashboardService.getActivity(companyId, +limit);
  }
}
