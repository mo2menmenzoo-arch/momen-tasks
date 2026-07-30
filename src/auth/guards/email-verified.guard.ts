import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      return true;
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { emailVerified: true },
    });

    if (!dbUser?.emailVerified) {
      throw new ForbiddenException(
        "Email verification required. Please verify your email to access this resource.",
      );
    }

    return true;
  }
}
