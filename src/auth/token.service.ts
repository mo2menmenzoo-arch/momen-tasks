import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CryptoUtil } from "../common/utils/crypto.util";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { TokenSet } from "./interfaces/auth-response.interface";

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateAccessToken(
    userId: string,
    email: string,
    username?: string | null,
    role?: string,
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      username,
      role: role || "USER",
      type: "access",
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_CONFIG.accessSecret"),
      expiresIn: this.configService.get<string>("JWT_CONFIG.accessExpiresIn"),
    });
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const token = CryptoUtil.generateSecureToken(32);
    const tokenHash = CryptoUtil.hashToken(token);
    const familyId = CryptoUtil.generateSecureToken(16);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId,
        expiresAt,
      },
    });

    return token;
  }

  async issueTokens(userId: string): Promise<TokenSet> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) throw new UnauthorizedException("User not found");

    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.username,
      user.role,
    );
    const refreshToken = await this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  async rotateRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<TokenSet> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);

    const existingToken = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        userId,
      },
      orderBy: { issuedAt: "desc" },
    });

    if (!existingToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    if (existingToken.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existingToken.familyId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Refresh token reuse detected");
    }

    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) throw new UnauthorizedException("User not found");

    const newRefreshToken = await this.generateRefreshToken(userId);
    await this.prisma.refreshToken.update({
      where: { tokenHash: CryptoUtil.hashToken(newRefreshToken) },
      data: {
        replacedBy: existingToken.id,
        familyId: existingToken.familyId,
      },
    });

    const accessToken = this.generateAccessToken(
      user.id,
      user.email,
      user.username,
      user.role,
    );
    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  }

  async verifyRefreshToken(refreshToken: string): Promise<{
    userId: string;
    email: string;
  }> {
    const tokenHash = CryptoUtil.hashToken(refreshToken);
    const token = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });

    if (!token || token.expiresAt < new Date() || token.revokedAt) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    return { userId: token.userId, email: token.user.email };
  }
}
