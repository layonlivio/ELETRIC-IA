// Planos do aplicativo
export type PlanType = 'normal' | 'pro';
export type PeriodType = 'monthly' | 'yearly';

export interface PlanFeatures {
  max_projects: number;
  max_circuits_per_project: number;
  ai_enabled: boolean;
  pdf_enabled: boolean;
  whatsapp_enabled: boolean;
  materials_list: boolean;
  budget: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  normal: {
    max_projects: 3,
    max_circuits_per_project: 5,
    ai_enabled: false,
    pdf_enabled: false,
    whatsapp_enabled: false,
    materials_list: true,
    budget: false,
  },
  pro: {
    max_projects: 100,
    max_circuits_per_project: 100,
    ai_enabled: true,
    pdf_enabled: true,
    whatsapp_enabled: true,
    materials_list: true,
    budget: true,
  },
};

export const PLAN_PRICES: Record<PlanType, Record<PeriodType, number>> = {
  normal: { monthly: 0, yearly: 0 },
  pro: { monthly: 29.9, yearly: 299.9 },
};

export function isFeatureAvailable(plan: PlanType, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan][feature] as boolean;
}

export function canCreateProject(plan: PlanType, currentCount: number): boolean {
  return currentCount < PLAN_FEATURES[plan].max_projects;
}

export function canAddCircuit(plan: PlanType, currentCount: number): boolean {
  return currentCount < PLAN_FEATURES[plan].max_circuits_per_project;
}
