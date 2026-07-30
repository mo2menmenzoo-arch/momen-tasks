import { IsEnum, IsOptional } from "class-validator";
import { ZoneRole } from "@prisma/client";

export class UpdateMemberDto {
  @IsOptional()
  @IsEnum(ZoneRole)
  role?: ZoneRole;
}
