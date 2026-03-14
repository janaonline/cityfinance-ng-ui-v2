import { Routes } from '@angular/router';

export const MOHUA_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./mohua-module.component').then((m) => m.MohuaModuleComponent),
  },
  {
    path: '**',
    redirectTo: '/xvifc',
  },
];
