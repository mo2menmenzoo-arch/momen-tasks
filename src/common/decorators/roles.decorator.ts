import { SetMetadata } from "@nestjs/common";
import { ZoneRole } from "@prisma/client";

export const ROLES_KEY = "roles";
export const Roles = (...roles: ZoneRole[]) => SetMetadata(ROLES_KEY, roles);
