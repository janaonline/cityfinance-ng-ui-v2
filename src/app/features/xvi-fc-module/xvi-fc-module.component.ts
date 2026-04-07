import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { provideMaterialThemeScope } from '../../core/theming/material-theme.providers';
import { AppMenuComponent } from '../../shared/components/side-menu/app.menu';
import { XvifcModuleService } from './xvi-fc-module.service';

const XVIFC_THEME_CLASS = 'xvifc-theme';
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

  /**
   * Primes menu state from the initial route snapshot and re-synchronizes
   * after each completed navigation within the feature area.
   */
  ngOnInit() {
    // Route params/data can already be finalized by redirects before the shell renders.
    this.syncMenuModel();

    // Re-read the route tree only after navigation completes so child snapshots are stable.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        // Router events outlive the component; bind cleanup to the shell instance.
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncMenuModel());
  }

  /**
   * Re-reads the current route tree and pushes the resolved role/year context
   * into the shared XVI-FC state service.
   */
  private syncMenuModel() {
    this.xvifcService.syncContextFromRoute(this.route.snapshot);
  }
}
