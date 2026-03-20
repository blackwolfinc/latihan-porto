export interface PlanLimits {
  maxCars: number;
  maxMotorcycles: number;
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
    maxCars: 3,
    maxMotorcycles: 5,
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
    maxCars: 50,
    maxMotorcycles: 100,
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
    maxCars: Infinity,
    maxMotorcycles: Infinity,
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
