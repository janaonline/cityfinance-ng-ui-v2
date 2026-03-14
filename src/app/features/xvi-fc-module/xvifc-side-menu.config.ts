type XvifcRolePath = 'ulb' | 'state' | 'mohua' | 'doe';
export const ROLES = ['ULB', 'STATE', 'MOHUA', 'DOE'] as const;
export type Roles = (typeof ROLES)[number];

export const XVIFC_DEFAULT_ROLE: Roles = 'ULB';
export const XVIFC_DEFAULT_YEAR_ID = 'current';

export const XVIFC_ROLE_PATHS: Record<Roles, XvifcRolePath> = {
  ULB: 'ulb',
  STATE: 'state',
  MOHUA: 'mohua',
  DOE: 'doe',
};

export const buildXvifcFeatureLink = (
  role: Roles,
  yearId: string,
  ...segments: string[]
): string[] => ['/xvifc', XVIFC_ROLE_PATHS[role], yearId, ...segments];
