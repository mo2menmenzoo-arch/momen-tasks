import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncApi } from '@/api/sync';
import { useOfflineStore } from '@/stores/offline.store';

export function useSyncNow() {
  const queryClient = useQueryClient();
  const { syncQueue, clearQueue } = useOfflineStore();

  return useMutation({
    mutationFn: async () => {
      if (syncQueue.length === 0) return;
      const result = await syncApi.push(crypto.randomUUID(), syncQueue);
      if (result.cursor) {
        const pullResult = await syncApi.pull(result.cursor);
        return { ...result, pulled: pullResult.changes.length };
      }
      return result;
    },
    onSuccess: () => {
      clearQueue();
      queryClient.invalidateQueries();
    },
  });
}

export function useSyncStatus() {
  const { isOnline, syncQueue } = useOfflineStore();
  return { isOnline, pendingChanges: syncQueue.length };
}
