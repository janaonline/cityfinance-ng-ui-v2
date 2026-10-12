import { Routes } from '@angular/router';
import { MOHUA_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';

/**
 * The read-only dashboard: national overview, one state, one ULB, and the read-only views of the five state
 * forms. Shared as-is by MoHUA and DoE (DoE is a view-only copy of the MoHUA dashboard), so a change here
 * changes both. Nothing in this list can approve, return or edit anything.
 */
export const MOHUA_DASHBOARD_ROUTES: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview.component').then((m) => m.MohuaOverviewComponent),
  },
  {
    path: 'review-state-submissions/:stateId',
    loadComponent: () => import('./state-detail/state-detail.component').then((m) => m.StateDetailComponent),
  },
  // Read-only views of the five state forms — the PMU review screens, fed the same PMU endpoints, with
  // `viewOnly` so the viewer sees the form but never gets approve / return controls.
  {
    path: 'review-state-submissions/:stateId/sfc-status',
    data: { form: 'SFC_STATUS', viewOnly: true },
    loadComponent: () =>
      import('../pmu-module/form-review-detail/pmu-form-review-detail.component').then(
        (m) => m.PmuFormReviewDetailComponent,
      ),
  },
  {
    path: 'review-state-submissions/:stateId/gtc/:installment',
    data: { form: 'GTC', viewOnly: true },
    loadComponent: () =>
      import('../pmu-module/form-review-detail/pmu-form-review-detail.component').then(
        (m) => m.PmuFormReviewDetailComponent,
      ),
  },
  {
    path: 'review-state-submissions/:stateId/devolution-formula/:installment',
    data: { form: 'DEVOLUTION_FORMULA', viewOnly: true },
    loadComponent: () =>
      import('../pmu-module/form-review-detail/pmu-form-review-detail.component').then(
        (m) => m.PmuFormReviewDetailComponent,
      ),
  },
  {
    path: 'review-state-submissions/:stateId/elected-body',
    data: { form: 'ELECTED_BODY', viewOnly: true },
    loadComponent: () =>
      import('../pmu-module/row-review-detail/pmu-row-review-detail.component').then(
        (m) => m.PmuRowReviewDetailComponent,
      ),
  },
  {
    path: 'review-state-submissions/:stateId/fc-unspent',
    data: { form: 'FC_UNSPENT', viewOnly: true },
    loadComponent: () =>
      import('../pmu-module/row-review-detail/pmu-row-review-detail.component').then(
        (m) => m.PmuRowReviewDetailComponent,
      ),
  },
  {
    path: 'review-state-submissions/:stateId/ulb/:ulbId',
    loadComponent: () => import('./ulb-detail/ulb-detail.component').then((m) => m.UlbDetailComponent),
  },
];

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
      ...MOHUA_DASHBOARD_ROUTES,
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
        data: { menuGroup: 'fc-unspent-review' },
        loadComponent: () =>
          import('./fc-unspent-review/fc-unspent-review.component').then((m) => m.FcUnspentMohuaReviewComponent),
      },
      {
        path: 'fc-unspent-review/:stateId',
        data: { menuGroup: 'fc-unspent-review' },
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
