/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, AuthResponseDto } from './dto/auth.dtos';
import { JwtPayload } from '../../common/types/user.types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { role: true, company: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'active')
      throw new UnauthorizedException('User account is inactive');

    const payload: JwtPayload = {
      sub: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role.name as any,
    };

    const expiresIn = 3600; // 1 hora en segundos
    const refreshSecret = this.configService.get<string>(
      'jwt.refreshSecret',
    ) as string;

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: 604800, // 7 días
      secret: refreshSecret,
    });

    await this.auditService.log({
      action: 'login',
      userId: user.id,
      companyId: user.companyId,
      metadata: { email: user.email, role: user.role.name },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      companyId: user.companyId,
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret') as string,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || user.status !== 'active')
        throw new UnauthorizedException('User not found or inactive');

      const newPayload: JwtPayload = {
        sub: user.id,
        companyId: user.companyId,
        email: user.email,
        role: user.role.name as any,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
