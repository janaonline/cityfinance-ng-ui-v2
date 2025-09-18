import { Route } from '@angular/router';
import { CityComponent } from './city/city.component';
import { StateComponent } from './state/state.component';
import { NationalComponent } from './national/national.component';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: 'city/:cityId',
    component: CityComponent,
    // component: XviFcReviewComponent,
  },
  {
    path: 'state/:stateId',
    component: StateComponent,
    // component: XviFcReviewComponent,
  },
  {
    path: 'national/india',
    component: NationalComponent,
    // component: XviFcReviewComponent,
  },
];
