import api from './api';
import type { ApiResponse, Payment, PaginatedResponse, PaymentStatus } from '@/types';

export interface PaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  bookingId?: string;
}

export const paymentsService = {
  getAll(filters?: PaymentFilters) {
    return api.get<PaginatedResponse<Payment>>('/payments', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  create(data: Partial<Payment>) {
    return api.post<ApiResponse<Payment>>('/payments', data);
  },

  refund(id: string, amount?: number, reason?: string) {
    return api.post<ApiResponse<Payment>>(`/payments/${id}/refund`, { amount, reason });
  },

  verifyMidtrans(orderId: string) {
    return api.get<ApiResponse<Payment>>(`/payments/midtrans/verify/${orderId}`);
  },
};
