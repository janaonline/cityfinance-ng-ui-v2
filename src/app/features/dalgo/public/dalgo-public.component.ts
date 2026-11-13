import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { SupersetEmbedHandle, SupersetEmbedService } from '../superset-embed.service';
import { getPublicDashboard } from './dalgo-public.config';

type DalgoStatus = 'loading' | 'ready' | 'error';

/**
 * Public (no-login) Superset dashboards, picked by the `:pageType` route param.
 * Unlike `DalgoComponent` it applies no role-based filters and shows the full filter bar.
 */
@Component({
  selector: 'app-dalgo-public',
  imports: [],
  templateUrl: './dalgo-public.component.html',
  styleUrl: './dalgo-public.component.scss',
})
export class DalgoPublicComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly supersetEmbed = inject(SupersetEmbedService);

  private readonly mountPoint = viewChild.required<ElementRef<HTMLElement>>('mountPoint');

  private embedded: SupersetEmbedHandle | null = null;
  private routeSub: Subscription | null = null;
  private destroyed = false;
  /** Bumped on every route change so a slow embed of a previous slug is discarded. */
  private loadId = 0;

  readonly status = signal<DalgoStatus>('loading');
  readonly errorMessage = signal('');

  ngAfterViewInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      void this.load(params.get('pageType'));
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.routeSub?.unsubscribe();
    this.unmount();
  }

  private async load(pageType: string | null): Promise<void> {
    const currentLoad = ++this.loadId;
    this.unmount();
    this.status.set('loading');

    const dashboard = getPublicDashboard(pageType);
    if (!dashboard) {
      this.fail('Dashboard not found.');
      return;
    }

    try {
      const embedded = await this.supersetEmbed.embed({
        dashboardId: dashboard.id,
        mountPoint: this.mountPoint().nativeElement,
        filters: { expanded: true },
      });

      if (this.destroyed) {
        embedded.unmount();
        return;
      }
      // A newer load already replaced this iframe; unmounting now would wipe the newer one.
      if (currentLoad !== this.loadId) return;
      this.embedded = embedded;
      this.status.set('ready');
    } catch (error) {
      if (this.destroyed || currentLoad !== this.loadId) return;
      console.error('Failed to embed Superset dashboard:', error);
      this.fail('The dashboard could not be loaded. Please try again later.');
    }
  }

  private unmount(): void {
    this.embedded?.unmount();
    this.embedded = null;
  }

  private fail(message: string): void {
    this.errorMessage.set(message);
    this.status.set('error');
  }
}
