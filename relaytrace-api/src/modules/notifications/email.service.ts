import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// ─── Payload types ────────────────────────────────────────────────────────────

export interface WelcomeEmailPayload {
  to: string;
  name: string;
  companyName: string;
  tempPassword: string;
  plan: string;
  loginUrl?: string;
}

export interface PaymentConfirmationPayload {
  to: string;
  name: string;
  companyName: string;
  plan: string;
  amount: string;
}

export interface AdminNotificationPayload {
  companyName: string;
  adminEmail: string;
  plan: string;
  contactName: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  // =========================================================
  // Init
  // =========================================================

  private initTransporter() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !user || !pass) {
      this.logger.warn(
        'SMTP credentials not configured — emails will be logged only. ' +
          'Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to enable.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port ?? 587,
      secure: (port ?? 587) === 465,
      auth: { user, pass },
    });

    this.logger.log(`Email transporter initialized (${host}:${port ?? 587})`);
  }

  // =========================================================
  // Core send
  // =========================================================

  private async send(options: nodemailer.SendMailOptions): Promise<void> {
    const from =
      this.config.get<string>('SMTP_FROM') ??
      '"RelayTrace" <noreply@relaytrace.net>';

    if (!this.transporter) {
      this.logger.log(
        `[EMAIL DRY-RUN] To: ${options.to} | Subject: ${options.subject}`,
      );
      return;
    }

    try {
      await this.transporter.sendMail({ from, ...options });
      this.logger.log(`Email sent to ${options.to as string} — ${options.subject as string}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${options.to as string}: ${msg}`);
      // Don't throw — email failure should not break the main flow
    }
  }

  // =========================================================
  // Templates
  // =========================================================

  /** Welcome email with temporary credentials */
  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
    const loginUrl =
      payload.loginUrl ??
      this.config.get<string>('APP_URL') ??
      'https://app.relaytrace.net';

    const planLabel =
      payload.plan.charAt(0).toUpperCase() + payload.plan.slice(1);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 40px;text-align:center;">
          <h1 style="color:#22d3ee;font-size:22px;margin:0;letter-spacing:-0.5px;">RelayTrace</h1>
          <p style="color:#94a3b8;font-size:13px;margin:6px 0 0;">Your fleet, under control.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <h2 style="color:#0f172a;font-size:20px;margin:0 0 8px;">Welcome, ${payload.name}! 🎉</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
            Your account for <strong>${payload.companyName}</strong> has been activated on the
            <strong style="color:#2563eb;">${planLabel}</strong> plan. You can now log in and start
            onboarding your team.
          </p>

          <!-- Credentials box -->
          <div style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
            <p style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Your Login Credentials</p>
            <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Email:</strong> ${payload.to}</p>
            <p style="margin:4px 0;font-size:14px;color:#0f172a;"><strong>Temporary Password:</strong>
              <code style="background:#e2e8f0;padding:2px 8px;border-radius:6px;font-family:monospace;">${payload.tempPassword}</code>
            </p>
          </div>

          <p style="color:#ef4444;font-size:13px;font-weight:600;margin:0 0 24px;">
            ⚠️ Change your password immediately after your first login.
          </p>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${loginUrl}/auth/login" style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#2563eb);color:#fff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:12px;">
              Log In to RelayTrace →
            </a>
          </div>

          <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
            Questions? Reply to this email and we'll be happy to help.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#cbd5e1;font-size:11px;margin:0;">
            © ${new Date().getFullYear()} RelayTrace · Amazon Relay fleet management
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.send({
      to: payload.to,
      subject: `Welcome to RelayTrace — Your ${planLabel} account is ready`,
      html,
    });
  }

  /** Payment confirmation / invoice summary */
  async sendPaymentConfirmationEmail(
    payload: PaymentConfirmationPayload,
  ): Promise<void> {
    const planLabel =
      payload.plan.charAt(0).toUpperCase() + payload.plan.slice(1);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:32px 40px;text-align:center;">
          <h1 style="color:#22d3ee;font-size:22px;margin:0;">RelayTrace</h1>
          <p style="color:#94a3b8;font-size:13px;margin:6px 0 0;">Payment Confirmation</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <div style="text-align:center;margin-bottom:28px;">
            <div style="width:56px;height:56px;background:#f0fdf4;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <span style="font-size:28px;">✅</span>
            </div>
            <h2 style="color:#0f172a;font-size:20px;margin:0 0 6px;">Payment Successful</h2>
            <p style="color:#64748b;font-size:14px;margin:0;">Thank you, ${payload.name}!</p>
          </div>

          <!-- Invoice summary -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:13px;color:#64748b;padding:6px 0;">Company</td>
                <td style="font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${payload.companyName}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#64748b;padding:6px 0;">Plan</td>
                <td style="font-size:13px;color:#2563eb;font-weight:600;text-align:right;">${planLabel}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#64748b;padding:6px 0;">Amount</td>
                <td style="font-size:13px;color:#0f172a;font-weight:600;text-align:right;">${payload.amount}</td>
              </tr>
              <tr>
                <td style="font-size:13px;color:#64748b;padding:6px 0;">Billing</td>
                <td style="font-size:13px;color:#0f172a;font-weight:600;text-align:right;">Monthly subscription</td>
              </tr>
            </table>
          </div>

          <p style="color:#64748b;font-size:13px;line-height:1.6;text-align:center;margin:0;">
            Your subscription renews automatically each month. You can manage your plan
            from the <strong>Settings</strong> page in your RelayTrace portal.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="color:#cbd5e1;font-size:11px;margin:0;">
            © ${new Date().getFullYear()} RelayTrace · This is an automated confirmation. A detailed receipt is available in your Stripe portal.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.send({
      to: payload.to,
      subject: `Payment Confirmation — RelayTrace ${planLabel} plan`,
      html,
    });
  }

  /** Internal SUPER_ADMIN notification for new company sign-up */
  async sendAdminNotificationEmail(
    payload: AdminNotificationPayload,
  ): Promise<void> {
    const adminTo =
      this.config.get<string>('ADMIN_NOTIFICATION_EMAIL') ??
      this.config.get<string>('SMTP_USER');

    if (!adminTo) {
      this.logger.warn(
        'ADMIN_NOTIFICATION_EMAIL not configured — skipping admin notification.',
      );
      return;
    }

    const planLabel =
      payload.plan.charAt(0).toUpperCase() + payload.plan.slice(1);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;background:#fff;border-radius:12px;padding:28px 32px;border:1px solid #e2e8f0;">
    <h2 style="color:#0f172a;font-size:18px;margin:0 0 16px;">🏢 New Company Registered</h2>
    <table cellpadding="0" cellspacing="0">
      <tr><td style="color:#64748b;font-size:13px;padding:4px 12px 4px 0;width:120px;">Company</td>
          <td style="color:#0f172a;font-weight:600;font-size:13px;">${payload.companyName}</td></tr>
      <tr><td style="color:#64748b;font-size:13px;padding:4px 12px 4px 0;">Contact</td>
          <td style="color:#0f172a;font-weight:600;font-size:13px;">${payload.contactName}</td></tr>
      <tr><td style="color:#64748b;font-size:13px;padding:4px 12px 4px 0;">Email</td>
          <td style="color:#0f172a;font-weight:600;font-size:13px;">${payload.adminEmail}</td></tr>
      <tr><td style="color:#64748b;font-size:13px;padding:4px 12px 4px 0;">Plan</td>
          <td style="color:#2563eb;font-weight:600;font-size:13px;">${planLabel}</td></tr>
    </table>
    <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;">
      Sent automatically by RelayTrace at ${new Date().toISOString()}
    </p>
  </div>
</body>
</html>`;

    await this.send({
      to: adminTo,
      subject: `[RelayTrace] New company: ${payload.companyName} (${planLabel})`,
      html,
    });
  }
}
