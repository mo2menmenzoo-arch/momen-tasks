import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';

export class ZoneQueryDto {
  @IsOptional()
  @IsBoolean()
  includeShared?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
