import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Roles')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available roles (authenticated users only)' })
  @ApiResponse({
    status: 200,
    description: 'List of roles with id and name',
    schema: { example: [{ id: 'cuid...', name: 'DRIVER' }] },
  })
  findAll() {
    return this.rolesService.findAll();
  }
}
