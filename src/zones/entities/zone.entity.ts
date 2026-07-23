import { Zone } from '@prisma/client';

export class ZoneEntity {
  id: string;
  ownerId: string;
  name: string;
  icon: string | null;
  color: string | null;
  isShared: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  static fromZone(zone: Zone): ZoneEntity {
    return {
      id: zone.id,
      ownerId: zone.ownerId,
      name: zone.name,
      icon: zone.icon,
      color: zone.color,
      isShared: zone.isShared,
      sortOrder: zone.sortOrder,
      createdAt: zone.createdAt,
      updatedAt: zone.updatedAt,
    };
  }
}
