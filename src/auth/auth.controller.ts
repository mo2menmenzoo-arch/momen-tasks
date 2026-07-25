import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AppLoggerService } from '../shared/logger/logger.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly logger: AppLoggerService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(loginDto.login, loginDto.password);
    const tokens = await this.tokenService.issueTokens(user.id);
    this.setTokens(res, tokens.accessToken, tokens.refreshToken);
    return { user: this.authService.sanitizeUser(user), accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const result = await this.authService.refresh(refreshToken);
    this.setTokens(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('magic-link')
  async sendMagicLink(@Body() magicLinkDto: MagicLinkDto) {
    return await this.authService.sendMagicLink(magicLinkDto.email);
  }

  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(@Body('token') token: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.verifyMagicLink(token);
    const tokens = await this.tokenService.issueTokens(
      result.user.id,
    );
    this.setTokens(res, result.accessToken, tokens.refreshToken);
    return result;
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('Google OAuth callback received', 'AuthController');
      const result = await this.authService.googleCallback(req.user);
      const tokens = await this.tokenService.issueTokens(
        result.user.id,
      );
      this.setTokens(res, result.accessToken, tokens.refreshToken);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      this.logger.log(`Google OAuth success, redirecting to ${frontendUrl}/auth/callback`, 'AuthController');
      return res.redirect(`${frontendUrl}/auth/callback?user=${encodeURIComponent(JSON.stringify(result.user))}`);
    } catch (error: any) {
      this.logger.error(`Google OAuth callback error: ${error.message}`, error.stack, 'AuthController');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errorMessage = encodeURIComponent(error.message || 'Google authentication failed');
      return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
    }
  }

  @Post('google')
  async googleLogin() {
    return { url: '/auth/google/callback' };
  }

  @Post('apple')
  async appleLogin(@Body('identityToken') identityToken: string, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.appleLogin(identityToken);
    const tokens = await this.tokenService.issueTokens(
      result.user.id,
    );
    this.setTokens(res, result.accessToken, tokens.refreshToken);
    return result;
  }

  @Post('verify-email')
  async sendVerificationEmail(@Body() verifyDto: VerifyEmailDto) {
    return await this.authService.sendVerificationEmail(verifyDto.token);
  }

  @Post('verify-email/confirm')
  async verifyEmail(@Body('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetDto.token, resetDto.password);
  }

  @Post('revoke-all')
  @UseGuards(JwtAuthGuard)
  async revokeAll(@Req() req: Request) {
    const user = req.user as { sub: string };
    return await this.authService.revokeAllSessions(user.sub);
  }

  private setTokens(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
