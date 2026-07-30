import { IsString, IsArray, IsDateString, IsOptional } from "class-validator";

export class PullChangesDto {
  @IsDateString()
  cursor: Date;

  @IsArray()
  @IsString({ each: true })
  entityTypes: string[];
}
