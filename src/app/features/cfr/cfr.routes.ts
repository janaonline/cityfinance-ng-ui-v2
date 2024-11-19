import { Route } from '@angular/router';
import { CfrHomeComponent } from './cfr-home/cfr-home.component';
import { ParticipatingStateComponent } from './participating-state/participating-state.component';
import { TopRankingsComponent } from './top-rankings/top-rankings.component';
import { UlbDetailsComponent } from './ulb-details/ulb-details.component';
import { ParticipatingUlbsComponent } from './participating-ulbs/participating-ulbs.component';
import { AssessmentParameterComponent } from './assessment-parameter/assessment-parameter.component';
import { MapComponent } from './map/map.component';

export const CFR_ROUTES: Route[] = [
  { path: '', component: CfrHomeComponent },
  { path: 'home', component: CfrHomeComponent },
  // { path: "dashboard", component: DashboardComponent },
  // { path: "login", component: FiscalLoginComponent },
  // { path: "annual-financial-statements", component: AnnualFinancialStatementsComponent },
  // { path: "annual-budgets", component: AnnualBudgetsComponent },
  { path: "top-rankings", component: TopRankingsComponent },
  { path: "ulb/:ulbId", component: UlbDetailsComponent },
  // {
  //     path: "ulb-form/:ulbId",
  //     component: UlbFiscalNewComponent,
  //     canDeactivate: [ConfirmationGuard],
  //     data: {
  //         'formType': 'custom-form'
  //     },
  // },
  // {
  //     path: "ulb-form",
  //     component: UlbFiscalNewComponent,
  //     canDeactivate: [ConfirmationGuard],
  //     data: {
  //         'formType': 'custom-form'
  //     },
  // },
  // { path: "review-rankings-ulbform", component: ReviewUlbTableComponent },
  // { path: 'test', component: MapcomponentComponent },
  // {
  //     path: "populationWise/:stateId",
  //     component: DashboardComponent,
  //     data: {
  //         table: {
  //             id: 'populationWise',
  //             endpoint: 'fiscal-ranking/overview/populationWise',
  //             response: null,
  //         }
  //     }
  // },
  // {
  //     path: "populationWise",
  //     component: DashboardComponent,
  //     data: {
  //         table: {
  //             id: 'populationWise',
  //             endpoint: 'fiscal-ranking/overview/populationWise',
  //             response: null,
  //         }
  //     }
  // },
  {
    path: 'assesst-parameters/:id', component: AssessmentParameterComponent
  },
  {
    path: 'participated-states-ut',
    component: ParticipatingStateComponent,
  },
  {
    path: 'participated-ulbs/:stateId', component: ParticipatingUlbsComponent
  },
  {
    path: 'map', component: MapComponent
  },
];
