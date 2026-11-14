/**
 * TS-1262 — Municipal Data Hub is visible to MoHUA always, and to ULB/State users only in the
 * four pilot states (Andhra Pradesh, Kerala, Odisha, Telangana).
 *
 * The backend resolves the state name as a *sibling* field, `stateName` — not nested under
 * `state` (which stays the raw ObjectID) — see `buildUserResponsePayload` in cf-nest-api-v2 and
 * `IUserLoggedInDetails.stateName`. `auth/login` and `auth/refresh` already returned this; `auth/me`
 * was patched to include it too as part of this same dependency.
 */
export const MUNICIPAL_DATA_HUB_STATES = ['Andhra Pradesh', 'Kerala', 'Odisha', 'Telangana'] as const;

export function resolveUserStateName(user: unknown): string | null {
  const stateName = (user as { stateName?: unknown } | null)?.stateName;
  return typeof stateName === 'string' ? stateName : null;
}

export function isEligibleForMunicipalDataHub(role: string | null, user: unknown): boolean {
  if (role === 'MoHUA') return true;
  if (role !== 'ULB' && role !== 'STATE') return false;

  const stateName = resolveUserStateName(user);
  if (!stateName) return false;

  return MUNICIPAL_DATA_HUB_STATES.some((state) => state.toLowerCase() === stateName.toLowerCase());
}
