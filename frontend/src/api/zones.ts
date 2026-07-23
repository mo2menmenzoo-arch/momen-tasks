import { apiRequest } from './client';
import type { Zone, ZoneMember, CreateZoneInput, UpdateZoneInput } from '@/types';

export const zonesApi = {
  list: (includeShared?: boolean) => {
    const qs = includeShared ? '?includeShared=true' : '';
    return apiRequest<Zone[]>(`/zones${qs}`);
  },

  get: (id: string) =>
    apiRequest<Zone>(`/zones/${id}`),

  create: (data: CreateZoneInput) =>
    apiRequest<Zone>('/zones', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateZoneInput) =>
    apiRequest<Zone>(`/zones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiRequest<void>(`/zones/${id}`, { method: 'DELETE' }),

  listMembers: (zoneId: string) =>
    apiRequest<ZoneMember[]>(`/zones/${zoneId}/members`),

  addMember: (zoneId: string, data: { email: string; role: string }) =>
    apiRequest<ZoneMember>(`/zones/${zoneId}/members`, { method: 'POST', body: JSON.stringify(data) }),

  updateMember: (zoneId: string, userId: string, data: { role: string }) =>
    apiRequest<ZoneMember>(`/zones/${zoneId}/members/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  removeMember: (zoneId: string, userId: string) =>
    apiRequest<void>(`/zones/${zoneId}/members/${userId}`, { method: 'DELETE' }),
};
