import { IsUUID, IsInt, Min, IsOptional, IsString, IsBoolean } from 'class-validator';

export class StartSessionDto {
  @IsUUID()
  taskId: string;

  @IsInt()
  @Min(1)
  durationSeconds: number;

  @IsOptional()
  @IsString()
  ambientSound?: string;
}
