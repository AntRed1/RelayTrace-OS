import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type NotificationChannel = 'dashboard' | 'email' | 'push' | 'sms';

export interface NotificationPayload {
  companyId: string;
  tripId?: string;
  alertType: 'missing_trip' | 'duplicate_trip' | 'suspicious_activity';
  message: string;
  channel?: NotificationChannel;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async notify(payload: NotificationPayload) {
    const channel = payload.channel ?? 'dashboard';

    switch (channel) {
      case 'dashboard':
        await this.createDashboardAlert(payload);
        break;
      case 'email':
        await this.sendEmail(payload);
        break;
      case 'push':
        await this.sendPush(payload);
        break;
      case 'sms':
        await this.sendSms(payload);
        break;
      default:
        this.logger.warn(`Unknown notification channel: ${channel}`);
    }
  }

  private async createDashboardAlert(payload: NotificationPayload) {
    if (!payload.tripId) {
      this.logger.warn(
        `Alert without tripId skipped for company ${payload.companyId}`,
      );
      return;
    }

    await this.prisma.alert.create({
      data: {
        companyId: payload.companyId,
        tripId: payload.tripId,
        alertType: payload.alertType,
        resolved: false,
      },
    });

    this.logger.log(
      `Dashboard alert created: ${payload.alertType} for company ${payload.companyId}`,
    );
  }

  private async sendEmail(payload: NotificationPayload) {
    // Integración futura: SendGrid / Azure Communication Services
    this.logger.log(
      `[EMAIL] ${payload.alertType} → company ${payload.companyId}`,
    );
  }

  private async sendPush(payload: NotificationPayload) {
    // Integración futura: Firebase Cloud Messaging
    this.logger.log(
      `[PUSH] ${payload.alertType} → company ${payload.companyId}`,
    );
  }

  private async sendSms(payload: NotificationPayload) {
    // Integración futura: Twilio / Azure Communication Services
    this.logger.log(
      `[SMS] ${payload.alertType} → company ${payload.companyId}`,
    );
  }
}
