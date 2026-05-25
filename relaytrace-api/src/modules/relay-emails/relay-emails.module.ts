import { Module } from '@nestjs/common';
import { RelayEmailsService } from './relay-emails.service';
import { RelayEmailsController } from './relay-emails.controller';

@Module({
  controllers: [RelayEmailsController],
  providers: [RelayEmailsService],
  exports: [RelayEmailsService],
})
export class RelayEmailsModule {}
