import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
} from "class-validator";
import { TaskPriority, TaskStatus } from "@prisma/client";

export class TaskQueryDto {
  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueBefore?: Date;

  @IsOptional()
  @IsDateString()
  dueAfter?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  includeCompleted?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: "createdAt" | "dueDate" | "priority" | "updatedAt";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}
