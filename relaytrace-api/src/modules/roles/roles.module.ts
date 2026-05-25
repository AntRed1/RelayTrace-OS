import { Module, OnModuleInit } from '@nestjs/common';
import { RolesService } from './roles.service';

@Module({
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.seedDefaultRoles();
  }
}
