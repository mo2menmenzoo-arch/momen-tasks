export type ZoneRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface Zone {
  id: string;
  ownerId: string;
  name: string;
  icon: string;
  color: string;
  isShared: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ZoneMember {
  id: string;
  userId: string;
  role: ZoneRole;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export interface CreateZoneInput {
  name: string;
  icon: string;
  color: string;
  isShared?: boolean;
}

export interface UpdateZoneInput {
  name?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}
