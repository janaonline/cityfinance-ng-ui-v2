import { Routes } from '@angular/router';
import { MOHUA_CLAIMS_READ_ROUTES, MOHUA_DASHBOARD_ROUTES } from '../mohua-module/mohua-module.routes';
import { PMU_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';

/**
 * PMU's Overview is the MoHUA national dashboard, reused as-is (as DoE does): overview, one State, one ULB and
 * the read-only form views. PMU's own worklist (`review-state-submissions`, an exact path) and its actionable
 * `*-review` pages sit alongside it, where PMU approves and returns. PMU also gets Claims & Submissions and the OM
 * history read-only, to monitor MoHUA's work (no Generate OM).
 */
export const PMU_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pmu-module.component').then((m) => m.PmuModuleComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      ...MOHUA_DASHBOARD_ROUTES,
      {
        path: 'roles-teams-unified-view',
        loadComponent: () =>
          import('../shared/roles-teams-overview/roles-teams-overview.component').then(
            (m) => m.RolesTeamsOverviewComponent,
          ),
        data: { rolesConfig: PMU_ROLES_CONFIG },
      },
      {
        path: 'review-state-submissions',
        data: { menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./review-state-submissions/review-state-submissions.component').then(
            (m) => m.ReviewStateSubmissionsComponent,
          ),
      },
      {
        path: 'sfc-status-review/:stateId',
        data: { form: 'SFC_STATUS', menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'gtc-review/:stateId/:installment',
        data: { form: 'GTC', menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'ulb-wise-allocation-review/:stateId/:installment',
        data: { form: 'DEVOLUTION_FORMULA', menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'elected-body-review/:stateId',
        data: { form: 'ELECTED_BODY', menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./row-review-detail/pmu-row-review-detail.component').then((m) => m.PmuRowReviewDetailComponent),
      },
      {
        path: 'fc-unspent-review/:stateId',
        data: { form: 'FC_UNSPENT', menuGroup: 'review-state-submissions' },
        loadComponent: () =>
          import('./row-review-detail/pmu-row-review-detail.component').then((m) => m.PmuRowReviewDetailComponent),
      },
      ...MOHUA_CLAIMS_READ_ROUTES,
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
