import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'driver@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Driver2026!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'cmpipbtzc0003psedu0ocn1v5',
    description: 'ID del rol',
  })
  @IsString()
  roleId: string;

  @ApiProperty({
    example: 'cmpiqcmom00000cedizpunvzi',
    description: 'ID de la empresa',
  })
  @IsString()
  companyId: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'NewPass2026!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'cmpipbtzc0003psedu0ocn1v5' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive';
}
