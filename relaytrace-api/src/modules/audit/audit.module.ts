import { Global, Module } from '@nestjs/common';
import { AuditService }    from './audit.service';
import { AuditController } from './audit.controller';

/**
 * @Global() — AuditService is available in every module without explicit imports.
 * Any module that needs to call auditService.log() just injects AuditService
 * in its provider constructor; no need to add AuditModule to imports[].
 */
@Global()
@Module({
  controllers: [AuditController],
  providers:   [AuditService],
  exports:     [AuditService],
})
export class AuditModule {}
