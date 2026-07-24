import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  private readonly logger = new Logger(AppleStrategy.name);
  private enabled = true;

  constructor(configService: ConfigService) {
    const clientID = configService.get<string>('APPLE_CLIENT_ID');
    if (!clientID) {
      super({ clientID: 'PLACEHOLDER', teamID: 'PLACEHOLDER', keyID: 'PLACEHOLDER', privateKey: 'PLACEHOLDER', callbackURL: '/', scope: [] });
      return;
    }
    super({
      clientID,
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      privateKey: configService.get<string>('APPLE_PRIVATE_KEY'),
      callbackURL: '/api/v1/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      email: profile.email,
      name: profile.name,
      provider: 'apple',
    };
    done(null, user);
  }
}
