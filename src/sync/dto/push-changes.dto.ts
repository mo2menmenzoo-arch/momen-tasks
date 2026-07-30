import {
  IsString,
  IsArray,
  IsUUID,
  IsDateString,
  IsObject,
  IsEnum,
} from "class-validator";

export class FieldChangeDto {
  @IsString()
  field: string;

  @IsObject()
  oldValue: unknown;

  @IsObject()
  newValue: unknown;

  @IsDateString()
  timestamp: Date;
}

export class SyncChangeDto {
  @IsString()
  entityType: string;

  @IsUUID()
  entityId: string;

  @IsEnum(["create", "update", "delete"])
  operation: "create" | "update" | "delete";

  @IsDateString()
  timestamp: Date;

  @IsObject()
  data: Record<string, unknown>;

  @IsArray()
  fieldChanges: FieldChangeDto[];
}

export class PushChangesDto {
  @IsUUID()
  clientId: string;

  @IsArray()
  changes: SyncChangeDto[];
}
