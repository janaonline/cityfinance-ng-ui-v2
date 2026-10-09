import { Routes } from '@angular/router';

export const PMU_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pmu-module.component').then((m) => m.PmuModuleComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'review-state-submissions' },
      {
        path: 'review-state-submissions',
        loadComponent: () =>
          import('./review-state-submissions/review-state-submissions.component').then(
            (m) => m.ReviewStateSubmissionsComponent,
          ),
      },
      {
        path: 'sfc-status-review/:stateId',
        data: { form: 'SFC_STATUS' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'gtc-review/:stateId/:installment',
        data: { form: 'GTC' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'devolution-formula-review/:stateId/:installment',
        data: { form: 'DEVOLUTION_FORMULA' },
        loadComponent: () =>
          import('./form-review-detail/pmu-form-review-detail.component').then((m) => m.PmuFormReviewDetailComponent),
      },
      {
        path: 'elected-body-review/:stateId',
        data: { form: 'ELECTED_BODY' },
        loadComponent: () =>
          import('./row-review-detail/pmu-row-review-detail.component').then((m) => m.PmuRowReviewDetailComponent),
      },
      {
        path: 'fc-unspent-review/:stateId',
        data: { form: 'FC_UNSPENT' },
        loadComponent: () =>
          import('./row-review-detail/pmu-row-review-detail.component').then((m) => m.PmuRowReviewDetailComponent),
      },
      { path: '**', redirectTo: 'review-state-submissions' },
    ],
  },
];
