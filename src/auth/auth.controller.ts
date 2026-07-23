import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);
    const tokens = await this.tokenService.issueTokens(
      result.user.id,
      result.user.email,
    );
    this.setTokens(res, result.accessToken, tokens.refreshToken);
    return res.json(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    const result = await this.authService.refresh(refreshToken);
    this.setTokens(res, result.accessToken, refreshToken);
    return res.json(result);
  }

  @Post('magic-link')
  async sendMagicLink(@Body() magicLinkDto: MagicLinkDto) {
    return await this.authService.sendMagicLink(magicLinkDto.email);
  }

  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(@Body('token') token: string, @Res() res: Response) {
    const result = await this.authService.verifyMagicLink(token);
    const tokens = await this.tokenService.issueTokens(
      result.user.id,
      result.user.email,
    );
    this.setTokens(res, result.accessToken, tokens.refreshToken);
    return res.json(result);
  }

  @Post('google')
  async googleLogin() {
    return { url: '/auth/google/callback' };
  }

  @Post('apple')
  async appleLogin(@Body('identityToken') identityToken: string, @Res() res: Response) {
    const result = await this.authService.appleLogin(identityToken);
    const tokens = await this.tokenService.issueTokens(
      result.user.id,
      result.user.email,
    );
    this.setTokens(res, result.accessToken, tokens.refreshToken);
    return res.json(result);
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
