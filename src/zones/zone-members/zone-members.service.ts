import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AddMemberDto } from "./dto/add-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { ZoneRole } from "@prisma/client";

@Injectable()
export class ZoneMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(zoneId: string, userId: string) {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        deletedAt: null,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });

    if (!zone) {
      throw new NotFoundException("Zone not found");
    }

    const members = await this.prisma.zoneMember.findMany({
      where: { zoneId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }));
  }

  async addMember(zoneId: string, userId: string, addMemberDto: AddMemberDto) {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!zone) {
      throw new NotFoundException(
        "Zone not found or you do not have permission to add members",
      );
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { email: addMemberDto.email },
    });

    if (!targetUser) {
      throw new NotFoundException("User not found");
    }

    const existingMember = await this.prisma.zoneMember.findUnique({
      where: {
        zoneId_userId: {
          zoneId,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException("User is already a member of this zone");
    }

    const member = await this.prisma.zoneMember.create({
      data: {
        zoneId,
        userId: targetUser.id,
        role: addMemberDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "ZONE_MEMBER_ADDED",
        targetType: "Zone",
        targetId: zoneId,
        metadata: {
          addedUserId: targetUser.id,
          role: addMemberDto.role,
        },
      },
    });

    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: member.user,
    };
  }

  async updateMember(
    zoneId: string,
    userId: string,
    targetUserId: string,
    updateMemberDto: UpdateMemberDto,
  ) {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!zone) {
      throw new NotFoundException(
        "Zone not found or you do not have permission to manage members",
      );
    }

    const member = await this.prisma.zoneMember.findUnique({
      where: {
        zoneId_userId: {
          zoneId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    const oldRole = member.role;

    const updatedMember = await this.prisma.zoneMember.update({
      where: {
        zoneId_userId: {
          zoneId,
          userId: targetUserId,
        },
      },
      data: updateMemberDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "ZONE_MEMBER_ROLE_CHANGED",
        targetType: "Zone",
        targetId: zoneId,
        metadata: {
          targetUserId,
          oldRole,
          newRole: updateMemberDto.role,
        },
      },
    });

    return {
      id: updatedMember.id,
      userId: updatedMember.userId,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
      user: updatedMember.user,
    };
  }

  async removeMember(zoneId: string, userId: string, targetUserId: string) {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!zone) {
      throw new NotFoundException(
        "Zone not found or you do not have permission to manage members",
      );
    }

    const member = await this.prisma.zoneMember.findUnique({
      where: {
        zoneId_userId: {
          zoneId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    await this.prisma.zoneMember.delete({
      where: {
        zoneId_userId: {
          zoneId,
          userId: targetUserId,
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "ZONE_MEMBER_REMOVED",
        targetType: "Zone",
        targetId: zoneId,
        metadata: {
          removedUserId: targetUserId,
        },
      },
    });

    return { message: "Member removed successfully" };
  }
}
