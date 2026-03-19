import api from './api';
import type { ApiResponse } from '@/types';

export const uploadsService = {
  uploadFile(file: File, folder?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post<ApiResponse<{ url: string; filename: string }>>(
      '/uploads',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  uploadMultiple(files: File[], folder?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post<ApiResponse<{ urls: string[] }>>(
      '/uploads/multiple',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  deleteFile(url: string) {
    return api.delete('/uploads', { data: { url } });
  },
};
