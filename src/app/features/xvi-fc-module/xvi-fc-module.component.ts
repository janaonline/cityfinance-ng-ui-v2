import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AppMenuComponent } from '../../shared/components/side-menu/app.menu';
import { SideBarModel } from '../../shared/components/side-menu/interface';
import { XvifcModuleService } from './xvifc-module.service';

@Component({
  selector: 'app-xvi-fc-module',
  imports: [AppMenuComponent, RouterModule],
  templateUrl: './xvi-fc-module.component.html',
  styleUrl: './xvi-fc-module.component.scss',
})
export class XviFcModuleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly xvifcService = inject(XvifcModuleService);

  readonly model = signal<SideBarModel>({ topModel: [], bottomModel: [] });
  ngOnInit() {
    // It syncs the sidebar once immediately.
    this.syncMenuModel();

    // Listens for future navigation completions on each completed navigation, it syncs again.
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.syncMenuModel());
  }

  private syncMenuModel() {
    // Given the current route snapshot, get the active role and yearId
    const { role, yearId } = this.xvifcService.resolveRoleAndYearFromRoute(this.route.snapshot);
    this.model.set(this.xvifcService.getSideMenuItems(role, yearId));
  }
}
