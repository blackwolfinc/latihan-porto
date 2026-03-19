import api from './api';
import type { ApiResponse, MaintenanceRecord, PaginatedResponse, MaintenanceStatus, MaintenanceType } from '@/types';

export interface MaintenanceFilters {
  page?: number;
  limit?: number;
  carId?: string;
  status?: MaintenanceStatus;
  type?: MaintenanceType;
  startDate?: string;
  endDate?: string;
}

export const maintenanceService = {
  getAll(filters?: MaintenanceFilters) {
    return api.get<PaginatedResponse<MaintenanceRecord>>('/maintenance', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<MaintenanceRecord>>(`/maintenance/${id}`);
  },

  create(data: Partial<MaintenanceRecord>) {
    return api.post<ApiResponse<MaintenanceRecord>>('/maintenance', data);
  },

  update(id: string, data: Partial<MaintenanceRecord>) {
    return api.put<ApiResponse<MaintenanceRecord>>(`/maintenance/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/maintenance/${id}`);
  },

  getUpcoming(days?: number) {
    return api.get<ApiResponse<MaintenanceRecord[]>>('/maintenance/upcoming', {
      params: { days: days || 7 },
    });
  },

  getOverdue() {
    return api.get<ApiResponse<MaintenanceRecord[]>>('/maintenance/overdue');
  },
};
