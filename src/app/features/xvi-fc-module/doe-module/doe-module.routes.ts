import { Routes } from '@angular/router';
import { MOHUA_DASHBOARD_ROUTES } from '../mohua-module/mohua-module.routes';
import { DOE_ROLES_CONFIG } from '../shared/roles-teams-overview/roles-teams-overview.models';

/**
 * DoE is a view-only copy of the MoHUA dashboard: it gets exactly the MoHUA dashboard routes (overview, state
 * view, ULB view and the read-only form screens) and its own People and Roles page — and deliberately none
 * of MoHUA's review, claims or submissions routes, so a direct link to one just redirects to the overview.
 * The API enforces the same rule independently (DoeReadOnlyGuard rejects every non-GET write).
 */
export const DOE_ROUTES: Routes = [
  {
    path: '',
    // The MoHUA shell is only a <router-outlet>, so DoE reuses it.
    loadComponent: () => import('../mohua-module/mohua-module.component').then((m) => m.MohuaModuleComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      ...MOHUA_DASHBOARD_ROUTES,
      {
        path: 'roles-teams-unified-view',
        loadComponent: () =>
          import('../shared/roles-teams-overview/roles-teams-overview.component').then(
            (m) => m.RolesTeamsOverviewComponent,
          ),
        data: { rolesConfig: DOE_ROLES_CONFIG },
      },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
