import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, RequestUser } from '../../../common/types/user.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') as string,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      companyId: payload.companyId,
      email: payload.email,
      role: payload.role,
      name: payload.email.split('@')[0],
    };
  }
}
