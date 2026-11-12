import { ADC_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';
import { ADC_ROUTES } from './adc-module.routes';
import { AdcOverviewComponent } from './overview/adc-overview.component';

describe('ADC_ROUTES', () => {
  const children = ADC_ROUTES[0].children ?? [];
  const paths = children.map((r) => r.path);

  it('exposes only the ADC pages: overview, ULB review, ULB list / Register ULB, team, support and FAQ', () => {
    expect(paths).toEqual([
      '',
      'overview',
      'ulb-submissions',
      'ulb-submissions/:ulbId/review',
      'register-ulb',
      'ulb-list',
      'roles-teams-unified-view',
      'support-hours',
      'faq',
      '**',
    ]);
  });

  it('has no State-level form or claim-letter route, so a direct link falls through to the overview', () => {
    ['claim-letter', 'sfc-status', 'gtc', 'elected-body-status', 'ulb-wise-allocation', 'fc-unspent-declaration', 'dashboard', 'adc-teams'].forEach(
      (path) => expect(paths).not.toContain(path),
    );
    expect(children.find((r) => r.path === '**')?.redirectTo).toBe('overview');
  });

  it('"overview" resolves to AdcOverviewComponent', async () => {
    const loaded = await children.find((r) => r.path === 'overview')?.loadComponent?.();
    expect(loaded).toBe(AdcOverviewComponent);
  });

  it('the team page is the ADC admin config, not the State one', () => {
    expect(children.find((r) => r.path === 'roles-teams-unified-view')?.data?.['rolesConfig']).toBe(ADC_ROLES_CONFIG);
  });
});
