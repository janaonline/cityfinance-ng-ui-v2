import { ViewportScroller } from '@angular/common';
// import {} from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { GtmService } from './core/services/gtm.service';
import { LocalStorageService } from './core/services/local-storage.service';

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
    private localStorageService: LocalStorageService,
  ) {
    // const userData: any = '';
    // const token = '';
    // const years = '';
    // localStorage.setItem("userData", userData);
    // this.localStorageService.setItem("id_token", JSON.stringify(token));
    // this.localStorageService.setItem("userData", userData);
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
      // if (params['token']) {
      //   localStorage.setItem('id_token', JSON.stringify(params['token']));
      // }
      if (params['ulb']) {
        // console.log('params---',params);

        const userData1: any = { ulb: params['ulb'] };
        localStorage.setItem('userData', JSON.stringify(userData1));
      }
    });
  }
}
