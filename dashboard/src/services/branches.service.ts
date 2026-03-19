import api from './api';
import type { ApiResponse, Branch, PaginatedResponse } from '@/types';

export interface BranchFilters {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  isActive?: boolean;
}

export const branchesService = {
  getAll(filters?: BranchFilters) {
    return api.get<PaginatedResponse<Branch>>('/branches', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Branch>>(`/branches/${id}`);
  },

  create(data: Partial<Branch>) {
    return api.post<ApiResponse<Branch>>('/branches', data);
  },

  update(id: string, data: Partial<Branch>) {
    return api.put<ApiResponse<Branch>>(`/branches/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/branches/${id}`);
  },

  getCities() {
    return api.get<ApiResponse<string[]>>('/branches/cities');
  },
};
