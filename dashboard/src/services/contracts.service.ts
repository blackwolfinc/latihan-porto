import api from './api';
import type { ApiResponse, Contract, PaginatedResponse } from '@/types';

export interface ContractFilters {
  page?: number;
  limit?: number;
  bookingId?: string;
  search?: string;
}

export const contractsService = {
  getAll(filters?: ContractFilters) {
    return api.get<PaginatedResponse<Contract>>('/contracts', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Contract>>(`/contracts/${id}`);
  },

  generate(bookingId: string) {
    return api.post<ApiResponse<Contract>>('/contracts/generate', { bookingId });
  },

  downloadPdf(id: string) {
    return api.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
  },

  sign(id: string, signatureData: string) {
    return api.post<ApiResponse<Contract>>(`/contracts/${id}/sign`, { signature: signatureData });
  },

  delete(id: string) {
    return api.delete(`/contracts/${id}`);
  },
};
