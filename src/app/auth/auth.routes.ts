import { Routes } from '@angular/router';
import { noAuthGuard } from '../core/guards/no-auth.guard';
import { loginTypeAvailabilityGuard } from '../core/guards/login-type-availability.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  { path: 'login', loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent) },
  {
    path: 'login/:type',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    // XVIFC_PROD_CUTOVER: if login-type-availability.guard.ts is deleted once isHiddenInProd is
    // removed, also remove loginTypeAvailabilityGuard here (and its import above).
    canActivate: [noAuthGuard, loginTypeAvailabilityGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'forgot-password/:type',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component').then((m) => m.SignupComponent),
  },
];
