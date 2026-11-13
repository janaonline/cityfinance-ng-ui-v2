import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';

export enum DashboardType {
  RT_MUNICIPAL_FINANCE = 'RT_MUNICIPAL_FINANCE',
}

export interface DashboardFilterDefinition {
  /** Superset native filter id. */
  id: string;
  /** Dataset column the filter applies to. */
  column: string;
}

export interface DashboardDetails {
  type: DashboardType;
  id: string;
  stateFilter: DashboardFilterDefinition;
  cityFilter: DashboardFilterDefinition;
}

export const STATE_FILTER_ID = 'NATIVE_FILTER-pCAm0if1nzN1VBrxZVQ4F';
export const CITY_FILTER_ID = 'NATIVE_FILTER-VWBeSKEeNKUebb3-ncLDI';

export const DASHBOARD_REGISTRY: Record<DashboardType, DashboardDetails> = {
  [DashboardType.RT_MUNICIPAL_FINANCE]: {
    type: DashboardType.RT_MUNICIPAL_FINANCE,
    id: '001526de-2c53-4f5d-aef4-b6ab2f93c3cd',
    stateFilter: { id: STATE_FILTER_ID, column: 'state' },
    // The City filter is backed by the dataset's `ulb` column (ULB name).
    cityFilter: { id: CITY_FILTER_ID, column: 'ulb' },
  },
};

export type DalgoRole = 'MOHUA' | 'STATE' | 'ULB';

export interface RoleFilterPolicy {
  /**
   * The Embedded SDK can only show/hide the whole filter bar, not individual filters,
   * so restricted roles get the bar hidden and their values pre-applied.
   */
  showFilterBar: boolean;
  applyState: boolean;
  applyCity: boolean;
}

export const ROLE_FILTER_POLICY: Record<DalgoRole, RoleFilterPolicy> = {
  MOHUA: { showFilterBar: true, applyState: false, applyCity: false },
  STATE: { showFilterBar: false, applyState: true, applyCity: false },
  ULB: { showFilterBar: false, applyState: true, applyCity: true },
};

export interface AppliedFilter extends DashboardFilterDefinition {
  value: string;
}

export type FilterResolution =
  | { ok: true; role: DalgoRole; showFilterBar: boolean; filters: AppliedFilter[] }
  | { ok: false; reason: string };

/** Same case-insensitive role matching as the xvi-fc-module routes (`xvi-fc-module.routes.ts`). */
export function resolveDalgoRole(role: string | undefined | null): DalgoRole | null {
  switch ((role ?? '').toUpperCase()) {
    case 'MOHUA':
      return 'MOHUA';
    case 'STATE':
    case 'XVIFC_STATE':
      return 'STATE';
    case 'ULB':
    case 'XVIFC':
      return 'ULB';
    default:
      return null;
  }
}

function clean(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return text === 'undefined' || text === 'null' ? '' : text;
}

/** States for which the municipal finance data currently exists (State and ULB roles only). */
export const DALGO_ENABLED_STATES: readonly string[] = ['Andhra Pradesh', 'Telangana', 'Kerala'];

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();
const ENABLED_STATE_KEYS = new Set(DALGO_ENABLED_STATES.map(normalizeName));

/**
 * Whether the Data Hub should be offered to this user. MoHUA always sees it (its filter bar only
 * lists states that have data); State/ULB users only when their own state has data.
 */
export function isDalgoAvailable(user: IUserLoggedInDetails | null): boolean {
  const role = resolveDalgoRole(user?.role);
  if (!user || !role) return false;
  if (role === 'MOHUA') return true;

  const stateName = clean((user as IUserLoggedInDetails & { stateName?: string }).stateName);
  return !!stateName && ENABLED_STATE_KEYS.has(normalizeName(stateName));
}

/**
 * Derives the role-specific filters from the logged-in user's profile
 * (`stateName` for State users, `name` + `stateName` for ULB users).
 * Fails closed when a mandatory value is missing so an unrestricted dashboard is never loaded.
 */
export function resolveDashboardFilters(
  user: IUserLoggedInDetails | null,
  dashboard: DashboardDetails,
): FilterResolution {
  const role = resolveDalgoRole(user?.role);
  if (!user || !role) {
    return { ok: false, reason: 'Your account does not have access to this dashboard.' };
  }

  const policy = ROLE_FILTER_POLICY[role];
  const hasStateName = !!clean((user as IUserLoggedInDetails & { stateName?: string }).stateName);
  if (role !== 'MOHUA' && hasStateName && !isDalgoAvailable(user)) {
    return { ok: false, reason: 'Data Hub is not available for your state yet.' };
  }
  const profile = user as IUserLoggedInDetails & { stateName?: string };
  const filters: AppliedFilter[] = [];

  if (policy.applyState) {
    const stateName = clean(profile.stateName);
    if (!stateName) {
      return { ok: false, reason: 'Your state could not be determined from your profile.' };
    }
    filters.push({ ...dashboard.stateFilter, value: stateName });
  }

  if (policy.applyCity) {
    const ulbName = clean(user.name);
    if (!ulbName) {
      return { ok: false, reason: 'Your ULB could not be determined from your profile.' };
    }
    filters.push({ ...dashboard.cityFilter, value: ulbName });
  }

  return { ok: true, role, showFilterBar: policy.showFilterBar, filters };
}
