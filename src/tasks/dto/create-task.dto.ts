import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  IsArray,
  IsBoolean,
  IsUUID,
  IsObject,
} from "class-validator";
import { TaskPriority, TaskStatus, TaskSource } from "@prisma/client";

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsString()
  dueTime?: string;

  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsInt()
  estimatedEffortMinutes?: number;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsOptional()
  @IsUUID()
  parentTaskId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  blockedBy?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  blocks?: string[];

  @IsOptional()
  @IsObject()
  locationTrigger?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  attachments?: Record<string, unknown>[];

  @IsOptional()
  @IsEnum(TaskSource)
  source?: TaskSource;
}
