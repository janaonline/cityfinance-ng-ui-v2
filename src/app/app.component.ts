import { ViewportScroller } from '@angular/common';
// import {} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { GtmService } from './core/services/gtm.service';

@Component({
    selector: 'app-root',
    imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent
],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Cityfinance';
  baseUrl = environment.environment;

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private _viewportScroller: ViewportScroller,
    private gaService: GoogleAnalyticsService,
    private gtmService: GtmService,
  ) {
    // const  userData:any = '{"_id":"66772cd175ff6f339c3efb45","name":"User 1","email":"user1_16fc@cityfinance.in","isActive":true,"role":"XVIFC","designation":"XVIFC_USER","ulbCode":"","stateCode":"","isUA":null,"isMillionPlus":null,"isUserVerified2223":false}';
    // const  userData:any = '{"_id":"669761dfa3abb74244cd394f","name":"Kerala","email":"kl_16fc@cityfinance.in","isActive":true,"role":"XVIFC_STATE","state":"5dcf9d7316a06aed41c748ed","stateName":"Kerala","designation":"XVIFC_STATE","ulbCode":"","stateCode":"","isUA":null,"isMillionPlus":null,"isUserVerified2223":false}';
    // const userData: any =
    //   '{"_id":"66975f7f9f63dd4242e2317d","name":"User 2","email":"user2_16fc@cityfinance.in","isActive":true,"role":"XVIFC","designation":"XVIFC_USER","ulbCode":"","stateCode":"","isUA":null,"isMillionPlus":null,"isUserVerified2223":false}';
    // const userData: any = '{"_id":"5fcb9f836e7a0139dc6b64b6","name":"Mummidivaram Municipality","email":"anjumrm@gmail.com","isActive":true,"role":"ULB","state":"5dd006d4ffbcc50cfd92c87c","stateName":"Jharkhand","designation":"","ulb":"5e33ffd0d6f5614a4bba6217","ulbCode":"JH002","stateCode":"JH","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    // const userData: any = '{"_id":"5fcb9ce06e7a0139dc6b514e","name":"Barpeta Municipal Board","email":"hpathakbarpeta@gmail.com","isActive":true,"role":"ULB","state":"5dcf9d7216a06aed41c748df","stateName":"Assam","designation":"","ulb":"5dcfca53df6f59198c4ac3d5","ulbCode":"AS001","stateCode":"AS","isUA":"No","isMillionPlus":"No","isUserVerified2223":true}';
    // const token = '';
    // const years =
    //   '{"2020-21":"606aadac4dff55e6c075c507","2021-22":"606aaf854dff55e6c075d219","2022-23":"606aafb14dff55e6c075d3ae","2023-24":"606aafc14dff55e6c075d3ec","2024-25":"606aafcf4dff55e6c075d424","2025-26":"606aafda4dff55e6c075d48f","2019-20":"607697074dff55e6c0be33ba","2017-18":"63735a4bd44534713673bfbf","2018-19":"63735a5bd44534713673c1ca"}';
    // localStorage.setItem("Years", years);
    // localStorage.setItem("id_token", JSON.stringify(token));
    // localStorage.setItem("userData", userData);
  }

  ngOnInit(): void {
    this.gaService.init();
    this.gtmService.initScript();
    // this.gaService.trackEvent('button click',{});
    this.getQueryParams();

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  getQueryParams(): void {
    this.route.queryParams.subscribe((params) => {
      // console.log('params', params);
      if (params['token']) {
        localStorage.setItem('id_token', JSON.stringify(params['token']));
      }
      if (params['ulb']) {
        // console.log('params---',params);

        const userData1: any = { ulb: params['ulb'] };
        localStorage.setItem('userData', JSON.stringify(userData1));
      }
    });
  }
}
