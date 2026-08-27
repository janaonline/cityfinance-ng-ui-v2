
import { USER_TYPE } from '../models/user/userType';

export interface IRoutePages {
    type: string;
    label: string;
    link?: string;
    isMenu: boolean;
    isNew?: boolean;
    route?: string;
    roles?: USER_TYPE[];
    isHiddenInProd?: boolean; // hidden once environment.isProduction is true; still shown in dev/staging/local
    icon?: string; // Bootstrap Icons class for this row; defaults to bi-box-arrow-in-right in the template
    href?: string; // literal href, used as-is — for a destination that isn't V2's own auth/login/:type route,
                    // e.g. SSR's coming-soon page below (rendered via [href], not [routerLink])
}
export const ROUTE_PAGES: IRoutePages[] = [{
    // XVIFC_PROD_CUTOVER: delete this whole entry once the real 16th FC login is ready for
    // production — at that point this row and the one below (isHiddenInProd) swap places.
    type: 'xvifc-coming-soon',
    label: 'XVI FC Grant',
    icon: 'bi-rocket-takeoff-fill text-cfPrimary',
    href: '/auth/login/16thfc', // SSR occupies the shared domain's root, so a relative path reaches it
    isMenu: true,
    isNew: true,
}, {
    type: '16thFC',
    label: 'XVI FC Grant',
    route: '/xvifc/year',
    isMenu: true,
    isNew: true,
    // XVIFC_PROD_CUTOVER: delete this line once the real 16th FC login is ready for production.
    // This one flag re-enables this "XVI FC Grant" row (here and in SSR's login-menu.constant.ts)
    // and this real login route (guarded by login-type-availability.guard.ts) at the same time.
    isHiddenInProd: true,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
}, {
    type: '15thFC',
    label: 'XV FC Grant',
    link: '/fc-home-page',
    isMenu: true,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN, USER_TYPE.PARTNER]
},

{
    type: 'XVIFC',
    label: 'XVI FC Data Collection',
    route: '/xvifc-form',
    isMenu: true,
    roles: [USER_TYPE.ULB]
},
{
    type: 'XVIFC',
    label: 'XVI FC Review',
    route: '/admin/xvi-fc-review',
    isMenu: false,
    roles: [USER_TYPE.XVIFC_STATE, USER_TYPE.XVIFC]
},
{
    // Rankings temporarily disabled for all users
    type: 'ranking',
    label: 'Rankings 2022',
    link: '/rankings/ulb-form',
    isMenu: false,
    roles: [USER_TYPE.ULB, USER_TYPE.STATE, USER_TYPE.MoHUA, USER_TYPE.ADMIN]
},
{
    type: 'state-dashboard',
    label: 'State Dashboard',
    link: '/state-dashboard',
    isMenu: true,
}
];
