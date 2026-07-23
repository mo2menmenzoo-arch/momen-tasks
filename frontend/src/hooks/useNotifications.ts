import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications';

export function useNotifications(filters?: { status?: string; type?: string; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationsApi.list(filters),
    staleTime: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
