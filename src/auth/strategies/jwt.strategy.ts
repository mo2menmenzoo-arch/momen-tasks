import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_CONFIG.accessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      username: payload.username ?? null,
      role: payload.role,
      type: payload.type,
    };
  }
}
