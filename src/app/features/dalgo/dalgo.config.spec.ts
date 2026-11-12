import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { buildNativeFilters, toRisonString } from './dalgo-filters.util';
import {
  CITY_FILTER_ID,
  DASHBOARD_REGISTRY,
  DashboardType,
  STATE_FILTER_ID,
  isDalgoAvailable,
  resolveDalgoRole,
  resolveDashboardFilters,
} from './dalgo.config';

const dashboard = DASHBOARD_REGISTRY[DashboardType.RT_MUNICIPAL_FINANCE];
const user = (fields: Record<string, unknown>) => fields as unknown as IUserLoggedInDetails;

describe('dalgo role filters', () => {
  it('maps xvifc role variants', () => {
    expect(resolveDalgoRole('MoHUA')).toBe('MOHUA');
    expect(resolveDalgoRole('XVIFC_STATE')).toBe('STATE');
    expect(resolveDalgoRole('XVIFC')).toBe('ULB');
    expect(resolveDalgoRole('ADMIN')).toBeNull();
  });

  it('MoHUA: filter bar visible, nothing pre-applied', () => {
    const r = resolveDashboardFilters(user({ role: 'MoHUA', name: 'x' }), dashboard);
    expect(r).toEqual({ ok: true, role: 'MOHUA', showFilterBar: true, filters: [] });
  });

  it('State: applies stateName to the state filter only, bar hidden', () => {
    const r = resolveDashboardFilters(user({ role: 'STATE', name: 'Fc state', stateName: 'Telangana' }), dashboard);
    expect(r).toEqual({
      ok: true,
      role: 'STATE',
      showFilterBar: false,
      filters: [{ id: STATE_FILTER_ID, column: 'state', value: 'Telangana' }],
    });
  });

  it('ULB: applies state and ULB name (not interchangeable), bar hidden', () => {
    const r = resolveDashboardFilters(
      user({ role: 'ULB', name: 'Greater Hyderabad Municipal Corporation', stateName: 'Telangana' }),
      dashboard,
    );
    expect(r).toEqual({
      ok: true,
      role: 'ULB',
      showFilterBar: false,
      filters: [
        { id: STATE_FILTER_ID, column: 'state', value: 'Telangana' },
        { id: CITY_FILTER_ID, column: 'ulb', value: 'Greater Hyderabad Municipal Corporation' },
      ],
    });
  });

  it('fails closed when mandatory values are missing', () => {
    expect(resolveDashboardFilters(user({ role: 'STATE', stateName: ' ' }), dashboard).ok).toBeFalse();
    expect(resolveDashboardFilters(user({ role: 'ULB', name: 'Pune' }), dashboard).ok).toBeFalse();
    expect(resolveDashboardFilters(user({ role: 'ULB', stateName: 'MH' }), dashboard).ok).toBeFalse();
    expect(resolveDashboardFilters(null, dashboard).ok).toBeFalse();
  });
});

describe('native filter builder', () => {
  it('escapes Rison special characters', () => {
    expect(toRisonString("Hari's!")).toBe("'Hari!'s!!'");
  });

  it('returns empty string with no filters', () => {
    expect(buildNativeFilters([])).toBe('');
  });

  it('builds the single-line native filter expression', () => {
    const out = buildNativeFilters([{ id: 'F1', column: 'state', value: 'Goa' }]);
    expect(out).toBe(
      "(F1:(__cache:(label:'Goa',validateStatus:!f,value:!('Goa')),extraFormData:(filters:!((col:state,op:IN,val:!('Goa')))),filterState:(label:'Goa',validateStatus:!f,value:!('Goa')),id:F1,ownState:()))",
    );
  });
});

describe('Data Hub availability', () => {
  it('is available to MoHUA regardless of state', () => {
    expect(isDalgoAvailable(user({ role: 'MoHUA' }))).toBeTrue();
  });

  it('is available to State and ULB users of Andhra Pradesh, Telangana and Kerala', () => {
    for (const stateName of ['Andhra Pradesh', 'Telangana', ' kerala ', 'ANDHRA  PRADESH']) {
      expect(isDalgoAvailable(user({ role: 'STATE', stateName }))).toBeTrue();
      expect(isDalgoAvailable(user({ role: 'ULB', name: 'X', stateName }))).toBeTrue();
    }
  });

  it('is unavailable to State and ULB users of other states or without a state', () => {
    expect(isDalgoAvailable(user({ role: 'STATE', stateName: 'Maharashtra' }))).toBeFalse();
    expect(isDalgoAvailable(user({ role: 'ULB', name: 'Pune', stateName: 'Maharashtra' }))).toBeFalse();
    expect(isDalgoAvailable(user({ role: 'STATE' }))).toBeFalse();
    expect(isDalgoAvailable(user({ role: 'ADMIN', stateName: 'Kerala' }))).toBeFalse();
    expect(isDalgoAvailable(null)).toBeFalse();
  });

  it('blocks the dashboard for a state without data', () => {
    const r = resolveDashboardFilters(user({ role: 'STATE', stateName: 'Maharashtra' }), dashboard);
    expect(r).toEqual({ ok: false, reason: 'Data Hub is not available for your state yet.' });
  });
});
