import { apiRequest } from './client';
import type { SyncChange, SyncConflict } from '@/types';

interface SyncPushResponse {
  processed: number;
  conflicts: SyncConflict[];
  cursor: string;
}

interface SyncPullResponse {
  changes: SyncChange[];
  cursor: string;
}

export const syncApi = {
  push: (clientId: string, changes: SyncChange[]) =>
    apiRequest<SyncPushResponse>('/sync/push', {
      method: 'POST',
      body: JSON.stringify({ clientId, changes }),
    }),

  pull: (cursor: string, entityTypes?: string[]) =>
    apiRequest<SyncPullResponse>('/sync/pull', {
      method: 'POST',
      body: JSON.stringify({ cursor, entityTypes }),
    }),
};
