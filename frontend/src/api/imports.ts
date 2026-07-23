import { apiRequest } from './client';

interface ImportJob {
  jobId: string;
  message: string;
}

interface ImportJobStatus {
  jobId: string;
  status: number;
  data: Record<string, unknown>;
  result: { success: boolean; imported: number; total: number } | null;
  failedReason: string | null;
  processedOn: number | null;
  finishedOn: number | null;
}

export const importsApi = {
  csv: (data: { fileUrl: string; zoneId: string; columnMapping: Record<string, number> }) =>
    apiRequest<ImportJob>('/imports/csv', { method: 'POST', body: JSON.stringify(data) }),

  todoist: (data: { fileUrl: string; zoneId: string }) =>
    apiRequest<ImportJob>('/imports/todoist', { method: 'POST', body: JSON.stringify(data) }),

  getStatus: (jobId: string) =>
    apiRequest<ImportJobStatus>(`/imports/${jobId}/status`),
};
