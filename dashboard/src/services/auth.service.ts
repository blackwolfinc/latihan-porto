import api from './api';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

export const authService = {
  login(data: LoginRequest) {
    return api.post<ApiResponse<LoginResponse>>('/auth/login', data);
  },

  register(data: RegisterRequest) {
    return api.post<ApiResponse<User>>('/auth/register', data);
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', { refreshToken });
  },

  logout() {
    return api.post('/auth/logout');
  },

  getProfile() {
    return api.get<ApiResponse<User>>('/auth/profile');
  },

  updateProfile(data: Partial<User>) {
    return api.put<ApiResponse<User>>('/auth/profile', data);
  },

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return api.put('/auth/change-password', data);
  },
};
