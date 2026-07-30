import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RlsContextGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      throw new UnauthorizedException("No authenticated user found");
    }

    await this.prisma.setRlsContext(user.sub);
    return true;
  }
}
