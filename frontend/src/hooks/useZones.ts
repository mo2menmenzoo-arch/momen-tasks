import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zonesApi } from '@/api/zones';
import { cacheZones, getCachedZones, putZone, deleteZone as deleteCachedZone, addToOutbox } from '@/services/offline-db';
import type { CreateZoneInput, UpdateZoneInput } from '@/types';

export function useZones() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      try {
        const data = await zonesApi.list();
        cacheZones(data).catch(() => {});
        return data;
      } catch {
        return getCachedZones();
      }
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.data && query.isLoading) {
      getCachedZones().then(cached => {
        if (cached.length > 0) {
          queryClient.setQueryData(['zones'], cached);
        }
      }).catch(() => {});
    }
  }, []);

  return query;
}

export function useZone(id: string) {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => zonesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateZoneInput) => zonesApi.create(data),
    onMutate: async (newZone) => {
      await queryClient.cancelQueries({ queryKey: ['zones'] });
      const previous = queryClient.getQueryData(['zones']);
      const tempId = 'temp-' + Date.now();
      const optimistic = { ...newZone, id: tempId, ownerId: '', isShared: newZone.isShared || false, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      queryClient.setQueryData(['zones'], (old: any[]) => [...(old || []), optimistic]);

      addToOutbox({ entityType: 'zone', entityId: tempId, operation: 'create', timestamp: new Date().toISOString(), data: newZone as unknown as Record<string, unknown> }).catch(() => {});
      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['zones'], (old: any[]) =>
        (old || []).map((z: any) => z.id.startsWith('temp-') ? data : z)
      );
      putZone(data).catch(() => {});
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useUpdateZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateZoneInput }) => zonesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['zones'] });
      queryClient.setQueryData(['zones'], (old: any[]) =>
        (old || []).map((z: any) => z.id === id ? { ...z, ...data } : z)
      );
      addToOutbox({ entityType: 'zone', entityId: id, operation: 'update', timestamp: new Date().toISOString(), data: data as Record<string, unknown> }).catch(() => {});
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => zonesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['zones'] });
      queryClient.setQueryData(['zones'], (old: any[]) => (old || []).filter((z: any) => z.id !== id));
      deleteCachedZone(id).catch(() => {});
      addToOutbox({ entityType: 'zone', entityId: id, operation: 'delete', timestamp: new Date().toISOString(), data: {} }).catch(() => {});
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['zones'] }),
  });
}

export function useZoneMembers(zoneId: string) {
  return useQuery({
    queryKey: ['zones', zoneId, 'members'],
    queryFn: () => zonesApi.listMembers(zoneId),
    enabled: !!zoneId,
  });
}
