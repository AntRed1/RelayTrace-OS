import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { PlanModule } from '../plan/plan.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuthModule, PlanModule, AuditModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
