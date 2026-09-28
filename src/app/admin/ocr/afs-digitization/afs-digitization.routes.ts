import { Route } from '@angular/router';

export const AFS_DIGITIZATION_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full',
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./afs-digitization/afs-digitization.component').then((mod) => mod.AfsDigitizationComponent),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./afs-digitization-list/afs-digitization-list.component').then(
        (mod) => mod.AfsDigitizationListComponent,
      ),
  },
];
