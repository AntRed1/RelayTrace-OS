import { Module, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.seedDefaultRoles();
  }
}
