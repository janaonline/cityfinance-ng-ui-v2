export type XvifcYearId = string;

export const ROLES = ['ULB', 'STATE', 'MOHUA', 'DOE', 'ADMIN', 'MOHUA_PMU', 'STATE_ADC'] as const;
export type Roles = (typeof ROLES)[number];
export const XVIFC_LANDING_ROUTE = ['/xvifc'] as const;

export const buildXvifcFeatureLink = (
  _role: Roles,
  _entityId: string,
  yearId: XvifcYearId,
  ...segments: string[]
): string[] => {
  return ['/xvifc', yearId, ...segments];
};
