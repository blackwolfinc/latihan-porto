import api from './api';

export const invoiceTemplatesService = {
  get: () => api.get('/invoice-templates/current'),
  update: (data: any) => api.put('/invoice-templates/current', data),
  updateLogo: (logoUrl: string) => api.patch('/invoice-templates/current/logo', { logoUrl }),
  updateSignature: (data: any) => api.patch('/invoice-templates/current/signature', data),
  updateBank: (data: any) => api.patch('/invoice-templates/current/bank', data),
  preview: () => api.get('/invoice-templates/preview'),
};
