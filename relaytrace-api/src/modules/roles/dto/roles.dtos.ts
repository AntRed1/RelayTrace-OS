import { IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  permissions: string; // JSON string
}
