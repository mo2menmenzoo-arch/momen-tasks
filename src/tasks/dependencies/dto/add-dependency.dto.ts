import { IsUUID, IsOptional, IsString } from "class-validator";

export class AddDependencyDto {
  @IsUUID()
  dependencyId: string;
}
