import { Route } from '@angular/router';
import { XviFcReviewComponent } from './xvi-fc-review.component';
import { PreviewComponent } from './preview/preview.component';
import { TableComponent } from './table/table.component';

export const XVI_FC_ROUTES: Route[] = [
  {
    path: '',
    component: XviFcReviewComponent,
    // children: [
    //     {
    //         path: "ulb/:ulbId",
    //         component: PreviewComponent,
    //     },
    // ],
  },
  {
    path: 'ulb/:ulbId',
    component: PreviewComponent,
  },
  {
    path: 'table',
    component: TableComponent,
  },
];
