import api from './api';
import type { ApiResponse, Notification, PaginatedResponse } from '@/types';

export const notificationsService = {
  getAll(page?: number, limit?: number) {
    return api.get<PaginatedResponse<Notification>>('/notifications', {
      params: { page, limit },
    });
  },

  getUnreadCount() {
    return api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  },

  markAsRead(id: string) {
    return api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  markAllAsRead() {
    return api.patch('/notifications/read-all');
  },

  delete(id: string) {
    return api.delete(`/notifications/${id}`);
  },
};
