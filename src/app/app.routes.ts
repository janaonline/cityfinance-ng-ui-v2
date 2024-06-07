import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { MaintenanceGuard } from './core/guards/maintenance/maintenance.guard';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { ErrorComponent } from './features/error/error.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [MaintenanceGuard],
    },
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
        path: 'xvifc-form',
        loadComponent: () => import('./features/xvi-fc-form/xvi-fc-form.component').then(m => m.XviFcFormComponent)
    },
    {
        path: 'admin/xvi-fc-review',
        loadComponent: () => import('./admin/xvi-fc-review/xvi-fc-review.component').then(m => m.XviFcReviewComponent)
    },
    {
        path: '**',
        redirectTo: '',
    },
];
