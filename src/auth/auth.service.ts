import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { CryptoUtil } from '../common/utils/crypto.util';
import { AppLoggerService } from '../shared/logger/logger.service';
import { AuthResponse, TokenSet } from './interfaces/auth-response.interface';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ message: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await this.passwordService.hash(signupDto.password);
    const verificationToken = CryptoUtil.generateSecureToken(32);

    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        passwordHash: hashedPassword,
        displayName: signupDto.displayName || signupDto.email.split('@')[0],
        authProvider: 'EMAIL',
        emailVerified: false,
      },
    });

    this.logger.log(`User created: ${user.id} (${user.email})`, 'AuthService');

    await this.prisma.$executeRaw`
      INSERT INTO "EmailVerificationToken" (id, email, token, "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${signupDto.email}, ${verificationToken}, NOW() + INTERVAL '24 hours', NOW())
    `;

    await this.sendVerificationEmail(signupDto.email, verificationToken);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, authProvider: true, emailVerified: true, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider !== 'EMAIL') {
      throw new UnauthorizedException(
        `This account uses ${user.authProvider} authentication`,
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.passwordService.verify(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { sub: user.id, email: user.email };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      this.logger.warn(`Login failed: user not found for ${loginDto.email}`, 'AuthService');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.authProvider !== 'EMAIL') {
      throw new UnauthorizedException(
        `This account uses ${user.authProvider} authentication`,
      );
    }

    if (!user.emailVerified) {
      this.logger.warn(`Login failed: email not verified for ${loginDto.email}`, 'AuthService');
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const tokens = await this.tokenService.issueTokens(user.id, user.email);
    this.logger.log(`Login successful: ${user.id} (${user.email})`, 'AuthService');
    return this.buildAuthResponse(user, tokens.accessToken);
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }
    return { message: 'Logged out successfully' };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const { userId, email } = await this.tokenService.verifyRefreshToken(refreshToken);
    const tokens = await this.tokenService.rotateRefreshToken(refreshToken, userId, email);
    return { accessToken: tokens.accessToken };
  }

  async revokeAllSessions(userId: string): Promise<{ message: string }> {
    await this.tokenService.revokeAllRefreshTokens(userId);
    return { message: 'All sessions revoked' };
  }

  async sendMagicLink(email: string): Promise<{ message: string }> {
    const magicToken = CryptoUtil.generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.$executeRaw`
      INSERT INTO "MagicLinkToken" (id, email, token, "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${email}, ${magicToken}, ${expiresAt}, NOW())
    `;

    await this.sendMagicLinkEmail(email, magicToken);

    return { message: 'Magic link sent to your email' };
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    const result = await this.prisma.$queryRaw<
      Array<{ email: string; expiresAt: Date }>
    >`
      SELECT email, "expiresAt" FROM "MagicLinkToken"
      WHERE token = ${token} AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC LIMIT 1
    `;

    if (!result.length) {
      throw new UnauthorizedException('Invalid or expired magic link token');
    }

    const email = result[0].email;
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          authProvider: 'EMAIL',
          emailVerified: true,
          displayName: email.split('@')[0],
        },
      });
    }

    const tokens = await this.tokenService.issueTokens(user.id, user.email);
    return this.buildAuthResponse(user, tokens.accessToken);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const result = await this.prisma.$queryRaw<
      Array<{ email: string }>
    >`
      SELECT email FROM "EmailVerificationToken"
      WHERE token = ${token} AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC LIMIT 1
    `;

    if (!result.length) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const email = result[0].email;

    await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    await this.prisma.$executeRaw`
      DELETE FROM "EmailVerificationToken" WHERE token = ${token}
    `;

    return { message: 'Email verified successfully' };
  }

  async sendVerificationEmail(email: string, token?: string): Promise<{ message: string }> {
    const verificationToken = token || CryptoUtil.generateSecureToken(32);

    if (!token) {
      await this.prisma.$executeRaw`
        INSERT INTO "EmailVerificationToken" (id, email, token, "expiresAt", "createdAt")
        VALUES (gen_random_uuid(), ${email}, ${verificationToken}, NOW() + INTERVAL '24 hours', NOW())
      `;
    }

    await this.sendVerificationEmailByEmail(email, verificationToken);

    return { message: 'Verification email sent' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const resetToken = CryptoUtil.generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.$executeRaw`
      INSERT INTO "PasswordResetToken" (id, email, token, "expiresAt", "createdAt")
      VALUES (gen_random_uuid(), ${email}, ${resetToken}, ${expiresAt}, NOW())
    `;

    await this.sendPasswordResetEmail(email, resetToken);

    return { message: 'Password reset email sent' };
  }

  async resetPassword(
    token: string,
    password: string,
  ): Promise<{ message: string }> {
    const result = await this.prisma.$queryRaw<
      Array<{ email: string }>
    >`
      SELECT email FROM "PasswordResetToken"
      WHERE token = ${token} AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC LIMIT 1
    `;

    if (!result.length) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const email = result[0].email;
    const hashedPassword = await this.passwordService.hash(password);

    await this.prisma.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.$executeRaw`
      DELETE FROM "PasswordResetToken" WHERE token = ${token}
    `;

    return { message: 'Password reset successfully' };
  }

  async googleLogin(): Promise<{ url: string }> {
    return { url: '/auth/google' };
  }

  async googleCallback(profile: any): Promise<AuthResponse> {
    const email = profile.emails[0].value;
    const displayName = profile.displayName;
    const avatarUrl = profile.photos?.[0]?.value;

    this.logger.log(`Google OAuth callback for: ${email}`, 'AuthService');

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName,
          avatarUrl,
          authProvider: 'GOOGLE',
          emailVerified: true,
        },
      });
    } else if (user.authProvider !== 'GOOGLE') {
      throw new ConflictException(
        `This email is already registered with ${user.authProvider}`,
      );
    }

    const tokens = await this.tokenService.issueTokens(user.id, user.email);
    return this.buildAuthResponse(user, tokens.accessToken);
  }

  async appleLogin(identityToken: string): Promise<AuthResponse> {
    const appleData = await this.verifyAppleToken(identityToken);

    const email = appleData.email;
    const displayName = appleData.name;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName,
          authProvider: 'APPLE',
          emailVerified: true,
        },
      });
    } else if (user.authProvider !== 'APPLE') {
      throw new ConflictException(
        `This email is already registered with ${user.authProvider}`,
      );
    }

    const tokens = await this.tokenService.issueTokens(user.id, user.email);
    return this.buildAuthResponse(user, tokens.accessToken);
  }

  private async verifyAppleToken(identityToken: string): Promise<{
    email: string;
    name?: string;
  }> {
    const jwt = require('jsonwebtoken');
    const axios = require('axios');

    try {
      // Decode header to get kid
      const headerB64 = identityToken.split('.')[0];
      const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

      // Fetch Apple's public keys
      const { data: appleKeys } = await axios.get('https://appleid.apple.com/auth/keys');

      // Find the matching key
      const matchingKey = appleKeys.keys.find((key: any) => key.kid === header.kid);
      if (!matchingKey) {
        throw new UnauthorizedException('Invalid Apple token: no matching key');
      }

      // Construct the public key
      const publicKey = require('crypto').createPublicKey({
        key: {
          kty: matchingKey.kty,
          alg: matchingKey.alg,
          use: 'sig',
          n: matchingKey.n,
          e: matchingKey.e,
        },
        format: 'jwk',
      });

      // Verify the token
      const payload: any = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.configService.get<string>('APPLE_CLIENT_ID'),
      });

      return {
        email: payload.email,
        name: payload.name,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Apple identity token');
    }
  }

  private async sendVerificationEmailByEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const verifyUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.sendEmail(email, 'Verify your email', `Click to verify: ${verifyUrl}`);
  }

  private async sendMagicLinkEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const magicUrl = `${this.configService.get<string>('FRONTEND_URL')}/magic-link?token=${token}`;
    await this.sendEmail(email, 'Your magic link', `Click to sign in: ${magicUrl}`);
  }

  private async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.sendEmail(email, 'Reset your password', `Click to reset: ${resetUrl}`);
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!resendApiKey) {
      this.logger.warn(`RESEND_API_KEY not set. Email not sent to ${to}. Subject: ${subject}`, 'AuthService');
      return;
    }

    try {
      const axios = require('axios');
      await axios.post(
        'https://api.resend.com/emails',
        {
          from: this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@momen.app',
          to: [to],
          subject,
          html,
        },
        {
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}: ${error.response?.data || error.message}`, undefined, 'AuthService');
    }
  }

  private buildAuthResponse(user: any, accessToken: string): AuthResponse {
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        authProvider: user.authProvider,
        timezone: user.timezone,
        themePreference: user.themePreference,
        subscriptionTier: user.subscriptionTier,
        energyHours: user.energyHours,
        notificationPrefs: user.notificationPrefs,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }
}
