import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MaintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { ErrorComponent } from './features/error/error.component';
import { authGuard } from './core/guards/auth.guard';
import { USER_TYPE } from './core/models/user/userType';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', component: HomeComponent },
            {
                path: 'xvifc-form',
                loadComponent: () => import('./features/xvi-fc-form/xvi-fc-form.component').then(m => m.XviFcFormComponent),
                canActivate: [roleGuard],
                data: {
                    allowedRoles: [USER_TYPE.ULB]
                }
            },
            { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(mod => mod.ADMIN_ROUTES) },
        ]
    },
    // { path: 'login', component: LoginComponent },
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
    },
    // {
    //     path: '',
    //     component: HomeComponent,
    //     canActivate: [MaintenanceGuard],
    // },
    {
        path: 'maintenance',
        component: MaintenanceComponent,
    },
    {
        path: 'error',
        component: ErrorComponent,
        canActivate: [MaintenanceGuard, roleGuard],
    },

    {
        path: '**',
        redirectTo: 'error',
    },
];
