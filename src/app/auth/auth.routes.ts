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
    path: 'forgot-password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./signup/signup.component').then((m) => m.SignupComponent),
  },
];
