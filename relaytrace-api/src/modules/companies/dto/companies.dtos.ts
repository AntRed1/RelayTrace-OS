import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Transportes Rápidos SRL' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contacto@transportes.com' })
  @IsEmail()
  email: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Transportes Rápidos SRL' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'nuevo@transportes.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
