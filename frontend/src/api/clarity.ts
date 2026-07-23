import { apiRequest } from './client';
import type { ClarityMetric, ClarityMetricHistory, WeeklyReview } from '@/types';

export const clarityApi = {
  getMetrics: (date?: string) => {
    const qs = date ? `?date=${date}` : '';
    return apiRequest<ClarityMetric>(`/clarity-engine/metrics${qs}`);
  },

  getHistory: (days?: number) => {
    const qs = days ? `?days=${days}` : '';
    return apiRequest<ClarityMetricHistory[]>(`/clarity-engine/metrics/history${qs}`);
  },

  getWeeklyReview: () =>
    apiRequest<WeeklyReview>('/clarity-engine/weekly-review'),
};
