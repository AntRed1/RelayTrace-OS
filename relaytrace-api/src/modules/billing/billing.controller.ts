import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('create-checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COMPANY_ADMIN')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Crear sesión de checkout Stripe',
    description: 'Genera una URL de pago para suscribir la empresa a un plan.',
  })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiResponse({
    status: 201,
    description: 'URL de checkout generada',
    schema: { example: { url: 'https://checkout.stripe.com/...' } },
  })
  @ApiResponse({ status: 403, description: 'Solo COMPANY_ADMIN puede acceder' })
  createCheckout(@Request() req, @Body() dto: CreateCheckoutDto) {
    return this.billingService.createCheckoutSession(
      req.user.companyId,
      dto.priceId,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook de Stripe',
    description:
      'Endpoint exclusivo para eventos de Stripe. No requiere autenticación JWT — usa firma HMAC del header stripe-signature.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Firma HMAC enviada por Stripe',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Evento procesado' })
  @ApiResponse({ status: 400, description: 'Firma inválida' })
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody as Buffer, signature);
  }
}
