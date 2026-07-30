import { IsOptional, IsString } from "class-validator";

export class SessionQueryDto {
  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
