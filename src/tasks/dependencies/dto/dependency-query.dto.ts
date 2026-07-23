import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class DependencyQueryDto {
  @IsOptional()
  @IsBoolean()
  includeTransitive?: boolean;
}
