import api from './api';
import type { ApiResponse, Inspection, PaginatedResponse, InspectionType } from '@/types';

export interface InspectionFilters {
  page?: number;
  limit?: number;
  bookingId?: string;
  carId?: string;
  type?: InspectionType;
}

export const inspectionsService = {
  getAll(filters?: InspectionFilters) {
    return api.get<PaginatedResponse<Inspection>>('/inspections', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Inspection>>(`/inspections/${id}`);
  },

  create(data: Partial<Inspection>) {
    return api.post<ApiResponse<Inspection>>('/inspections', data);
  },

  update(id: string, data: Partial<Inspection>) {
    return api.put<ApiResponse<Inspection>>(`/inspections/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/inspections/${id}`);
  },

  uploadPhotos(id: string, files: FormData) {
    return api.post<ApiResponse<{ urls: string[] }>>(`/inspections/${id}/photos`, files, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
