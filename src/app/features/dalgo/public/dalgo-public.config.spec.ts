import { PublicDashboardType, getPublicDashboard } from './dalgo-public.config';

describe('public dashboards', () => {
  it('resolves each public page type to its Superset dashboard id', () => {
    const expected: Record<string, string> = {
      market_readiness: 'd8eb1ef2-d91c-40f3-b81e-8f8ed92455b5',
      ap_dashboard: '137e753c-21b4-4d4f-a0a0-a80b3cbd2a52',
      nmam_city_response_dashboard: '0018e5ef-f45c-4cdf-a937-80f12c035c44',
      rt_municipal_finance_dashboard: '001526de-2c53-4f5d-aef4-b6ab2f93c3cd',
    };
    for (const [slug, id] of Object.entries(expected)) {
      expect(getPublicDashboard(slug)?.id).toBe(id);
    }
    expect((Object.values(PublicDashboardType) as string[]).sort()).toEqual(Object.keys(expected).sort());
  });

  it('returns null for an unknown or missing page type', () => {
    expect(getPublicDashboard('nope')).toBeNull();
    expect(getPublicDashboard('toString')).toBeNull();
    expect(getPublicDashboard(null)).toBeNull();
    expect(getPublicDashboard('')).toBeNull();
  });
});
