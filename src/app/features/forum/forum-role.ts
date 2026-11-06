/** Sentence-case display labels for the backend role codes (`Role` enum in cf-nest-api-v2). */
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MoHUA: 'MoHUA',
  STATE: 'State',
  XVIFC_STATE: 'State',
  'STATE-EDITOR': 'State',
  'STATE-VIEWER': 'State',
  ULB: 'ULB',
  'ULB-EDITOR': 'ULB',
  'ULB-VIEWER': 'ULB',
  PARTNER: 'Partner',
  USER: 'User',
};

/** Role badge label, e.g. "STATE" -> "State". Unknown codes are shown as-is. */
export function formatRole(role: string | null | undefined): string {
  if (!role) return '';
  return ROLE_LABELS[role] ?? role;
}
