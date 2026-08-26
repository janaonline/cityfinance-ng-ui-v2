import { Routes } from '@angular/router';
import { MOHUA_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';

export const MOHUA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./mohua-module.component').then((m) => m.MohuaModuleComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.component').then((m) => m.MohuaOverviewComponent),
      },
      {
        path: 'roles-teams-unified-view',
        loadComponent: () =>
          import('../shared/roles-teams-overview/roles-teams-overview.component').then(
            (m) => m.RolesTeamsOverviewComponent,
          ),
        data: { rolesConfig: MOHUA_ROLES_CONFIG },
      },
      {
        path: 'review-state-submissions',
        loadComponent: () =>
          import('./review-state-submissions/review-state-submissions.component').then(
            (m) => m.ReviewStateSubmissionsComponent,
          ),
      },
      {
        path: 'fc-unspent-review',
        loadComponent: () =>
          import('./fc-unspent-review/fc-unspent-review.component').then((m) => m.FcUnspentMohuaReviewComponent),
      },
      {
        path: 'fc-unspent-review/:stateId',
        loadComponent: () =>
          import('./fc-unspent-review/fc-unspent-review.component').then((m) => m.FcUnspentMohuaReviewComponent),
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
