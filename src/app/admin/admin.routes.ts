import { Route } from '@angular/router';
import { xvFcReviewAdminGuard } from './xv-fc-review/xv-fc-review-admin.guard';

export const ADMIN_ROUTES: Route[] = [
  {
    path: 'xvi-fc-review',
    loadChildren: () =>
      import('./xvi-fc-review/xvi-fc-review.routes').then((mod) => mod.XVI_FC_ROUTES),
  },
  {
    path: 'xv-fc-review',
    canActivate: [xvFcReviewAdminGuard],
    loadChildren: () =>
      import('./xv-fc-review/xv-fc-review-admin.routes').then((mod) => mod.XV_FC_REVIEW_ADMIN_ROUTES),
  },
];
