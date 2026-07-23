import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ApplyTemplateDto {
  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsString()
  prefix?: string;
}
