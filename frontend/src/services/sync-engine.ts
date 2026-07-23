import { syncApi } from '@/api/sync';
import { getOutboxEntries, clearOutbox, getMeta, setMeta } from './offline-db';
import { addToOutbox } from './offline-db';

export async function processOutbox(): Promise<{ processed: number; conflicts: number }> {
  const entries = await getOutboxEntries();
  if (entries.length === 0) return { processed: 0, conflicts: 0 };

  const cursor = await getMeta('sync-cursor') || new Date(0).toISOString();

  try {
    const changes = entries.map(e => ({
      entityType: e.entityType as any,
      entityId: e.entityId,
      operation: e.operation as any,
      timestamp: e.timestamp,
      data: e.data,
    }));

    const result = await syncApi.push(crypto.randomUUID(), changes);

    // Apply pulled changes
    if (result.cursor) {
      const pullResult = await syncApi.pull(result.cursor);
      await setMeta('sync-cursor', pullResult.cursor);
    }

    await clearOutbox();

    return { processed: result.processed, conflicts: result.conflicts.length };
  } catch (err) {
    console.error('[Sync] Push failed:', err);
    return { processed: 0, conflicts: 0 };
  }
}

let syncInterval: ReturnType<typeof setInterval> | null = null;

export function startSyncEngine(intervalMs = 30_000) {
  if (syncInterval) return;
  syncInterval = setInterval(async () => {
    if (navigator.onLine) {
      await processOutbox();
    }
  }, intervalMs);

  // Also sync when coming back online
  window.addEventListener('online', () => {
    processOutbox();
  });
}

export function stopSyncEngine() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
