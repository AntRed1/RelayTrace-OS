import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';

import { BillingService } from './billing.service';
import { PreRegistrationCheckoutDto } from './dto/billing.dto';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // POST /billing/checkout  (PUBLIC — no JWT)
  // Creates a Stripe Checkout session for a company that does not yet exist.
  // Company data is embedded in session metadata and replayed via the webhook.
  // ──────────────────────────────────────────────────────────────────────────

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create self-service Stripe Checkout session (public)',
    description:
      'Called from the landing page. Does not require authentication — ' +
      'the company is created only after the webhook confirms payment.',
  })
  @ApiBody({ type: PreRegistrationCheckoutDto })
  @ApiResponse({
    status: 201,
    description: 'Returns the Stripe Checkout URL to redirect the user to.',
    schema: { example: { url: 'https://checkout.stripe.com/pay/cs_...' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or company email already exists.',
  })
  createCheckout(@Body() dto: PreRegistrationCheckoutDto) {
    return this.billingService.createPreRegistrationCheckout(dto);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GET /billing/session/:sessionId/status  (PUBLIC)
  // Used by the /onboarding/success page to display confirmation details.
  // ──────────────────────────────────────────────────────────────────────────

  @Get('session/:sessionId/status')
  @ApiOperation({
    summary: 'Get Stripe Checkout session status (public)',
    description:
      'Returns minimal session data (status, email, plan) so the success ' +
      'page can confirm payment without exposing sensitive Stripe data.',
  })
  @ApiParam({ name: 'sessionId', example: 'cs_test_a1b2c3...' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        status: 'complete',
        customerEmail: 'juan@transportes.com',
        companyName: 'Transportes del Norte LLC',
        plan: 'growth',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSessionStatus(@Param('sessionId') sessionId: string) {
    return this.billingService.getSessionStatus(sessionId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // POST /billing/webhook  (PUBLIC — Stripe HMAC signature verified internally)
  // ──────────────────────────────────────────────────────────────────────────

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook receiver',
    description:
      'Processes Stripe events. Authentication is handled via the ' +
      'stripe-signature HMAC header — do NOT add JWT guards here.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'HMAC signature sent by Stripe',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Event received and processed' })
  @ApiResponse({ status: 400, description: 'Invalid signature' })
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody as Buffer, signature);
  }
}
