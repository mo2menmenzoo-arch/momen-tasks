import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import { cacheTasks, getCachedTasks, putTask, deleteTask as deleteCachedTask, addToOutbox } from '@/services/offline-db';
import type { TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/types';

export function useTasks(filters?: TaskFilters) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      try {
        const data = await tasksApi.list(filters);
        cacheTasks(data).catch(() => {});
        return data;
      } catch {
        return getCachedTasks();
      }
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  // Hydrate from IndexedDB on mount
  useEffect(() => {
    if (!query.data && query.isLoading) {
      getCachedTasks().then(cached => {
        if (cached.length > 0) {
          queryClient.setQueryData(['tasks', filters], cached);
        }
      }).catch(() => {});
    }
  }, []);

  return query;
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(data),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previous = queryClient.getQueriesData({ queryKey: ['tasks'] });

      const tempId = 'temp-' + Date.now();
      const optimisticTask = {
        ...newTask,
        id: tempId,
        ownerId: '',
        zoneId: newTask.zoneId || '',
        parentTaskId: null,
        notes: newTask.notes || null,
        priority: newTask.priority || 'MEDIUM' as const,
        dueDate: newTask.dueDate || null,
        dueTime: newTask.dueTime || null,
        isAllDay: newTask.isAllDay || false,
        recurrenceRule: null,
        estimatedEffortMinutes: newTask.estimatedEffortMinutes || null,
        status: 'PENDING' as const,
        completedAt: null,
        assignedToId: null,
        tags: newTask.tags || [],
        blockedBy: newTask.blockedBy || [],
        blocks: [],
        locationTrigger: null,
        attachments: null,
        source: newTask.source || 'QUICK_CAPTURE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return [...old, optimisticTask];
      });

      // Write to IndexedDB + outbox for offline support
      putTask(optimisticTask).catch(() => {});
      addToOutbox({
        entityType: 'task',
        entityId: tempId,
        operation: 'create',
        timestamp: new Date().toISOString(),
        data: newTask as unknown as Record<string, unknown>,
      }).catch(() => {});

      return { previous };
    },
    onError: (_err, _newTask, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },
    onSuccess: (data, _variables, context) => {
      // Replace temp ID with real ID
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((t: any) => t.id.startsWith('temp-') ? data : t);
      });
      putTask(data).catch(() => {});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => tasksApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(t => t.id === id ? { ...t, ...data } : t);
      });

      addToOutbox({
        entityType: 'task',
        entityId: id,
        operation: 'update',
        timestamp: new Date().toISOString(),
        data: data as Record<string, unknown>,
      }).catch(() => {});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.complete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(t => t.id === id ? { ...t, status: 'COMPLETED', completedAt: new Date().toISOString() } : t);
      });

      addToOutbox({
        entityType: 'task',
        entityId: id,
        operation: 'update',
        timestamp: new Date().toISOString(),
        data: { status: 'COMPLETED', completedAt: new Date().toISOString() },
      }).catch(() => {});

      if (navigator.vibrate) navigator.vibrate(50);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter(t => t.id !== id);
      });

      deleteCachedTask(id).catch(() => {});
      addToOutbox({
        entityType: 'task',
        entityId: id,
        operation: 'delete',
        timestamp: new Date().toISOString(),
        data: {},
      }).catch(() => {});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
