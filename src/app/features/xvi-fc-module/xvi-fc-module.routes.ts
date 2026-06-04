import { CanMatchFn, Routes } from '@angular/router';

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

export const XVIFC_ROUTES: Routes = [
  {
    path: 'year',
    pathMatch: 'full',
    loadComponent: () =>
      import('./shared/years-selection/years-selection.component').then(
        (m) => m.YearsSelectionComponent,
      ),
  },
  {
    path: 'profile-verify',
    pathMatch: 'full',
    loadComponent: () =>
      import('./shared/profile-verification/profile-verification.component').then(
        (m) => m.ProfileVerificationComponent,
      ),
  },
  {
    path: '',
    loadComponent: () => import('./xvi-fc-module.component').then((m) => m.XviFcModuleComponent),
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
      {
        path: ':yearId',
        canMatch: [isAdminRole],
        data: { role: 'ADMIN' },
        loadChildren: () =>
          import('./admin-module/admin-module.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
