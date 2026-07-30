import { IsInt, Min, IsOptional, IsBoolean } from "class-validator";

export class EndSessionDto {
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
