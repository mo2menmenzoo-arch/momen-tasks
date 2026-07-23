import { IsString, IsOptional } from 'class-validator';

export class ExportRequestDto {
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv';
}
