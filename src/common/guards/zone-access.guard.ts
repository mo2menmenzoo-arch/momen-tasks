import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ZoneRole } from '@prisma/client';

@Injectable()
export class ZoneAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ZoneRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const zoneId = request.params.zoneId || request.params.id;

    if (!zoneId) {
      return true;
    }

    const zone = await this.prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        members: {
          where: { userId: user.sub },
        },
      },
    });

    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    if (zone.ownerId === user.sub) {
      return true;
    }

    const membership = zone.members[0];
    if (!membership) {
      throw new ForbiddenException('You do not have access to this zone');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `Requires one of: ${requiredRoles.join(', ')}. You have: ${membership.role}`,
      );
    }

    return true;
  }
}
