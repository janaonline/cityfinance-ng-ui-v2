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
        path: '**',
        redirectTo: 'overview',
      },
    ],
  },
];
