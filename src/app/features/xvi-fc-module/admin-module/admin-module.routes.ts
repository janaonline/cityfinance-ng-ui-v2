import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-module.component').then((m) => m.AdminModuleComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./overview/overview.component').then((m) => m.AdminOverviewComponent),
      },
      {
        path: 'scheduled-reminders',
        loadComponent: () =>
          import('./scheduled-reminders/scheduled-reminders.component').then(
            (m) => m.ScheduledRemindersComponent,
          ),
      },
      {
        path: 'ulb-list',
        loadComponent: () =>
          import('../state-module/ulb-list/ulb-list.component').then((m) => m.UlbListComponent),
      },
      {
        path: 'manual-review-queue',
        loadComponent: () =>
          import('./manual-review-queue/manual-review-queue.component').then(
            (m) => m.ManualReviewQueueComponent,
          ),
      },
      {
        path: 'manual-review-history',
        loadComponent: () =>
          import('./manual-review-history/manual-review-history.component').then(
            (m) => m.ManualReviewHistoryComponent,
          ),
      },
      {
        path: 'manual-review-history/:requestId',
        loadComponent: () =>
          import('./manual-review-history/manual-review-history-detail/manual-review-history-detail.component').then(
            (m) => m.ManualReviewHistoryDetailComponent,
          ),
      },
      {
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
