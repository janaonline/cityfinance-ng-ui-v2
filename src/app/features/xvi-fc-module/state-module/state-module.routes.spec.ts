import { ACTIVE_STATE_CHILD_ROUTES } from './state-module.routes';
import { RegisterUlbComponent } from './register-ulb/register-ulb.component';

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
});
