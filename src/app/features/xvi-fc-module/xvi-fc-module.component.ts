import { Component, DestroyRef, ElementRef, ViewChild, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, skip } from 'rxjs';
import { provideMaterialThemeScope } from '../../core/theming/material-theme.providers';
import { AppMenuComponent } from '../../shared/components/side-menu';
import { XVIFC_THEME_CLASS } from './xvi-fc-module.constants';
import { XvifcModuleService } from './xvi-fc-module.service';

@Component({
  selector: 'app-xvi-fc-module',
  imports: [AppMenuComponent, RouterModule],
  templateUrl: './xvi-fc-module.component.html',
  styleUrl: './xvi-fc-module.component.scss',
  host: {
    class: XVIFC_THEME_CLASS,
  },
  providers: [...provideMaterialThemeScope(XVIFC_THEME_CLASS)],
})
/**
 * Feature shell for the XVI-FC module.
 *
 * Applies the feature-scoped Material theme and keeps the shared side menu
 * synchronized with the currently active child route so nested navigation
 * always reflects the resolved role/year context.
 */
export class XviFcModuleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  /** Resolves route-derived feature context and menu state shared across the shell. */
  private readonly xvifcService = inject(XvifcModuleService);

  /** Menu model consumed by the shell template and recalculated from route context. */
  readonly model = this.xvifcService.sideMenuModel;
  readonly role = this.xvifcService.role;
  readonly yearId = this.xvifcService.yearId;

  /** The scrollable content pane — `<router-outlet>` swaps children inside it without the
   *  element itself being recreated, so its scroll position otherwise carries over between
   *  pages (e.g. landing mid-page on a freshly navigated-to route). */
  @ViewChild('contentEl') private readonly contentEl?: ElementRef<HTMLDivElement>;

  /**
   * Primes menu state from the initial route snapshot and re-synchronizes
   * after each completed navigation within the feature area.
   */
  ngOnInit() {
    // Route params/data can already be finalized by redirects before the shell renders.
    this.syncMenuModel();

    // Re-read the route tree only after navigation completes so child snapshots are stable.
    // `skip(1)`: the first NavigationEnd is the navigation that created this component.
    // It was already synced above, so handling it again would create a new context and
    // duplicate the side-menu API call.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        skip(1),
        // Router events outlive the component; bind cleanup to the shell instance.
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncMenuModel());

    // Separate from the menu-sync subscription above (no skip(1) here) — every completed
    // navigation within the feature area should land at the top of the content pane.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.contentEl) this.contentEl.nativeElement.scrollTop = 0;
      });
  }

  /**
   * Re-reads the current route tree and pushes the resolved role/year context
   * into the shared XVI-FC state service.
   */
  private syncMenuModel() {
    this.xvifcService.syncContextFromRoute(this.route.snapshot);
  }
}
