import { apiRequest } from './client';
import type { Template, ApplyTemplateInput } from '@/types';

export const templatesApi = {
  list: (filters?: { includePublic?: boolean; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.includePublic) params.set('includePublic', 'true');
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return apiRequest<Template[]>(`/templates${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    apiRequest<Template>(`/templates/${id}`),

  create: (data: Partial<Template>) =>
    apiRequest<Template>('/templates', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Template>) =>
    apiRequest<Template>(`/templates/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiRequest<void>(`/templates/${id}`, { method: 'DELETE' }),

  apply: (id: string, data: ApplyTemplateInput) =>
    apiRequest<{ message: string; taskIds: string[] }>(`/templates/${id}/apply`, { method: 'POST', body: JSON.stringify(data) }),
};
