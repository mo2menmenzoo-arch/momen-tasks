import { Injectable } from '@nestjs/common';
import { SyncChangeDto } from '../dto/push-changes.dto';

export interface ConflictResult {
  entityType: string;
  entityId: string;
  conflictType: string;
  serverData: Record<string, unknown>;
  clientData: Record<string, unknown>;
  mergedData: Record<string, unknown>;
}

@Injectable()
export class ConflictResolver {
  resolve(
    serverEntity: Record<string, unknown>,
    clientChange: SyncChangeDto,
  ): { merged: Record<string, unknown>; conflict: ConflictResult | null } {
    const serverData = { ...serverEntity };
    const clientData = { ...clientChange.data };
    const merged: Record<string, unknown> = { ...serverData };
    let hasConflict = false;

    for (const fieldChange of clientChange.fieldChanges) {
      const { field, oldValue, newValue, timestamp } = fieldChange;

      const serverValue = serverData[field];
      const serverUpdatedAt = serverData['updatedAt'] as Date;

      if (serverValue === newValue) {
        continue;
      }

      if (serverUpdatedAt && new Date(timestamp) < new Date(serverUpdatedAt)) {
        const timeDiff = Math.abs(
          new Date(timestamp).getTime() - new Date(serverUpdatedAt).getTime(),
        );

        if (timeDiff <= 5000) {
          hasConflict = true;
          merged[field] = newValue;
        } else {
          merged[field] = serverValue;
        }
      } else {
        merged[field] = newValue;
      }
    }

    if (clientChange.operation === 'delete') {
      const serverUpdatedAt = serverData['updatedAt'] as Date;
      if (serverUpdatedAt && new Date(clientChange.timestamp) < new Date(serverUpdatedAt)) {
        merged['_deleted'] = false;
      } else {
        merged['_deleted'] = true;
      }
      hasConflict = true;
    }

    if (hasConflict) {
      const conflict: ConflictResult = {
        entityType: clientChange.entityType,
        entityId: clientChange.entityId,
        conflictType: 'field_merge',
        serverData,
        clientData,
        mergedData: merged,
      };
      return { merged, conflict };
    }

    return { merged, conflict: null };
  }

  mergeDifferentFields(
    serverEntity: Record<string, unknown>,
    clientData: Record<string, unknown>,
  ): Record<string, unknown> {
    return { ...serverEntity, ...clientData };
  }
}
