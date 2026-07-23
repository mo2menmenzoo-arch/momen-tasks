import { IsString, IsOptional, IsBoolean, IsHexColor, IsInt, Min } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
