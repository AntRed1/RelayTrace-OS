import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reconciliation')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COMPANY_ADMIN', 'DISPATCHER')
@Controller('reconciliation')
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar reconciliaciones',
    description:
      'Comparaciones entre emails de Amazon Relay y registros de conductores.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de reconciliaciones',
  })
  findAll(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.reconciliationService.findByCompany(
      req.user.companyId,
      +page,
      +limit,
    );
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Resumen de reconciliación',
    description: 'Total, coincidentes, no coincidentes y tasa de matching.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen',
    schema: {
      example: { total: 50, matched: 45, unmatched: 5, matchRate: 90 },
    },
  })
  getSummary(@Request() req) {
    return this.reconciliationService.getSummary(req.user.companyId);
  }
}
