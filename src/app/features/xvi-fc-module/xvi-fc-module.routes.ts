import { Routes } from '@angular/router';

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
    path: '',
    loadComponent: () => import('./xvi-fc-module.component').then((m) => m.XviFcModuleComponent),
    children: [
      {
        path: 'ulb/:yearId',
        data: { role: 'ULB' },
        loadChildren: () => import('./ulb-module/ulb-module.routes').then((m) => m.ULB_ROUTES),
      },
      {
        path: 'state/:yearId',
        data: { role: 'STATE' },
        loadChildren: () =>
          import('./state-module/state-module.routes').then((m) => m.STATE_ROUTES),
      },
      {
        path: 'mohua/:yearId',
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
