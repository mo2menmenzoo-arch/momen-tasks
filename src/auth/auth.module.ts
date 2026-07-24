import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LoggerModule } from '../shared/logger/logger.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    LoggerModule,
  ],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    JwtStrategy,
    GoogleStrategy,
    AppleStrategy,
    LocalStrategy,
    EmailVerifiedGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, TokenService, PasswordService, EmailVerifiedGuard],
})
export class AuthModule {}
