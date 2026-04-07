// TODO: Add mongoDB IDs?
export const YEAR_IDS = ['2026-27', '2027-28', '2028-29', '2029-30'] as const;
export type XvifcYearId = (typeof YEAR_IDS)[number];

type XvifcRolePath = 'ulb' | 'state' | 'mohua' | 'doe';
export const ROLES = ['ULB', 'STATE', 'MOHUA', 'DOE'] as const;
export type Roles = (typeof ROLES)[number];
export const XVIFC_LANDING_ROUTE = ['/xvifc'] as const;

export const XVIFC_ROLE_PATHS: Record<Roles, XvifcRolePath> = {
  ULB: 'ulb',
  STATE: 'state',
  MOHUA: 'mohua',
  DOE: 'doe',
};

export const buildXvifcFeatureLink = (
  role: Roles,
  yearId: XvifcYearId,
  ...segments: string[]
): string[] => ['/xvifc', XVIFC_ROLE_PATHS[role], yearId, ...segments];
