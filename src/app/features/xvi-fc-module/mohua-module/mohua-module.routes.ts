import { Routes } from '@angular/router';

export const MOHUA_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./mohua-module.component').then((m) => m.MohuaModuleComponent),
  },
  // {
  //   path: 'ulb-submissions',
  //   loadComponent: () =>
  //     import('./review-ulb-submissions/review-ulb-submissions.component').then(
  //       (m) => m.ReviewUlbSubmissionsComponent,
  //     ),
  // },
  {
    path: 'review-state-submissions',
    loadComponent: () =>
      import('./review-state-submissions/review-state-submissions.component').then(
        (m) => m.ReviewStateSubmissionsComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '/xvifc',
  },
];
