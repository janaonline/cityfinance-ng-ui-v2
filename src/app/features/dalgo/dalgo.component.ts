import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { buildNativeFilters } from './dalgo-filters.util';
import { DASHBOARD_REGISTRY, DashboardType, resolveDashboardFilters } from './dalgo.config';
import { SupersetEmbedHandle, SupersetEmbedService } from './superset-embed.service';

type DalgoStatus = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-dalgo',
  imports: [],
  templateUrl: './dalgo.component.html',
  styleUrl: './dalgo.component.scss',
})
export class DalgoComponent implements AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly supersetEmbed = inject(SupersetEmbedService);

  private readonly mountPoint = viewChild.required<ElementRef<HTMLElement>>('mountPoint');
  private readonly dashboard = DASHBOARD_REGISTRY[DashboardType.RT_MUNICIPAL_FINANCE];

  private embedded: SupersetEmbedHandle | null = null;
  private destroyed = false;

  readonly status = signal<DalgoStatus>('loading');
  readonly errorMessage = signal('');

  ngAfterViewInit(): void {
    void this.initialize();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.embedded?.unmount();
    this.embedded = null;
  }

  private async initialize(): Promise<void> {
    try {
      await firstValueFrom(this.authService.waitForAuthReady());
      if (this.destroyed) return;

      const resolution = resolveDashboardFilters(this.authService.getCurrentUserSnapshot(), this.dashboard);
      if (!resolution.ok) {
        this.fail(resolution.reason);
        return;
      }

      const embedded = await this.supersetEmbed.embed({
        dashboardId: this.dashboard.id,
        mountPoint: this.mountPoint().nativeElement,
        filters: { expanded: resolution.showFilterBar, visible: resolution.showFilterBar },
        nativeFilters: buildNativeFilters(resolution.filters),
      });

      if (this.destroyed) {
        embedded.unmount();
        return;
      }
      this.embedded = embedded;
      this.status.set('ready');
    } catch (error) {
      console.error('Failed to embed Superset dashboard:', error);
      this.fail('The dashboard could not be loaded. Please try again later.');
    }
  }

  private fail(message: string): void {
    this.errorMessage.set(message);
    this.status.set('error');
  }
}
