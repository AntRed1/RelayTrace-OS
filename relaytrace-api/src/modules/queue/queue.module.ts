import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueProducerService } from './queue-producer.service';
import {
  QUEUE_OCR,
  QUEUE_EMAIL,
  QUEUE_RECONCILE,
  QUEUE_ALERT,
} from './queue.types';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_OCR },
      { name: QUEUE_EMAIL },
      { name: QUEUE_RECONCILE },
      { name: QUEUE_ALERT },
    ),
  ],
  providers: [QueueProducerService],
  exports: [BullModule, QueueProducerService],
})
export class QueueModule {}
