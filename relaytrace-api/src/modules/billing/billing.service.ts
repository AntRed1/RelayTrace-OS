/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillingService {
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.getEnv('STRIPE_SECRET_KEY'));
  }

  // =========================================================
  // Helpers
  // =========================================================

  private getEnv(key: string): string {
    const value = this.config.get<string>(key);

    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
  }

  // =========================================================
  // Checkout Session
  // =========================================================

  async createCheckoutSession(
    companyId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!priceId) {
      throw new BadRequestException('Price ID is required');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        companyId,
      },

      customer_email: company.email,

      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      url: session.url,
    };
  }

  // =========================================================
  // Stripe Webhook
  // =========================================================

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.getEnv('STRIPE_WEBHOOK_SECRET');

    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      this.logger.error(`Webhook signature verification failed: ${message}`);

      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      // =====================================================
      // Subscription Created / Updated
      // =====================================================

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as {
          metadata?: {
            companyId?: string;
          };
          status: string;
        };

        const companyId = sub.metadata?.companyId;

        if (companyId) {
          await this.prisma.company.update({
            where: {
              id: companyId,
            },
            data: {
              subscriptionStatus: sub.status,
            },
          });

          this.logger.log(`Subscription updated for company ${companyId}`);
        }

        break;
      }

      // =====================================================
      // Subscription Deleted
      // =====================================================

      case 'customer.subscription.deleted': {
        const sub = event.data.object as {
          metadata?: {
            companyId?: string;
          };
        };

        const companyId = sub.metadata?.companyId;

        if (companyId) {
          await this.prisma.company.update({
            where: {
              id: companyId,
            },
            data: {
              subscriptionStatus: 'canceled',
            },
          });

          this.logger.warn(`Subscription canceled for company ${companyId}`);
        }

        break;
      }

      // =====================================================
      // Checkout Completed
      // =====================================================

      case 'checkout.session.completed': {
        this.logger.log('Checkout session completed');

        break;
      }

      // =====================================================
      // Invoice Paid
      // =====================================================

      case 'invoice.paid': {
        this.logger.log('Invoice paid');

        break;
      }

      // =====================================================
      // Invoice Failed
      // =====================================================

      case 'invoice.payment_failed': {
        this.logger.warn('Invoice payment failed');

        break;
      }

      // =====================================================
      // Default
      // =====================================================

      default:
        this.logger.log(`Unhandled event: ${event.type}`);
    }

    return {
      received: true,
    };
  }
}
