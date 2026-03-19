import api from './api';
import type { ApiResponse, RevenueData, FleetUtilization, ExpenseSummary } from '@/types';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export const reportsService = {
  getRevenue(filters?: ReportFilters) {
    return api.get<ApiResponse<RevenueData[]>>('/reports/revenue', { params: filters });
  },

  getRevenueByBranch(filters?: ReportFilters) {
    return api.get<ApiResponse<{ branchId: string; branchName: string; revenue: number; bookings: number }[]>>(
      '/reports/revenue/by-branch',
      { params: filters }
    );
  },

  getRevenueByCar(filters?: ReportFilters) {
    return api.get<ApiResponse<{ carId: string; plateNumber: string; brand: string; model: string; revenue: number }[]>>(
      '/reports/revenue/by-car',
      { params: filters }
    );
  },

  getFleetUtilization(filters?: ReportFilters) {
    return api.get<ApiResponse<FleetUtilization[]>>('/reports/fleet-utilization', { params: filters });
  },

  getFleetStatus() {
    return api.get<ApiResponse<{ status: string; count: number }[]>>('/reports/fleet-status');
  },

  getExpenseSummary(filters?: ReportFilters) {
    return api.get<ApiResponse<ExpenseSummary[]>>('/reports/expenses', { params: filters });
  },

  getExpenseByBranch(filters?: ReportFilters) {
    return api.get<ApiResponse<{ branchId: string; branchName: string; total: number }[]>>(
      '/reports/expenses/by-branch',
      { params: filters }
    );
  },

  getDashboardStats() {
    return api.get<ApiResponse<import('@/types').DashboardStats>>('/reports/dashboard');
  },
};
