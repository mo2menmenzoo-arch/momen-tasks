import { IsOptional, IsString, IsBoolean } from "class-validator";

export class TemplateQueryDto {
  @IsOptional()
  @IsBoolean()
  includePublic?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
