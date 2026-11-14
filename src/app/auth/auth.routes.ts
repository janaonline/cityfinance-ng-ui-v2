import { Routes } from '@angular/router';
import { noAuthGuard } from '../core/guards/no-auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    // Old portal-specific sign-in URLs (/auth/login/16thFC, /auth/login/15thFC, ...) still
    // resolve here — TS-1262 removed the portal choice, so `:type` now only decorates the
    // page's branding/reference-documents panel; every sign-in shows the same unified role
    // picker regardless of which of these URLs got them there.
    path: 'login/:type',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [noAuthGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password/:type',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component').then((m) => m.SignupComponent),
  },
];
