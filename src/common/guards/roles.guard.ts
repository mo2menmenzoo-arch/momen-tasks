import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ZoneRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ZoneRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.zoneRole) {
      throw new ForbiddenException(
        `Requires role: ${requiredRoles.join(", ")}`,
      );
    }

    if (!requiredRoles.includes(user.zoneRole)) {
      throw new ForbiddenException(
        `Requires one of: ${requiredRoles.join(", ")}. You have: ${user.zoneRole}`,
      );
    }

    return true;
  }
}
