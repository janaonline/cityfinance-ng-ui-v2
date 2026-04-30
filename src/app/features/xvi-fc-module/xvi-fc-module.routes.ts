import { CanMatchFn, Routes } from '@angular/router';

const ULB_ROLES = new Set(['ULB', 'XVIFC']);
const STATE_ROLES = new Set(['STATE', 'XVIFC_STATE']);
const MOHUA_ROLES = new Set(['MoHUA']);

function readUserRole(): string {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? ((JSON.parse(raw) as { role?: string }).role ?? '') : '';
  } catch {
    return '';
  }
}

const isUlbRole: CanMatchFn = () => ULB_ROLES.has(readUserRole());
const isStateRole: CanMatchFn = () => STATE_ROLES.has(readUserRole());
const isMohuaRole: CanMatchFn = () => MOHUA_ROLES.has(readUserRole());

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
        path: ':entityId/:yearId',
        canMatch: [isUlbRole],
        data: { role: 'ULB' },
        loadChildren: () => import('./ulb-module/ulb-module.routes').then((m) => m.ULB_ROUTES),
      },
      {
        path: ':entityId/:yearId',
        canMatch: [isStateRole],
        data: { role: 'STATE' },
        loadChildren: () =>
          import('./state-module/state-module.routes').then((m) => m.STATE_ROUTES),
      },
      {
        path: ':entityId/:yearId',
        canMatch: [isMohuaRole],
        data: { role: 'MOHUA' },
        loadChildren: () =>
          import('./mohua-module/mohua-module.routes').then((m) => m.MOHUA_ROUTES),
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
