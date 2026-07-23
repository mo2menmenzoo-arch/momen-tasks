import { IsString, IsObject, IsDateString, IsEnum } from 'class-validator';

export class ConflictResolutionDto {
  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsEnum(['field_merge', 'last_write_wins', 'delete_wins'])
  conflictType: string;

  @IsObject()
  serverData: Record<string, unknown>;

  @IsObject()
  clientData: Record<string, unknown>;

  @IsObject()
  mergedData: Record<string, unknown>;
}
