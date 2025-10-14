import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MaintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { ErrorComponent } from './features/error/error.component';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';

export const routes: Routes = [
  // {
  //   path: '',
  //   canActivate: [authGuard],
  //   children: [
  //     { path: '', component: HomeComponent },
  //     {
  //       path: 'xvifc-form',
  //       loadComponent: () =>
  //         import('./features/xvi-fc-form/xvi-fc-form.component').then((m) => m.XviFcFormComponent),
  //       // canActivate: [authGuard],
  //     },
  //     {
  //       path: 'admin',
  //       loadChildren: () => import('./admin/admin.routes').then((mod) => mod.ADMIN_ROUTES),
  //     },
  //     // {
  //     //     path: 'admin/xvi-fc-review',
  //     //     loadComponent: () => import('./admin/xvi-fc-review/xvi-fc-review.component').then(m => m.XviFcReviewComponent)
  //     // },
  //     // Add other protected routes here
  //   ],
  // },

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
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((mod) => mod.ADMIN_ROUTES),
    canActivate: [authGuard],
  },
  // { path: 'login', component: LoginComponent },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    children: [
      // {
      //   // path: 'home', loadComponent: () => import('./features/pages/home/home.component').then((m) => m.HomeComponent),
      //   path: 'home', component: HomeComponent,
      // },      

    ],
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
    redirectTo: 'cfr',
  },
];
