import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuditService }  from './audit.service';
import { JwtAuthGuard }  from '../../common/guards/jwt-auth.guard';
import { RolesGuard }    from '../../common/guards/roles.guard';
import { Roles }         from '../../common/decorators/roles.decorator';
import { CurrentUser }   from '../../common/decorators/current-user.decorator';
import { RequestUser }   from '../../common/types/user.types';

@ApiTags('Audit')
@ApiBearerAuth('JWT')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'COMPANY_ADMIN')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: 'Query audit logs',
    description:
      'SUPER_ADMIN sees all companies; can filter by ?companyId. ' +
      'COMPANY_ADMIN sees only their own company.',
  })
  @ApiQuery({ name: 'page',      required: false, type: Number })
  @ApiQuery({ name: 'limit',     required: false, type: Number })
  @ApiQuery({ name: 'action',    required: false, type: String })
  @ApiQuery({ name: 'userId',    required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'SUPER_ADMIN only' })
  @ApiQuery({ name: 'from',      required: false, type: String, description: 'ISO date' })
  @ApiQuery({ name: 'to',        required: false, type: String, description: 'ISO date' })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  findMany(
    @CurrentUser() actor: RequestUser,
    @Query('page',  new ParseIntPipe({ optional: true })) page  = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('action')    action?:    string,
    @Query('userId')    userId?:    string,
    @Query('companyId') companyId?: string,
    @Query('from')      from?:      string,
    @Query('to')        to?:        string,
  ) {
    // Multi-tenant isolation:
    // SUPER_ADMIN can query all companies or filter by optional ?companyId.
    // Any other role is scoped strictly to their own company.
    const scopedCompanyId =
      actor.role === 'SUPER_ADMIN'
        ? (companyId ?? null)        // null = all companies
        : actor.companyId;           // always own company

    return this.auditService.findMany({
      companyId: scopedCompanyId,
      userId,
      action,
      from: from ? new Date(from) : undefined,
      to:   to   ? new Date(to)   : undefined,
      page,
      limit,
    });
  }
}
