import { ViewportScroller } from '@angular/common';
// import {} from '@angular/common/http';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { FeedbackTabComponent } from './shared/components/feedback-tab/feedback-tab.component';
import { environment } from '../environments/environment';
import { GoogleAnalyticsService } from './core/services/google-analytics.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { GtmService } from './core/services/gtm.service';
import { GlobalLoaderService } from './core/services/loaders/global-loader.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { CommonService } from './core/services/common.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    MatProgressSpinner,
    FeedbackTabComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Cityfinance';
  baseUrl = environment.environment;
  loaderService = inject(GlobalLoaderService);
  private readonly authService = inject(AuthService);

  readonly showFeedbackTab = signal(false);
  private isOnXviFc = false;

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
        const url = event.urlAfterRedirects;
        const hideFooter = /^\/(auth|xvifc)(\/|$)/.test(url);
        this.loaderService.isFooterVisible.set(!hideFooter);

        // Only true once past the /xvifc/year and /xvifc/profile-verify gate screens —
        // i.e. inside an actual role dashboard (ulb/state/mohua/admin), which lands on
        // "overview" first and stays true for every page after it in that session.
        this.isOnXviFc = /^\/xvifc\/(?!year(\/|$))(?!profile-verify(\/|$))[^/]+\//.test(url);
        this.updateFeedbackTabVisibility();
      }
    });

    this.authService.sessionState$.subscribe(() => this.updateFeedbackTabVisibility());
  }

  private updateFeedbackTabVisibility(): void {
    this.showFeedbackTab.set(this.isOnXviFc && this.authService.loggedIn());
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
