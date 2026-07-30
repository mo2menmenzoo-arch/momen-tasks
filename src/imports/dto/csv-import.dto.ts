import { IsString, IsOptional, IsObject, IsUUID } from "class-validator";

export class CsvImportDto {
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @IsOptional()
  @IsObject()
  columnMapping?: {
    title?: string;
    notes?: string;
    dueDate?: string;
    priority?: string;
    tags?: string;
  };
}
