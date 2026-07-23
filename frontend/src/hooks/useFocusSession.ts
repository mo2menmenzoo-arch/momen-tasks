import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { focusApi } from '@/api/focus';
import type { CreateFocusSessionInput } from '@/types';

export function useActiveFocusSession() {
  return useQuery({
    queryKey: ['focus-sessions', 'active'],
    queryFn: focusApi.getActive,
    refetchInterval: 10_000,
  });
}

export function useStartFocus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFocusSessionInput) => focusApi.create(data),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['focus-sessions'] }),
  });
}

export function useEndFocus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => focusApi.end(id, completed),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
