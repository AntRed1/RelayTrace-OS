/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@microsoft/microsoft-graph-client';
import { ConfidentialClientApplication } from '@azure/msal-node';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueProducerService } from '../queue/queue-producer.service';

@Injectable()
export class RelayEmailsService {
  private readonly logger = new Logger(RelayEmailsService.name);
  private readonly TRIP_ID_PATTERN = /\bT-\d{9,12}\b/i;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private queueProducer: QueueProducerService,
  ) {}

  private async getGraphClient(): Promise<Client> {
    const msalApp = new ConfidentialClientApplication({
      auth: {
        clientId: this.config.get<string>('AZURE_AD_CLIENT_ID') as string,
        clientSecret: this.config.get<string>(
          'AZURE_AD_CLIENT_SECRET',
        ) as string,
        authority: `https://login.microsoftonline.com/${this.config.get<string>('AZURE_AD_TENANT_ID')}`,
      },
    });

    const token = await msalApp.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!token) throw new Error('Failed to acquire Graph API token');

    return Client.init({
      authProvider: (done) => done(null, token.accessToken),
    });
  }

  async fetchAndParseEmails(companyId: string, mailboxEmail: string) {
    const client = await this.getGraphClient();

    const messages = await client
      .api(`/users/${mailboxEmail}/messages`)
      .filter(
        `isRead eq false and from/emailAddress/address eq 'no-reply@relay.amazon.com'`,
      )
      .select('id,subject,body,receivedDateTime,from')
      .top(50)
      .get();

    const results: Array<{ relayTripId: string; emailId: string }> = [];

    for (const message of messages.value) {
      const parsed = this.parseEmail(message);
      if (!parsed) continue;

      const log = await this.saveEmailLog(companyId, parsed, message);

      await this.queueProducer.enqueueReconciliation({
        relayEmailLogId: log.id,
        companyId,
        relayTripId: parsed.tripId,
      });

      await client
        .api(`/users/${mailboxEmail}/messages/${message.id}`)
        .patch({ isRead: true });

      results.push({ relayTripId: parsed.tripId, emailId: message.id });
    }

    this.logger.log(
      `Parsed ${results.length} relay emails for company ${companyId}`,
    );
    return results;
  }

  private parseEmail(message: any): { tripId: string; timestamp: Date } | null {
    const text = `${message.subject ?? ''} ${message.body?.content ?? ''}`;
    const match = text.match(this.TRIP_ID_PATTERN);
    if (!match) return null;
    return { tripId: match[0], timestamp: new Date(message.receivedDateTime) };
  }

  private async saveEmailLog(
    companyId: string,
    parsed: { tripId: string; timestamp: Date },
    raw: any,
  ) {
    return this.prisma.relayEmailLog.create({
      data: {
        companyId,
        relayTripId: parsed.tripId,
        emailTimestamp: parsed.timestamp,
        parsedData: JSON.stringify({
          subject: raw.subject,
          from: raw.from?.emailAddress?.address,
          receivedAt: raw.receivedDateTime,
        }),
        reconciliationStatus: 'pending',
      },
    });
  }

  async findByCompany(companyId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.relayEmailLog.findMany({
        where: { companyId },
        orderBy: { emailTimestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.relayEmailLog.count({ where: { companyId } }),
    ]);
    return {
      data: logs,
      meta: {
        page,
        pageSize: limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
