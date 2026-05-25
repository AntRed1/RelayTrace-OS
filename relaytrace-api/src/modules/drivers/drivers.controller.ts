import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Drivers')
@ApiBearerAuth('JWT')
@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Get()
  @Roles('COMPANY_ADMIN', 'DISPATCHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Listar conductores',
    description: 'Retorna conductores de la empresa. SUPER_ADMIN ve todos.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada de conductores' })
  findByCompany(
    @CurrentUser('companyId') companyId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.driversService.findByCompany(companyId, page, limit);
  }

  @Get(':id/stats')
  @Roles('COMPANY_ADMIN', 'DISPATCHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Estadísticas de un conductor',
    description: 'Viajes por estado y total registrado.',
  })
  @ApiParam({ name: 'id', description: 'ID del conductor' })
  @ApiResponse({ status: 200, description: 'Estadísticas del conductor' })
  @ApiResponse({ status: 404, description: 'Conductor no encontrado' })
  getDriverStats(
    @Param('id') driverId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return this.driversService.getDriverStats(driverId, companyId);
  }
}
