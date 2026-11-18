import { MOHUA_CLAIMS_READ_ROUTES, MOHUA_DASHBOARD_ROUTES } from '../mohua-module/mohua-module.routes';
import { PMU_ROUTES } from './pmu-module.routes';

describe('PMU_ROUTES', () => {
  const children = PMU_ROUTES[0].children ?? [];
  const paths = children.map((r) => r.path);

  it('reuses every MoHUA dashboard route, so the PMU Overview is the MoHUA dashboard', () => {
    for (const route of MOHUA_DASHBOARD_ROUTES) {
      expect(children).toContain(route);
    }
  });

  it('keeps PMU’s own worklist and actionable review pages alongside it', () => {
    expect(paths).toContain('review-state-submissions');
    expect(paths).toContain('elected-body-review/:stateId');
    expect(paths).toContain('roles-teams-unified-view');
  });

  it('lets PMU monitor Claims & Submissions and the OM history, but not generate an OM', () => {
    for (const route of MOHUA_CLAIMS_READ_ROUTES) {
      expect(children).toContain(route);
    }
    expect(paths).toContain('claims-submission/:stateId/letter/:claimLetterId');
    expect(paths).toContain('om-history');
    expect(paths).not.toContain('om-generation');
    expect(paths).not.toContain('om-generation/letter/:claimLetterId');
  });

  it('has a single overview route (the dashboard one, no leftover placeholder)', () => {
    expect(paths.filter((p) => p === 'overview').length).toBe(1);
  });
});
