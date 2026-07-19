import { Routes } from '@angular/router';

type DeferredStateRoute = Readonly<{
  path: string;
  componentPath: string;
  exportName: string;
}>;

export const ACTIVE_STATE_CHILD_ROUTES: Routes = [
  {
    path: 'overview',
    loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./state-dashboard/state-dashboard.component').then((m) => m.StateDashboardComponent),
  },
  {
    path: 'ulb-submissions',
    loadComponent: () => import('./ulb-submissions/ulb-submissions.component').then((m) => m.UlbSubmissionsComponent),
  },
  {
    path: 'insights',
    loadComponent: () => import('./insights/insights.component').then((m) => m.InsightsComponent),
  },
  {
    path: 'requirements',
    loadComponent: () => import('./requirements/requirements.component').then((m) => m.RequirementsComponent),
  },
  {
    path: 'sfc-status',
    loadComponent: () => import('./sfc-status/sfc-status.component').then((m) => m.SfcStatusComponent),
  },
  {
    path: 'elected-body-status',
    loadComponent: () =>
      import('./elected-body-status/elected-body-status.component').then((m) => m.ElectedBodyStatusComponent),
  },
  {
    path: 'elected-body-post-update',
    loadComponent: () =>
      import('./elected-body-status/pages/post-update/eulb-post-update.component').then(
        (m) => m.EulbPostUpdateComponent,
      ),
  },
  {
    path: 'devolution-formula',
    loadComponent: () =>
      import('./devolution-formula/devolution-formula.component').then((m) => m.DevolutionFormulaComponent),
  },
  {
    path: 'special-infrastructure',
    loadComponent: () =>
      import('./special-infrastructure/special-infrastructure.component').then((m) => m.SpecialInfrastructureComponent),
  },
  {
    path: 'urbanisation-premium',
    loadComponent: () =>
      import('./urbanisation-premium/urbanisation-premium.component').then((m) => m.UrbanisationPremiumComponent),
  },
  {
    path: 'doe-status',
    loadComponent: () => import('./doe-status/doe-status.component').then((m) => m.DoeStatusComponent),
  },
  {
    path: 'support-hours',
    loadComponent: () => import('./support-hours/support-hours.component').then((m) => m.SupportHoursComponent),
  },
  {
    path: 'roles-teams-unified-view',
    loadComponent: () =>
      import('./roles-teams-overview/roles-teams-overview.component').then((m) => m.RolesTeamsOverviewComponent),
  },
  {
    path: 'register-ulb',
    loadComponent: () => import('./ulb-list/register-ulb/register-ulb.component').then((m) => m.RegisterUlbComponent),
  },
  {
    path: 'ulb-list',
    loadComponent: () => import('./ulb-list/ulb-list.component').then((m) => m.UlbListComponent),
  },
  {
    path: 'fc-unspent-declaration',
    loadComponent: () =>
      import('./fc-unspent-declaration/fc-unspent-declaration.component').then(
        (m) => m.FcUnspentDeclarationComponent,
      ),
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
