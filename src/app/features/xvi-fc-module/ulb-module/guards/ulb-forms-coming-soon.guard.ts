import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

// ============================================================================
// TEMP — 16th FC ULB "forms coming soon" gate.
// Added 2026-08-26. Meant to live only a few days, until ULB forms actually launch.
// To remove: delete this file, remove its import/usage from xvi-fc-module.routes.ts,
// and delete shared/ulb-forms-coming-soon/ (component) + its route in app.routes.ts.
// ============================================================================

const COMING_SOON_PATH = ['/xvifc-forms-coming-soon'];

/** ULB accounts created in 2026 don't have forms available yet — send them to a static page
 *  instead of into the ULB module (overview and every other ULB route). */
export const ulbFormsComingSoonGuard: CanMatchFn = () => {
  const router = inject(Router);

  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return true;
    const user = JSON.parse(raw) as { role?: string; createdAt?: string };

    const isPending = user.role === 'ULB' && !!user.createdAt && new Date(user.createdAt).getFullYear() === 2026;

    return isPending ? router.createUrlTree(COMING_SOON_PATH) : true;
  } catch {
    return true;
  }
};
