import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
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
import { TripsService } from './trips.service';
import { CreateTripDto, UpdateTripDto, TripFilterDto } from './dto/trips.dtos';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Trips')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles('DRIVER')
  @ApiOperation({
    summary: 'Registrar viaje',
    description:
      'El conductor registra un Trip ID de Amazon Relay. Opcionalmente adjunta screenshot para OCR automático.',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({ status: 201, description: 'Viaje registrado' })
  @ApiResponse({
    status: 409,
    description: 'Trip ID ya registrado en esta empresa',
  })
  create(@Request() req, @Body() dto: CreateTripDto) {
    return this.tripsService.create(req.user.id, req.user.companyId, dto);
  }

  @Get('me')
  @Roles('DRIVER')
  @ApiOperation({
    summary: 'Mis viajes',
    description: 'El conductor ve únicamente sus propios viajes.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Viajes del conductor autenticado' })
  myTrips(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.tripsService.findByDriver(
      req.user.id,
      req.user.companyId,
      +page,
      +limit,
    );
  }

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DISPATCHER')
  @ApiOperation({
    summary: 'Listar todos los viajes',
    description:
      'SUPER_ADMIN ve todos (puede filtrar por companyId). COMPANY_ADMIN y DISPATCHER ven solo los de su empresa.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'confirmed', 'flagged'],
  })
  @ApiQuery({ name: 'driverId', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista paginada de viajes' })
  findAll(@Request() req, @Query() filters: TripFilterDto) {
    const { page = 1, limit = 20, ...rest } = filters;
    return this.tripsService.findAllTrips(req.user, rest, +page, +limit);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Obtener viaje por ID' })
  @ApiParam({ name: 'id', description: 'ID del viaje' })
  @ApiResponse({ status: 200, description: 'Detalle del viaje' })
  @ApiResponse({ status: 404, description: 'Viaje no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tripsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'DISPATCHER')
  @ApiOperation({ summary: 'Actualizar estado de viaje' })
  @ApiParam({ name: 'id', description: 'ID del viaje' })
  @ApiBody({ type: UpdateTripDto })
  @ApiResponse({ status: 200, description: 'Viaje actualizado' })
  update(@Param('id') id: string, @Request() req, @Body() dto: UpdateTripDto) {
    return this.tripsService.update(id, req.user, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
  @ApiOperation({
    summary: 'Eliminar viaje',
    description: 'Solo SUPER_ADMIN y COMPANY_ADMIN pueden eliminar.',
  })
  @ApiParam({ name: 'id', description: 'ID del viaje' })
  @ApiResponse({ status: 200, description: 'Viaje eliminado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tripsService.delete(id, req.user);
  }
}
