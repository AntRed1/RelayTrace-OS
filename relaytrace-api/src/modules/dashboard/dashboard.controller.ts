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
@Roles('COMPANY_ADMIN', 'DISPATCHER')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen operacional',
    description:
      'KPIs del día: viajes, conductores activos y alertas pendientes.',
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
    return this.dashboardService.getSummary(req.user.companyId);
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Actividad reciente',
    description: 'Últimos viajes registrados con info del conductor.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de registros (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Lista de actividad reciente' })
  getActivity(@Request() req, @Query('limit') limit = 10) {
    return this.dashboardService.getActivity(req.user.companyId, +limit);
  }
}
