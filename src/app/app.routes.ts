import { Routes } from '@angular/router';
import { authGuard, xvifcAuthGuard } from './core/guards/auth.guard';
import { MaintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { ErrorComponent } from './features/error/error.component';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   // redirectTo: 'cfr',
  //   // pathMatch: 'full',
  //   loadChildren: () => import('./features/cfr/cfr.routes').then((mod) => mod.CFR_ROUTES),
  // },
  {
    path: 'xvifc-form',
    loadComponent: () =>
      import('./features/xvi-fc-form/xvi-fc-form.component').then((m) => m.XviFcFormComponent),
    canActivate: [authGuard],
  },
  {
    // Standalone page (no XVI-FC side-menu shell). Uses xvifcAuthGuard (not the generic
    // authGuard) so an unauthenticated visit lands on the explicit /auth/login/16thFC form
    // instead of the generic /auth/login page, which defaults to the unrelated "15thFC"
    // login type and can bounce off-app on redirect.
    path: 'xv-fc-review',
    loadComponent: () =>
      import('./features/xv-fc-review/xv-fc-data-review.component').then(
        (m) => m.XvFcDataReviewComponent,
      ),
    canActivate: [xvifcAuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((mod) => mod.ADMIN_ROUTES),
    canActivate: [authGuard],
  },
  // { path: 'login', component: LoginComponent },
  // {
  //   path: 'login',
  //   loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  // },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  // {
  //     path: '',
  //     component: HomeComponent,
  //     canActivate: [MaintenanceGuard],
  // },
  {
    path: 'cfr',
    // loadComponent: () => import('./features/cfr/cfr-home/cfr-home.component').then((m) => m.CfrHomeComponent),
    loadChildren: () => import('./features/cfr/cfr.routes').then((mod) => mod.CFR_ROUTES),
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./shared/components/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'afs-dashboard',
    loadComponent: () => import('./admin/afs-dashboard/afs-dashboard.component').then((m) => m.AfsDashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'afs-old-dashboard',
    loadComponent: () => import('./admin/afs-dashboard/old-dashboard/old-dashboard.component').then((m) => m.OldDashboardComponent),
    canActivate: [authGuard],
  },

  {
    path: 'ocr',
    loadChildren: () => import('./admin/ocr/ocr.routes').then((mod) => mod.OCR_ROUTES),
  },
  {
    path: 'events-dashboard',
    loadComponent: () => import('./admin/events/events.component').then((m) => m.EventsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'xvifc',
    canActivate: [xvifcAuthGuard],
    loadChildren: () =>
      import('./features/xvi-fc-module/xvi-fc-module.routes').then((m) => m.XVIFC_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: 'v1',
    children: [
      {
        path: 'fc_grant',
        canActivate: [
          () => {
            window.location.href = window.location.origin;
            return false;
          },
        ],
        component: ErrorComponent,
      },
    ],
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
  },
  // {
  //     path: 'pdf',
  //     loadComponent: () => import('./pdf-content/pdf-content.component').then(m => m.PdfContentComponent),
  // },
  {
    path: 'error',
    component: ErrorComponent,
    canActivate: [MaintenanceGuard],
  },

  {
    path: '**',
    redirectTo: 'auth',
  },
];
