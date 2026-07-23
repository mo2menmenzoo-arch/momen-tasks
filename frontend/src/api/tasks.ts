import { apiRequest } from './client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types';

function buildQueryString(filters: TaskFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, String(value));
      }
    }
  });
  return params.toString();
}

export const tasksApi = {
  list: (filters?: TaskFilters) => {
    const qs = filters ? buildQueryString(filters) : '';
    return apiRequest<Task[]>(`/tasks${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    apiRequest<Task>(`/tasks/${id}`),

  create: (data: CreateTaskInput) =>
    apiRequest<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateTaskInput) =>
    apiRequest<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),

  complete: (id: string) =>
    apiRequest<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'COMPLETED', completedAt: new Date().toISOString() }) }),

  listSubtasks: (taskId: string) =>
    apiRequest<Task[]>(`/tasks/${taskId}/subtasks`),

  createSubtask: (taskId: string, data: { title: string; priority?: string }) =>
    apiRequest<Task>(`/tasks/${taskId}/subtasks`, { method: 'POST', body: JSON.stringify(data) }),

  deleteSubtask: (taskId: string, subtaskId: string) =>
    apiRequest<void>(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' }),
};
