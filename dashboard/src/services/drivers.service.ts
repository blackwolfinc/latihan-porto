import api from './api';
import type { ApiResponse, Driver, PaginatedResponse, DriverStatus } from '@/types';

export interface DriverFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: DriverStatus;
  branchId?: string;
}

export const driversService = {
  getAll(filters?: DriverFilters) {
    return api.get<PaginatedResponse<Driver>>('/drivers', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Driver>>(`/drivers/${id}`);
  },

  create(data: Partial<Driver> & { user?: Partial<import('@/types').User> }) {
    return api.post<ApiResponse<Driver>>('/drivers', data);
  },

  update(id: string, data: Partial<Driver>) {
    return api.put<ApiResponse<Driver>>(`/drivers/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/drivers/${id}`);
  },

  getAvailable(startDate: string, endDate: string, branchId?: string) {
    return api.get<ApiResponse<Driver[]>>('/drivers/available', {
      params: { startDate, endDate, branchId },
    });
  },

  addDocument(id: string, data: FormData) {
    return api.post(`/drivers/${id}/documents`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument(driverId: string, documentId: string) {
    return api.delete(`/drivers/${driverId}/documents/${documentId}`);
  },
};
