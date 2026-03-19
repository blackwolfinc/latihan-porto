import api from './api';
import type { ApiResponse, FuelLog, PaginatedResponse, Expense, ExpenseCategory } from '@/types';

export interface FuelFilters {
  page?: number;
  limit?: number;
  carId?: string;
  driverId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseFilters {
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}

export const fuelService = {
  getAll(filters?: FuelFilters) {
    return api.get<PaginatedResponse<FuelLog>>('/fuel', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<FuelLog>>(`/fuel/${id}`);
  },

  create(data: Partial<FuelLog>) {
    return api.post<ApiResponse<FuelLog>>('/fuel', data);
  },

  update(id: string, data: Partial<FuelLog>) {
    return api.put<ApiResponse<FuelLog>>(`/fuel/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/fuel/${id}`);
  },
};

export const expensesService = {
  getAll(filters?: ExpenseFilters) {
    return api.get<PaginatedResponse<Expense>>('/expenses', { params: filters });
  },

  getById(id: string) {
    return api.get<ApiResponse<Expense>>(`/expenses/${id}`);
  },

  create(data: Partial<Expense>) {
    return api.post<ApiResponse<Expense>>('/expenses', data);
  },

  update(id: string, data: Partial<Expense>) {
    return api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/expenses/${id}`);
  },
};
