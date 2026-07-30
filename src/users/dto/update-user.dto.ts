import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
} from "class-validator";
import { ThemePreference } from "@prisma/client";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsEnum(ThemePreference)
  themePreference?: ThemePreference;

  @IsOptional()
  @IsObject()
  energyHours?: {
    focus: [string, string];
    low: [string, string];
  };
}
