import { Route } from '@angular/router';

export const XV_FC_REVIEW_ADMIN_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./xv-fc-review-admin-shell.component').then((m) => m.XvFcReviewAdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./overview/xv-fc-review-admin-overview.component').then(
            (m) => m.XvFcReviewAdminOverviewComponent,
          ),
      },
      {
        // financialYear (not yearId) — the overview list doesn't carry a yearId (it spans both
        // forms), so the Detail screen resolves the real yearId itself via the years-summary
        // endpoint it already needs for the year tabs.
        path: ':ulbId/:financialYear',
        loadComponent: () =>
          import('./detail/xv-fc-review-admin-detail.component').then(
            (m) => m.XvFcReviewAdminDetailComponent,
          ),
      },
    ],
  },
];
