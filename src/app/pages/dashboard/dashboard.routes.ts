import { Route } from '@angular/router';
import { CityComponent } from './city/city.component';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: 'city/:cityId',
    component: CityComponent,
    // component: XviFcReviewComponent,
  },
];
