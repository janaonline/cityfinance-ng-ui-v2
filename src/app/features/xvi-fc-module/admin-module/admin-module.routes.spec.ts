import { ADMIN_ROUTES } from './admin-module.routes';
import { AdcListComponent } from './adc/adc-list.component';
import { AdcDetailComponent } from './adc/adc-detail/adc-detail.component';

describe('admin-module.routes - adc', () => {
  const children = ADMIN_ROUTES[0].children ?? [];

  it('registers the ADC page right after ULB Registration', () => {
    const paths = children.map((r) => r.path);
    expect(paths.indexOf('adc')).toBe(paths.indexOf('ulb-list') + 1);
  });

  it('"/xvifc/:yearId/adc" resolves to AdcListComponent', async () => {
    const route = children.find((r) => r.path === 'adc');
    const loaded = await route?.loadComponent?.();
    expect(loaded).toBe(AdcListComponent);
  });

  it('"/xvifc/:yearId/adc/:id" resolves to AdcDetailComponent and keeps the ADC menu item active', async () => {
    const route = children.find((r) => r.path === 'adc/:id');
    expect(route?.data?.['menuGroup']).toBe('adc');
    expect(await route?.loadComponent?.()).toBe(AdcDetailComponent);
  });
});
