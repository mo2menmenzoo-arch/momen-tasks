import { useQuery } from '@tanstack/react-query';
import { clarityApi } from '@/api/clarity';

export function useMetrics(date?: string) {
  return useQuery({
    queryKey: ['clarity-metrics', date],
    queryFn: () => clarityApi.getMetrics(date),
    staleTime: 60_000,
  });
}

export function useMetricsHistory(days?: number) {
  return useQuery({
    queryKey: ['clarity-metrics-history', days],
    queryFn: () => clarityApi.getHistory(days),
    staleTime: 60_000,
  });
}

export function useWeeklyReview() {
  return useQuery({
    queryKey: ['weekly-review'],
    queryFn: clarityApi.getWeeklyReview,
    staleTime: 60_000,
  });
}
