import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RelayEmailsService } from './relay-emails.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Relay Emails')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COMPANY_ADMIN')
@Controller('relay-emails')
export class RelayEmailsController {
  constructor(private readonly relayEmailsService: RelayEmailsService) {}

  @Post('fetch')
  @ApiOperation({
    summary: 'Parsear emails de Amazon Relay',
    description:
      'Conecta al buzón vía Microsoft Graph API, extrae Trip IDs y encola reconciliaciones.',
  })
  @ApiQuery({
    name: 'mailbox',
    required: true,
    description: 'Email del buzón a monitorear',
  })
  @ApiResponse({
    status: 201,
    description: 'Emails procesados y reconciliaciones encoladas',
  })
  fetchEmails(@Request() req, @Query('mailbox') mailbox: string) {
    return this.relayEmailsService.fetchAndParseEmails(
      req.user.companyId,
      mailbox,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar logs de emails parseados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista paginada de email logs' })
  findAll(@Request() req, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.relayEmailsService.findByCompany(
      req.user.companyId,
      +page,
      +limit,
    );
  }
}
