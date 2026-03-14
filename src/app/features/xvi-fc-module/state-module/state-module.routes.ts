import { Routes } from '@angular/router';

type DeferredStateRoute = Readonly<{
  path: string;
  componentPath: string;
  exportName: string;
}>;

const ACTIVE_STATE_CHILD_ROUTES: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
  },
  {
    path: 'ulb-submissions',
    loadComponent: () =>
      import('./ulb-submissions/ulb-submissions.component').then((m) => m.UlbSubmissionsComponent),
  },
  {
    path: 'insights',
    loadComponent: () => import('./insights/insights.component').then((m) => m.InsightsComponent),
  },
  {
    path: 'requirements',
    loadComponent: () =>
      import('./requirements/requirements.component').then((m) => m.RequirementsComponent),
  },
  {
    path: 'sfc-status',
    loadComponent: () =>
      import('./sfc-status/sfc-status.component').then((m) => m.SfcStatusComponent),
  },
  {
    path: 'elected-body-status',
    loadComponent: () =>
      import('./elected-body-status/elected-body-status.component').then(
        (m) => m.ElectedBodyStatusComponent,
      ),
  },
  {
    path: 'devolution-formula',
    loadComponent: () =>
      import('./devolution-formula/devolution-formula.component').then(
        (m) => m.DevolutionFormulaComponent,
      ),
  },
  {
    path: 'special-infrastructure',
    loadComponent: () =>
      import('./special-infrastructure/special-infrastructure.component').then(
        (m) => m.SpecialInfrastructureComponent,
      ),
  },
  {
    path: 'urbanisation-premium',
    loadComponent: () =>
      import('./urbanisation-premium/urbanisation-premium.component').then(
        (m) => m.UrbanisationPremiumComponent,
      ),
  },
  {
    path: 'doe-status',
    loadComponent: () =>
      import('./doe-status/doe-status.component').then((m) => m.DoeStatusComponent),
  },
];

// Keep deferred routes close to the live config so they can be reactivated in one place
// as soon as the corresponding standalone components land.
export const STATE_DEFERRED_ROUTES: readonly DeferredStateRoute[] = [
  {
    path: 'messages',
    componentPath: './messages/messages.component',
    exportName: 'MessagesComponent',
  },
  {
    path: 'reports',
    componentPath: './reports/reports.component',
    exportName: 'ReportsComponent',
  },
  {
    path: 'profile',
    componentPath: './profile/profile.component',
    exportName: 'ProfileComponent',
  },
  {
    path: 'resources',
    componentPath: './resources/resources.component',
    exportName: 'ResourcesComponent',
  },
  {
    path: 'feedback',
    componentPath: './feedback/feedback.component',
    exportName: 'FeedbackComponent',
  },
] as const;

export const STATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./state-module.component').then((m) => m.StateModuleComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      ...ACTIVE_STATE_CHILD_ROUTES,
      {
        path: '**',
        redirectTo: '/xvifc',
      },
    ],
  },
];
