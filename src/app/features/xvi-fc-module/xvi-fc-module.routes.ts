import { CanActivateFn, CanMatchFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';

function readUserRole(): string {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? ((JSON.parse(raw) as { role?: string }).role ?? '') : '';
  } catch {
    return '';
  }
}

function readXvifcUserState(): { role: string; isXVIFCProfileVerified: boolean } {
  try {
    const raw = localStorage.getItem('userData');
    if (raw) {
      const user = JSON.parse(raw) as { role?: string; isXVIFCProfileVerified?: boolean };
      return {
        role: user.role ?? '',
        // Mirror the two-source check in ProfileVerificationComponent.isAlreadyVerified()
        isXVIFCProfileVerified:
          localStorage.getItem('isXVIFCProfileVerified') === 'true' ||
          user.isXVIFCProfileVerified === true,
      };
    }
  } catch {
    /* ignore parse errors */
  }
  return { role: '', isXVIFCProfileVerified: false };
}

/**
 * Extracts the yearId segment from a /xvifc/:yearId/... URL so the guard can
 * forward it to the profile-verify page as a query param, enabling the
 * component to navigate back to the correct context after verification.
 */
function extractYearIdFromUrl(url: string): string {
  const path = url.split('?')[0];
  const segments = path.split('/');
  const xvifcIdx = segments.indexOf('xvifc');
  if (xvifcIdx < 0) return '';
  const candidate = segments[xvifcIdx + 1] ?? '';
  // Exclude sibling utility routes — only real yearIds should be forwarded.
  if (!candidate || candidate === 'profile-verify' || candidate === 'year') return '';
  return candidate;
}

function isUlbUserRole(role: string): boolean {
  const r = role.toUpperCase();
  return r === 'ULB' || r === 'XVIFC' || r.startsWith('ULB-');
}

function isStateUserRole(role: string): boolean {
  const r = role.toUpperCase();
  return r === 'STATE' || r === 'XVIFC_STATE' || r.startsWith('STATE-');
}

const isUlbRole: CanMatchFn = () => isUlbUserRole(readUserRole());
const isStateRole: CanMatchFn = () => isStateUserRole(readUserRole());
const isMohuaRole: CanMatchFn = () => readUserRole() === 'MoHUA';
const isAdminRole: CanMatchFn = () => readUserRole().toUpperCase() === 'ADMIN';

/**
 * Lock 2 for XVI-FC routes: ensures the user has completed XVI-FC profile
 * verification before accessing any main portal content.
 *
 * MoHUA and ADMIN roles have platform-wide access and bypass this check.
 * The `year` and `profile-verify` sibling routes deliberately omit this guard
 * to prevent redirect loops.
 *
 * Lock 1 (authentication) is handled by `xvifcAuthGuard` on the parent
 * `/xvifc` route in app.routes.ts.
 */
const xvifcProfileVerifiedGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const { role, isXVIFCProfileVerified } = readXvifcUserState();

  // MoHUA and ADMIN have global platform access — skip profile verification.
  const normalizedRole = role.toUpperCase();
  if (normalizedRole === 'MOHUA' || normalizedRole === 'ADMIN') {
    return true;
  }

  if (isXVIFCProfileVerified) {
    return true;
  }

  // Forward yearId so profile-verify can navigate back to the correct year
  // context after the user completes verification.
  const yearId = extractYearIdFromUrl(state.url);
  return router.createUrlTree(
    ['/xvifc', 'profile-verify'],
    yearId ? { queryParams: { year: yearId } } : undefined,
  );
};

export const XVIFC_ROUTES: Routes = [
  {
    path: 'year',
    loadComponent: () =>
      import('./shared/years-selection/years-selection.component').then(
        (m) => m.YearsSelectionComponent,
      ),
  },
  {
    path: 'profile-verify',
    loadComponent: () =>
      import('./shared/profile-verification/profile-verification.component').then(
        (m) => m.ProfileVerificationComponent,
      ),
  },
  {
    path: '',
    loadComponent: () => import('./xvi-fc-module.component').then((m) => m.XviFcModuleComponent),
    canActivate: [xvifcProfileVerifiedGuard],
    children: [
      {
        path: ':yearId',
        canMatch: [isUlbRole],
        data: { role: 'ULB' },
        loadChildren: () => import('./ulb-module/ulb-module.routes').then((m) => m.ULB_ROUTES),
      },
      {
        path: ':yearId',
        canMatch: [isStateRole],
        data: { role: 'STATE' },
        loadChildren: () =>
          import('./state-module/state-module.routes').then((m) => m.STATE_ROUTES),
      },
      {
        path: ':yearId',
        canMatch: [isMohuaRole],
        data: { role: 'MOHUA' },
        loadChildren: () =>
          import('./mohua-module/mohua-module.routes').then((m) => m.MOHUA_ROUTES),
      },
      // Authenticated user with unsupported role, or unknown child path
      {
        path: ':yearId',
        canMatch: [isAdminRole],
        data: { role: 'ADMIN' },
        loadChildren: () =>
          import('./admin-module/admin-module.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: '**',
        redirectTo: '/xvifc/year',
      },
    ],
  },
  // Unknown top-level path inside /xvifc
  {
    path: '**',
    redirectTo: '/xvifc/year',
  },
];
