import api from './api';
import type { ApiResponse, User, PaginatedResponse, Booking } from '@/types';

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export const customersService = {
  getAll(filters?: CustomerFilters) {
    return api.get<PaginatedResponse<User>>('/customers', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<User>>(`/customers/${id}`);
  },

  getBookingHistory(id: string, page?: number, limit?: number) {
    return api.get<PaginatedResponse<Booking>>(`/customers/${id}/bookings`, {
      params: { page, limit },
    });
  },

  update(id: string, data: Partial<User>) {
    return api.put<ApiResponse<User>>(`/customers/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/customers/${id}`);
  },

  getStats(id: string) {
    return api.get<ApiResponse<{ totalBookings: number; totalSpent: number; averageRating: number }>>(`/customers/${id}/stats`);
  },
};
