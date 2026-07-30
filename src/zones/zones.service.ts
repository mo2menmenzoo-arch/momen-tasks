import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateZoneDto } from "./dto/create-zone.dto";
import { UpdateZoneDto } from "./dto/update-zone.dto";
import { ZoneQueryDto } from "./dto/zone-query.dto";
import { ZoneEntity } from "./entities/zone.entity";

@Injectable()
export class ZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: ZoneQueryDto): Promise<ZoneEntity[]> {
    const zones = await this.prisma.zone.findMany({
      where: {
        OR: [
          { ownerId: userId },
          ...(query.includeShared
            ? [
                {
                  members: {
                    some: { userId },
                  },
                },
              ]
            : []),
        ],
        deletedAt: null,
      },
      orderBy: { sortOrder: "asc" },
    });

    return zones.map(ZoneEntity.fromZone);
  }

  async findOne(userId: string, zoneId: string): Promise<ZoneEntity> {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!zone) {
      throw new NotFoundException("Zone not found");
    }

    return ZoneEntity.fromZone(zone);
  }

  async create(
    userId: string,
    createZoneDto: CreateZoneDto,
  ): Promise<ZoneEntity> {
    const zone = await this.prisma.zone.create({
      data: {
        ...createZoneDto,
        ownerId: userId,
      },
    });

    return ZoneEntity.fromZone(zone);
  }

  async update(
    userId: string,
    zoneId: string,
    updateZoneDto: UpdateZoneDto,
  ): Promise<ZoneEntity> {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!zone) {
      throw new NotFoundException(
        "Zone not found or you do not have permission to edit it",
      );
    }

    const updatedZone = await this.prisma.zone.update({
      where: { id: zoneId },
      data: updateZoneDto,
    });

    return ZoneEntity.fromZone(updatedZone);
  }

  async remove(userId: string, zoneId: string): Promise<{ message: string }> {
    const zone = await this.prisma.zone.findFirst({
      where: {
        id: zoneId,
        ownerId: userId,
        deletedAt: null,
      },
    });

    if (!zone) {
      throw new NotFoundException(
        "Zone not found or you do not have permission to delete it",
      );
    }

    await this.prisma.zone.update({
      where: { id: zoneId },
      data: { deletedAt: new Date() },
    });

    return {
      message: "Zone deleted. It will be permanently removed within 30 days.",
    };
  }
}
