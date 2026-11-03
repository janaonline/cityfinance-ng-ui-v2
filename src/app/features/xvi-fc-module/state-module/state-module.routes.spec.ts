import { ACTIVE_STATE_CHILD_ROUTES } from './state-module.routes';
import { StateDashboardComponent } from './state-dashboard/state-dashboard.component';
import { RegisterUlbComponent } from './ulb-list/register-ulb/register-ulb.component';

describe('state-module.routes — register-ulb', () => {
  it('registers a "register-ulb" child route', () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'register-ulb');
    expect(route).toBeTruthy();
  });

  it('"/xvifc/:yearId/register-ulb" resolves to RegisterUlbComponent', async () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'register-ulb');
    const loaded = await route?.loadComponent?.();
    expect(loaded).toBe(RegisterUlbComponent);
  });

  it('registers a "dashboard" child route', () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'dashboard');
    expect(route).toBeTruthy();
  });

  it('"/xvifc/:yearId/dashboard" resolves to StateDashboardComponent', async () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'dashboard');
    const loaded = await route?.loadComponent?.();
    expect(loaded).toBe(StateDashboardComponent);
  });
});

describe('state-module.routes — adc-teams', () => {
  it('registers an "adc-teams" route for the State admin, wired to the ADC selector config', () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'adc-teams');
    expect(route).toBeTruthy();
    expect(route?.data?.['rolesConfig']?.adcSelector).toBeTrue();
  });

  it('keeps "People and Roles" highlighted in the sidebar, since ADC Teams has no entry of its own', () => {
    const route = ACTIVE_STATE_CHILD_ROUTES.find((r) => r.path === 'adc-teams');
    expect(route?.data?.['menuGroup']).toBe('roles-teams-unified-view');
  });
});
