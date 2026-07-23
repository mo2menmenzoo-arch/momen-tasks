import { IsBoolean, IsOptional, IsString, IsInt, IsArray } from 'class-validator';

export class UpdateNotificationPrefsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyReview?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  reminderLeadTimes?: string[];

  @IsOptional()
  @IsInt()
  quietHoursStart?: number;

  @IsOptional()
  @IsInt()
  quietHoursEnd?: number;
}
