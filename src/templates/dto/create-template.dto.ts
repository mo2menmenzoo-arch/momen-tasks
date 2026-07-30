import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
} from "class-validator";

export class CreateTemplateDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  taskBlueprint: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
