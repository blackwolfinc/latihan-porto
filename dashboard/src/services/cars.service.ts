import api from './api';
import type { ApiResponse, Car, PaginatedResponse, CarStatus, CarCategory } from '@/types';

export interface CarFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CarStatus;
  category?: CarCategory;
  branchId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const carsService = {
  getAll(filters?: CarFilters) {
    return api.get<PaginatedResponse<Car>>('/cars', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Car>>(`/cars/${id}`);
  },

  create(data: Partial<Car>) {
    return api.post<ApiResponse<Car>>('/cars', data);
  },

  update(id: string, data: Partial<Car>) {
    return api.put<ApiResponse<Car>>(`/cars/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/cars/${id}`);
  },

  checkAvailability(id: string, startDate: string, endDate: string) {
    return api.get<ApiResponse<{ available: boolean }>>(`/cars/${id}/availability`, {
      params: { startDate, endDate },
    });
  },

  getAvailableCars(startDate: string, endDate: string, branchId?: string) {
    return api.get<ApiResponse<Car[]>>('/cars/available', {
      params: { startDate, endDate, branchId },
    });
  },

  uploadImage(id: string, file: FormData) {
    return api.post<ApiResponse<{ url: string }>>(`/cars/${id}/images`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  addDocument(id: string, data: FormData) {
    return api.post(`/cars/${id}/documents`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument(carId: string, documentId: string) {
    return api.delete(`/cars/${carId}/documents/${documentId}`);
  },
};
