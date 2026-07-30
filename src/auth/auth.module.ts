import { Module, Logger, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from '../shared/logger/logger.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

const logger = new Logger('AuthModule');
const providers: Provider[] = [
  AuthService,
  TokenService,
  PasswordService,
  JwtStrategy,
  LocalStrategy,
  EmailVerifiedGuard,
  GoogleOAuthGuard,
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { GoogleStrategy } = require('./strategies/google.strategy');
  providers.push(GoogleStrategy);
  logger.log('Google OAuth strategy enabled');
} else {
  logger.warn('Google OAuth disabled — missing GOOGLE_CLIENT_ID/SECRET');
}

if (process.env.APPLE_CLIENT_ID) {
  const { AppleStrategy } = require('./strategies/apple.strategy');
  providers.push(AppleStrategy);
  logger.log('Apple OAuth strategy enabled');
} else {
  logger.warn('Apple OAuth disabled — missing APPLE_CLIENT_ID');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    LoggerModule,
  ],
  providers,
  controllers: [AuthController],
  exports: [AuthService, TokenService, PasswordService, EmailVerifiedGuard, JwtModule],
})
export class AuthModule {}
