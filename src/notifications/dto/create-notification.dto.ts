import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
  IsUUID,
} from "class-validator";
import { NotificationType, NotificationStatus } from "@prisma/client";

export class CreateNotificationDto {
  @IsUUID()
  taskId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsDateString()
  scheduledAt: Date;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
