export interface PlanLimits {
  maxVehicles: number;
  maxBranches: number;
  features: {
    gpsTracking: boolean;
    advancedReports: boolean;
    automation: boolean;
    removeAds: boolean;
    removeWatermark: boolean;
  };
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxVehicles: 10,
    maxBranches: 1,
    features: {
      gpsTracking: false,
      advancedReports: false,
      automation: false,
      removeAds: false,
      removeWatermark: false,
    },
  },
  STANDARD: {
    maxVehicles: 50,
    maxBranches: 3,
    features: {
      gpsTracking: false,
      advancedReports: false,
      automation: false,
      removeAds: true,
      removeWatermark: true,
    },
  },
  PREMIUM: {
    maxVehicles: Infinity,
    maxBranches: Infinity,
    features: {
      gpsTracking: true,
      advancedReports: true,
      automation: true,
      removeAds: true,
      removeWatermark: true,
    },
  },
};

export type PlanFeature = keyof PlanLimits['features'];
