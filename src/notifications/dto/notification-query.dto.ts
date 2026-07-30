import { IsEnum, IsOptional, IsString, IsBoolean } from "class-validator";
import { NotificationType, NotificationStatus } from "@prisma/client";

export class NotificationQueryDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
