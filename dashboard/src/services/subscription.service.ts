import api from './api';

export const subscriptionService = {
  getPlan: (organizationId: string) =>
    api.get(`/subscription/plan`, { params: { organizationId } }),

  getUsage: (organizationId: string) =>
    api.get(`/subscription/usage`, { params: { organizationId } }),

  getLimits: () =>
    api.get(`/subscription/limits`),

  upgrade: (organizationId: string, plan: string) =>
    api.post(`/subscription/upgrade`, { organizationId, plan }),
};
