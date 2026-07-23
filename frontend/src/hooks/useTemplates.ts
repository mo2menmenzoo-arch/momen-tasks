import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '@/api/templates';

export function useTemplates(filters?: { includePublic?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['templates', filters],
    queryFn: () => templatesApi.list(filters),
    staleTime: 60_000,
  });
}

export function useApplyTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { zoneId: string; prefix?: string } }) => templatesApi.apply(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
