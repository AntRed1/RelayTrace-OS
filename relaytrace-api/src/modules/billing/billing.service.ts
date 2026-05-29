import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import Stripe from 'stripe';

import { PrismaService }  from '../../prisma/prisma.service';
import { CacheService }   from '../../common/cache/cache.service';
import { EmailService }   from '../notifications/email.service';
import { PlansService }   from '../plans/plans.service';
import { PreRegistrationCheckoutDto } from './dto/billing.dto';

// ─── Local types (avoid Stripe namespace resolution issues) ───────────────────

interface CheckoutMetadata {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  driverCount?: string;
  plan: string;
}

interface StripeSessionLike {
  id: string;
  status: string | null;
  customer: string | { id: string } | null;
  subscription: string | { id: string } | null;
  metadata: Record<string, string> | null;
  customer_details: { email?: string | null } | null;
}

interface StripeSubscriptionLike {
  id: string;
  status: string;
}

interface StripeEventLike {
  id: string;
  type: string;
  data: { object: unknown };
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class BillingService {
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly config:       ConfigService,
    private readonly prisma:       PrismaService,
    private readonly cache:        CacheService,
    private readonly emailService: EmailService,
    private readonly plansService: PlansService,
  ) {
    this.stripe = new Stripe(this.getEnv('STRIPE_SECRET_KEY'));
  }

  // =========================================================
  // Helpers
  // =========================================================

  private getEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
  }

  /**
   * Resolves the Stripe price ID for a plan slug from the DB.
   * Returns null for contact-sales plans (priceMonthly === 0) or when no
   * Stripe price has been provisioned yet.
   * Cached via PlansService — sub-millisecond on cache hit.
   */
  private async getPriceId(planSlug: string): Promise<string | null> {
    try {
      const plan = await this.plansService.findBySlug(planSlug);
      return plan.stripePriceId ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Generates a secure temporary password that meets common policy requirements:
   * at least one uppercase letter, one digit, one special character, 12 chars total.
   */
  private generateTempPassword(): string {
    const upper   = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lower   = 'abcdefghjkmnpqrstuvwxyz';
    const digits  = '23456789';
    const special = '!@#$%';
    const all     = upper + lower + digits + special;

    const randomChar = (charset: string) => {
      const bytes = crypto.randomBytes(1);
      return charset[bytes[0] % charset.length];
    };

    // Guarantee policy: 1 upper + 1 digit + 1 special + 9 random
    const mandatory =
      randomChar(upper) +
      randomChar(digits) +
      randomChar(special);

    const rest = Array.from({ length: 9 }, () => randomChar(all)).join('');

    // Shuffle the combined string
    const combined = (mandatory + rest).split('');
    for (let i = combined.length - 1; i > 0; i--) {
      const j = crypto.randomBytes(1)[0] % (i + 1);
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    return combined.join('');
  }

  // =========================================================
  // Public: Pre-registration checkout (no JWT required)
  // =========================================================

  /**
   * Creates a Stripe Checkout session for a company that does NOT yet exist in
   * the DB. All company data is stored in session.metadata and replayed on the
   * `checkout.session.completed` webhook event.
   */
  async createPreRegistrationCheckout(
    dto: PreRegistrationCheckoutDto,
  ): Promise<{ url: string }> {
    // Resolve plan definition from DB (cached) to get Stripe price ID
    const planDef = await this.plansService.findBySlug(dto.plan).catch(() => null);

    if (!planDef) {
      throw new BadRequestException(`Plan "${dto.plan}" does not exist.`);
    }

    if (planDef.priceMonthly === 0) {
      throw new BadRequestException(
        `Plan "${planDef.displayName}" requires custom pricing. Please contact sales@relaytrace.com`,
      );
    }

    const priceId = await this.getPriceId(dto.plan);
    if (!priceId) {
      throw new BadRequestException(
        `No Stripe price configured for plan "${dto.plan}". ` +
          'Create the plan via the admin panel to auto-provision a Stripe price.',
      );
    }

    // Check if a company with this email is already registered
    const existing = await this.prisma.company.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(
        'A company with this email address already exists. Please log in.',
      );
    }

    const metadata: Record<string, string> = {
      companyName: dto.companyName,
      contactName: dto.contactName,
      email: dto.email,
      plan: dto.plan,
    };
    if (dto.phone)       metadata.phone       = dto.phone;
    if (dto.driverCount) metadata.driverCount = String(dto.driverCount);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: dto.email,
      metadata,
      // Append session ID to the success URL so the success page can query status
      success_url: `${dto.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  dto.cancelUrl,
      // Prefill customer name
      billing_address_collection: 'auto',
      subscription_data: {
        metadata,
      },
    });

    this.logger.log(
      `Checkout session created: ${session.id} for ${dto.email} (${dto.plan})`,
    );

    return { url: session.url! };
  }

  // =========================================================
  // Public: Session status (for success page)
  // =========================================================

  async getSessionStatus(sessionId: string) {
    let session: StripeSessionLike;

    try {
      session = await this.stripe.checkout.sessions.retrieve(
        sessionId,
      ) as unknown as StripeSessionLike;
    } catch {
      throw new NotFoundException('Checkout session not found');
    }

    return {
      status:        session.status,                          // 'complete' | 'expired' | 'open'
      customerEmail: session.customer_details?.email ?? session.metadata?.email,
      companyName:   session.metadata?.companyName,
      plan:          session.metadata?.plan,
    };
  }

  // =========================================================
  // Webhook dispatcher
  // =========================================================

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.getEnv('STRIPE_WEBHOOK_SECRET');
    let event: StripeEventLike;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      ) as unknown as StripeEventLike;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${msg}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Webhook received: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as StripeSessionLike,
        );
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.created':
        await this.handleSubscriptionChange(
          event.data.object as StripeSubscriptionLike,
        );
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(
          event.data.object as StripeSubscriptionLike,
        );
        break;

      case 'invoice.paid':
        this.logger.log(`Invoice paid: ${event.id}`);
        break;

      case 'invoice.payment_failed':
        this.logger.warn(`Invoice payment failed: ${event.id}`);
        break;

      default:
        this.logger.log(`Unhandled event: ${event.type}`);
    }

    return { received: true };
  }

  // =========================================================
  // Webhook handlers (private)
  // =========================================================

  /**
   * On `checkout.session.completed`:
   *  1. Idempotency guard — skip if already processed
   *  2. Generate temp password, hash it
   *  3. Atomically create Company + COMPANY_ADMIN User + ProcessedWebhookEvent
   *  4. Send welcome, payment-confirmation, and admin-notification emails
   */
  private async handleCheckoutCompleted(
    session: StripeSessionLike,
  ): Promise<void> {
    // ── 1. Idempotency ──────────────────────────────────────────────────────
    const alreadyProcessed = await this.prisma.processedWebhookEvent.findUnique(
      { where: { stripeEventId: session.id } },
    );
    if (alreadyProcessed) {
      this.logger.warn(`Webhook already processed, skipping: ${session.id}`);
      return;
    }

    // ── 2. Extract metadata ─────────────────────────────────────────────────
    const meta = session.metadata as CheckoutMetadata | null;
    if (!meta?.companyName || !meta?.contactName || !meta?.email || !meta?.plan) {
      this.logger.error(
        `checkout.session.completed missing required metadata: ${session.id}`,
      );
      return;
    }

    const { companyName, contactName, email, plan } = meta;

    // ── 3. Resolve COMPANY_ADMIN role ───────────────────────────────────────
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'COMPANY_ADMIN' },
    });
    if (!adminRole) {
      this.logger.error('COMPANY_ADMIN role not found in DB — cannot create user');
      return;
    }

    // ── 4. Generate credentials ─────────────────────────────────────────────
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Resolve Stripe IDs (may be string or object)
    const stripeCustomerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id ?? null;

    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id ?? null;

    // ── 5. Atomic DB transaction ────────────────────────────────────────────
    let newCompany: { id: string; name: string; email: string; plan: string };
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name:                 companyName,
            email,
            plan:                 plan ?? 'starter',
            subscriptionStatus:   'active',
            stripeCustomerId:     stripeCustomerId,
            stripeSubscriptionId: stripeSubscriptionId,
          },
        });

        await tx.user.create({
          data: {
            companyId:    company.id,
            roleId:       adminRole.id,
            name:         contactName,
            email,
            passwordHash,
            status:       'active',
          },
        });

        await tx.processedWebhookEvent.create({
          data: { stripeEventId: session.id },
        });

        return { company };
      });

      newCompany = result.company;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`DB transaction failed for ${session.id}: ${msg}`);
      return;
    }

    this.logger.log(
      `Company created: ${newCompany.id} (${companyName}) — ${email} — ${plan}`,
    );

    // ── 6. Send emails (non-blocking) ───────────────────────────────────────
    // Resolve plan display info from DB (cached)
    const planDef = await this.plansService.findBySlug(plan).catch(() => null);
    const planLabel  = planDef?.displayName ?? plan;
    const planAmount = planDef && planDef.priceMonthly > 0
      ? `$${planDef.priceMonthly} / month`
      : 'Custom';

    await Promise.allSettled([
      this.emailService.sendWelcomeEmail({
        to:           email,
        name:         contactName,
        companyName,
        tempPassword,
        plan:         planLabel,
      }),

      this.emailService.sendPaymentConfirmationEmail({
        to:          email,
        name:        contactName,
        companyName,
        plan:        planLabel,
        amount:      planAmount,
      }),

      this.emailService.sendAdminNotificationEmail({
        companyName,
        adminEmail:  email,
        plan,
        contactName,
      }),
    ]);
  }

  private async handleSubscriptionChange(
    sub: StripeSubscriptionLike,
  ): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { stripeSubscriptionId: sub.id },
    });

    if (company) {
      await this.prisma.company.update({
        where: { id: company.id },
        data:  { subscriptionStatus: sub.status },
      });
      // Invalidate subscription-status cache so JwtAuthGuard picks up the new
      // status on the very next request (no stale 5-minute window).
      await this.cache.del(`company:sub:${company.id}`);
      this.logger.log(`Subscription ${sub.status} for company ${company.id}`);
    }
  }

  private async handleSubscriptionCanceled(
    sub: StripeSubscriptionLike,
  ): Promise<void> {
    const company = await this.prisma.company.findUnique({
      where: { stripeSubscriptionId: sub.id },
    });

    if (company) {
      await this.prisma.company.update({
        where: { id: company.id },
        data:  { subscriptionStatus: 'canceled' },
      });
      await this.cache.del(`company:sub:${company.id}`);
      this.logger.warn(`Subscription canceled for company ${company.id}`);
    }
  }
}
