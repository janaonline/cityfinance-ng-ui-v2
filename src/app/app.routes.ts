import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MaintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { ErrorComponent } from './features/error/error.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', component: HomeComponent },
            {
                path: 'xvifc-form',
                loadComponent: () => import('./features/xvi-fc-form/xvi-fc-form.component').then(m => m.XviFcFormComponent),
                // canActivate: [authGuard],
            },
            { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(mod => mod.ADMIN_ROUTES) },
            // {
            //     path: 'admin/xvi-fc-review',
            //     loadComponent: () => import('./admin/xvi-fc-review/xvi-fc-review.component').then(m => m.XviFcReviewComponent)
            // },
            // Add other protected routes here
        ]
    },
    // { path: 'login', component: LoginComponent },
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
        canActivate: [MaintenanceGuard],
    },

    {
        path: '**',
        redirectTo: 'error',
    },
];
