import api from './api';
import type { ApiResponse, Booking, PaginatedResponse, BookingStatus } from '@/types';

export interface BookingFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  branchId?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  carId?: string;
  driverId?: string;
}

export const bookingsService = {
  getAll(filters?: BookingFilters) {
    return api.get<PaginatedResponse<Booking>>('/bookings', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Booking>>(`/bookings/${id}`);
  },

  create(data: Partial<Booking>) {
    return api.post<ApiResponse<Booking>>('/bookings', data);
  },

  update(id: string, data: Partial<Booking>) {
    return api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
  },

  updateStatus(id: string, status: BookingStatus) {
    return api.patch<ApiResponse<Booking>>(`/bookings/${id}/status`, { status });
  },

  cancel(id: string, reason?: string) {
    return api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
  },

  getCalendar(month: number, year: number, branchId?: string) {
    return api.get<ApiResponse<Booking[]>>('/bookings/calendar', {
      params: { month, year, branchId },
    });
  },

  delete(id: string) {
    return api.delete(`/bookings/${id}`);
  },
};
