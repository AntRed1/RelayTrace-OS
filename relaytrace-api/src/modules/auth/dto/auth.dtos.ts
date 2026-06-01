import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@relaytrace.net' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin2026!', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'cmpiqcmq400010cedc1wt7hgm' })
  id: string;

  @ApiProperty({ example: 'admin@relaytrace.net' })
  email: string;

  @ApiProperty({ example: 'Super Admin' })
  name: string;

  @ApiProperty({ example: 'SUPER_ADMIN' })
  role: string;

  @ApiProperty({ example: 'cmpiqcmom00000cedizpunvzi' })
  companyId: string;

  @ApiProperty({ example: 'eyJhbGci...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGci...' })
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;
}
