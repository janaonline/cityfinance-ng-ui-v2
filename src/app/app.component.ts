import { ViewportScroller } from '@angular/common';
// import {} from '@angular/common/http';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { GtmService } from './core/services/gtm.service';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CommonService } from './core/services/common.service';

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
    private commonService: CommonService,
  ) {
  }

  ngOnInit(): void {
    if (environment.isProduction && environment.googleAnalyticsId) {
      this.gaService.init();
      this.gtmService.initScript();
    }
    // this.gaService.trackEvent('button click',{});
    this.getQueryParams();
    this.initVisitSession();

    this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    const sessionID = sessionStorage.getItem('sessionID');
    if (sessionID) {
      this.commonService.endSession(sessionID);
    }
  }

  private initVisitSession(): void {
    if (sessionStorage.getItem('sessionID')) return;
    this.commonService.startSession().subscribe({
      next: (id) => {
        if (id) sessionStorage.setItem('sessionID', id);
      },
      error: (err) => console.error('Failed to start visit session', err),
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
