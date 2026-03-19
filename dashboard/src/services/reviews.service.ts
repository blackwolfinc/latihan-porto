import api from './api';
import type { ApiResponse, Review, PaginatedResponse } from '@/types';

export interface ReviewFilters {
  page?: number;
  limit?: number;
  carId?: string;
  driverId?: string;
  minRating?: number;
  maxRating?: number;
  isPublished?: boolean;
}

export const reviewsService = {
  getAll(filters?: ReviewFilters) {
    return api.get<PaginatedResponse<Review>>('/reviews', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Review>>(`/reviews/${id}`);
  },

  create(data: Partial<Review>) {
    return api.post<ApiResponse<Review>>('/reviews', data);
  },

  update(id: string, data: Partial<Review>) {
    return api.put<ApiResponse<Review>>(`/reviews/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/reviews/${id}`);
  },

  togglePublish(id: string) {
    return api.patch<ApiResponse<Review>>(`/reviews/${id}/toggle-publish`);
  },

  addResponse(id: string, response: string) {
    return api.post<ApiResponse<Review>>(`/reviews/${id}/response`, { response });
  },
};
