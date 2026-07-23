import { IsString, IsOptional, IsBoolean, IsInt, IsHexColor } from 'class-validator';

export class CreateZoneDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
