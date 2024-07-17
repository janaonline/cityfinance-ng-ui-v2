import { Route } from "@angular/router";

export const ADMIN_ROUTES: Route[] = [
    { path: 'xvi-fc-review', loadChildren: () => import('./xvi-fc-review/xvi-fc-review.routes').then(mod => mod.XVI_FC_ROUTES) },
];