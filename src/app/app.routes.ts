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
        path: 'xvifc-form-old',
        loadChildren: () => import('./features/xvi-fc/xvi-fc.module').then(m => m.XviFCModule)
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
        path: 'form',
        loadComponent: () =>
            import('./features/form/form.component').then((x) => x.FormComponent),
    },
    {
        path: 'form2',
        loadComponent: () =>
            import('./features/form2/form2.component').then((x) => x.Form2Component),
    },
    {
        path: '**',
        redirectTo: '',
    },
];
