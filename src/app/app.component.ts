import { ViewportScroller } from '@angular/common';
// import {} from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { GtmService } from './core/services/gtm.service';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    MatProgressSpinner
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Cityfinance';
  baseUrl = environment.environment;
  loaderService = inject(GlobalLoaderService);

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private _viewportScroller: ViewportScroller,
    private gaService: GoogleAnalyticsService,
    private gtmService: GtmService,
  ) {
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
      if (params['ulb']) {
        const userData1: any = { ulb: params['ulb'] };
        localStorage.setItem('userData', JSON.stringify(userData1));
      }
    });
  }
}
