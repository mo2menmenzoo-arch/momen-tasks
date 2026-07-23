import {
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';

export class TodoistImportDto {
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;
}
