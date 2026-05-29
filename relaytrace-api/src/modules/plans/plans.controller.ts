import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PlansService }  from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../../common/guards/roles.guard';
import { Roles }         from '../../common/decorators/roles.decorator';
import { CurrentUser }   from '../../common/decorators/current-user.decorator';
import { RequestUser }   from '../../common/types/user.types';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'List active plans (public)',
    description: 'Returns active plans ordered by sortOrder. Response is cached in Redis for 5 min.',
  })
  @ApiResponse({ status: 200, description: 'Active plans list' })
  findAllPublic() {
    return this.plansService.findAllPublic();
  }

  // ── SUPER_ADMIN ───────────────────────────────────────────────────────────

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List ALL plans including inactive (SUPER_ADMIN)' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get single plan by ID (SUPER_ADMIN)' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  findOne(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Create a new plan (SUPER_ADMIN)',
    description: 'Automatically provisions a Stripe Product + Price if STRIPE_SECRET_KEY is configured.',
  })
  @ApiResponse({ status: 201, description: 'Plan created' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  create(@Body() dto: CreatePlanDto, @CurrentUser() actor: RequestUser) {
    return this.plansService.create(dto, { userId: actor.id, companyId: actor.companyId });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update a plan (SUPER_ADMIN)',
    description: 'If priceMonthly changes, a new Stripe Price is created and the old one archived.',
  })
  @ApiResponse({ status: 200, description: 'Plan updated' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto, @CurrentUser() actor: RequestUser) {
    return this.plansService.update(id, dto, { userId: actor.id, companyId: actor.companyId });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Deactivate a plan (SUPER_ADMIN)',
    description: 'Soft-delete: sets isActive=false. Companies already on this plan are unaffected.',
  })
  @ApiResponse({ status: 204, description: 'Plan deactivated' })
  remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    return this.plansService.remove(id, { userId: actor.id, companyId: actor.companyId });
  }
}
