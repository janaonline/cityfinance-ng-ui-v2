import { Route } from "@angular/router";
import { roleGuard } from "../core/guards/role.guard";
import { USER_TYPE } from "../core/models/user/userType";

export const ADMIN_ROUTES: Route[] = [
    {
        path: 'xvi-fc-review',
        loadChildren: () => import('./xvi-fc-review/xvi-fc-review.routes').then(mod => mod.XVI_FC_ROUTES),
        canActivate: [roleGuard],
        data: {
            allowedRoles: [USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC]
        }
    },
];