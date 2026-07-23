export interface SyncChange {
  entityType: 'task' | 'zone' | 'zoneMember' | 'focusSession';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  data: Record<string, unknown>;
  fieldChanges?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: string;
  }[];
}

export interface SyncConflict {
  entityType: string;
  entityId: string;
  conflictType: string;
  serverData: Record<string, unknown>;
  clientData: Record<string, unknown>;
  mergedData: Record<string, unknown>;
}

export interface SyncCursor {
  cursor: string;
}
