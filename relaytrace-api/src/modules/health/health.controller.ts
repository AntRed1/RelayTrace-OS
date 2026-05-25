import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Estado de la API',
    description: 'Verifica que la API esté operativa.',
  })
  @ApiResponse({
    status: 200,
    description: 'API operativa',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-05-23T00:00:00.000Z',
        uptime: 120,
        environment: 'development',
      },
    },
  })
  async check() {
    return this.healthService.check();
  }

  @Get('db')
  @ApiOperation({
    summary: 'Estado de la base de datos',
    description: 'Verifica conectividad con MySQL.',
  })
  @ApiResponse({
    status: 200,
    description: 'Base de datos conectada',
    schema: {
      example: {
        status: 'connected',
        database: 'MySQL',
        timestamp: '2026-05-23T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Base de datos no disponible' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
