import { Routes } from '@angular/router';

export const ULB_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ulb-module.component').then((m) => m.UlbModuleComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: '**',
        redirectTo: '/xvifc',
      },
    ],
  },
];
