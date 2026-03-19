import api from './api';

export interface CustomerVerification {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  ktpNumber?: string;
  ktpName?: string;
  ktpAddress?: string;
  ktpPhotoUrl?: string;
  ktpVerified: boolean;
  simNumber?: string;
  simType?: string;
  simExpiryDate?: string;
  simPhotoUrl?: string;
  simVerified: boolean;
  selfiePhotoUrl?: string;
  verificationStatus: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  riskScore: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBlacklistItem {
  id: string;
  ktpNumber?: string;
  simNumber?: string;
  name: string;
  phone?: string;
  reason: string;
  description: string;
  reportedBy: string;
  reporter?: { id: string; name: string };
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const verificationService = {
  // Verification endpoints
  getVerifications(params?: { page?: number; limit?: number; status?: string }) {
    return api.get('/verification/list', { params });
  },

  getPendingVerifications(params?: { page?: number; limit?: number }) {
    return api.get('/verification/pending', { params });
  },

  reviewVerification(id: string, data: { approved: boolean; rejectionReason?: string }) {
    return api.patch(`/verification/${id}/review`, data);
  },

  preBookingCheck(customerId: string) {
    return api.get(`/verification/pre-booking-check/${customerId}`);
  },

  // Blacklist endpoints
  getBlacklist(params?: { page?: number; limit?: number }) {
    return api.get('/verification/blacklist', { params });
  },

  addToBlacklist(data: {
    ktpNumber?: string;
    simNumber?: string;
    name: string;
    phone?: string;
    reason: string;
    description: string;
    expiresAt?: string;
  }) {
    return api.post('/verification/blacklist', data);
  },

  removeFromBlacklist(id: string) {
    return api.delete(`/verification/blacklist/${id}`);
  },

  checkBlacklist(params?: { ktpNumber?: string; simNumber?: string }) {
    return api.get('/verification/blacklist/check', { params });
  },
};
