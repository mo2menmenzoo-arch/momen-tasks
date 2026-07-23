import { IsString, IsOptional, IsEnum, IsDateString, IsInt, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';

export class CreateSubtaskDto {
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
  @IsInt()
  estimatedEffortMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
