import api from './api';

export const invoicesService = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  getByBooking: (bookingId: string) => api.get(`/invoices/booking/${bookingId}`),
  generate: (data: any) => api.post('/invoices/generate', data),
  update: (id: string, data: any) => api.patch(`/invoices/${id}`, data),
  send: (id: string) => api.patch(`/invoices/${id}/send`),
  markPaid: (id: string) => api.patch(`/invoices/${id}/mark-paid`),
};
