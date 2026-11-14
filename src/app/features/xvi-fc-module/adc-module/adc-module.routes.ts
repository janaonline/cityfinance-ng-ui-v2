import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../../core/guards/unsaved-changes.guard';
import { ADC_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';

/**
 * An ADC (Autonomous District Council) user is a STATE-role user scoped to its own ADC's ULBs. It gets exactly
 * these routes — an overview, ULB Forms Review, the ULB list / Register ULB, its own ADC team page, Support and
 * FAQ — and deliberately none of the State-level forms (claim letter, SFC, GTC, elected body, devolution, ...),
 * so a direct link to one just redirects to the overview. The API enforces the same rule independently
 * (AdcAccessGuard), so this tree is a convenience, not the security boundary.
 */
export const ADC_ROUTES: Routes = [
  {
    path: '',
    // The State shell is only a <router-outlet>, so ADC reuses it.
    loadComponent: () => import('../state-module/state-module.component').then((m) => m.StateModuleComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () => import('./overview/adc-overview.component').then((m) => m.AdcOverviewComponent),
      },
      {
        path: 'ulb-submissions',
        data: { menuGroup: 'ulb-submissions' },
        loadComponent: () =>
          import('../state-module/ulb-submissions/ulb-submissions.component').then((m) => m.UlbSubmissionsComponent),
      },
      {
        path: 'ulb-submissions/:ulbId/review',
        data: { menuGroup: 'ulb-submissions' },
        loadComponent: () =>
          import('../state-module/ulb-submissions/annual-account-review/annual-account-review.component').then(
            (m) => m.AnnualAccountReviewComponent,
          ),
      },
      {
        path: 'register-ulb',
        data: { menuGroup: 'ulb-list' },
        loadComponent: () =>
          import('../state-module/ulb-list/register-ulb/register-ulb.component').then((m) => m.RegisterUlbComponent),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'ulb-list',
        data: { menuGroup: 'ulb-list' },
        loadComponent: () => import('../state-module/ulb-list/ulb-list.component').then((m) => m.UlbListComponent),
      },
      {
        path: 'roles-teams-unified-view',
        loadComponent: () =>
          import('../shared/roles-teams-overview/roles-teams-overview.component').then(
            (m) => m.RolesTeamsOverviewComponent,
          ),
        data: { rolesConfig: ADC_ROLES_CONFIG },
      },
      {
        path: 'support-hours',
        loadComponent: () =>
          import('../state-module/support-hours/support-hours.component').then((m) => m.SupportHoursComponent),
      },
      {
        path: 'faq',
        loadComponent: () => import('../shared/faq/faq.component').then((m) => m.FaqComponent),
      },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
