import { CanMatchFn, Routes } from '@angular/router';
import { provideMaterialThemeScope } from '../../core/theming/material-theme.providers';
import { XVIFC_THEME_CLASS } from './xvi-fc-module.constants';
// TEMP — see ulb-forms-coming-soon.guard.ts for removal instructions.
import { ulbFormsComingSoonGuard } from './ulb-module/guards/ulb-forms-coming-soon.guard';

function readUserRole(): string {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? ((JSON.parse(raw) as { role?: string }).role ?? '') : '';
  } catch {
    return '';
  }
}

function isUlbUserRole(role: string): boolean {
  const r = role.toUpperCase();
  return r === 'ULB' || r === 'XVIFC';
}

function isStateUserRole(role: string): boolean {
  const r = role.toUpperCase();
  return r === 'STATE' || r === 'XVIFC_STATE';
}

const isUlbRole: CanMatchFn = () => isUlbUserRole(readUserRole());
const isStateRole: CanMatchFn = () => isStateUserRole(readUserRole());
const isMohuaRole: CanMatchFn = () => readUserRole().toUpperCase() === 'MOHUA';
const isAdminRole: CanMatchFn = () => readUserRole().toUpperCase() === 'ADMIN';

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
    /**
     * XviFcModuleComponent scopes MATERIAL_THEME_CLASS via @Component({ providers }), but that only covers the component tree.
     * Route guards like unsavedChangesGuard.canDeactivate use the router’s environment injector, which only sees route-level providers.
     * Declaring it here lets the guard’s inject() resolve the xvifc theme for its dialogs.
     **/
    providers: [...provideMaterialThemeScope(XVIFC_THEME_CLASS)],
    children: [
      {
        path: ':yearId',
        // TEMP: ulbFormsComingSoonGuard — remove this entry once ULB forms launch (see guard file).
        canMatch: [isUlbRole, ulbFormsComingSoonGuard],
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
