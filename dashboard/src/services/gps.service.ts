import api from './api';
import type { ApiResponse, GpsLog } from '@/types';

export interface GpsFilters {
  carId?: string;
  bookingId?: string;
  startDate?: string;
  endDate?: string;
}

export const gpsService = {
  getLatest(carId?: string) {
    return api.get<ApiResponse<GpsLog[]>>('/gps/latest', { params: { carId } });
  },

  getHistory(carId: string, filters?: GpsFilters) {
    return api.get<ApiResponse<GpsLog[]>>(`/gps/history/${carId}`, { params: filters });
  },

  getByBooking(bookingId: string) {
    return api.get<ApiResponse<GpsLog[]>>(`/gps/booking/${bookingId}`);
  },
};
