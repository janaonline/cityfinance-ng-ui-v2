import { Injectable, inject } from '@angular/core';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { firstValueFrom } from 'rxjs';

import { SupersetService } from './superset.service';

export const SUPERSET_DOMAIN = 'https://janaagraha.dalgo.org';

export interface SupersetEmbedOptions {
  dashboardId: string;
  mountPoint: HTMLElement;
  /** Filter bar state; omit `visible` to leave Superset's default (shown). */
  filters: { expanded: boolean; visible?: boolean };
  /** Superset `native_filters` URL value (see `buildNativeFilters`). */
  nativeFilters?: string;
}

export interface SupersetEmbedHandle {
  unmount: () => void;
}

/** Embeds a Superset dashboard in an iframe. Shared by the role-based and the public dashboards. */
@Injectable({ providedIn: 'root' })
export class SupersetEmbedService {
  private readonly supersetService = inject(SupersetService);

  async embed({ dashboardId, mountPoint, filters, nativeFilters }: SupersetEmbedOptions): Promise<SupersetEmbedHandle> {
    const embedded = await embedDashboard({
      id: dashboardId,
      supersetDomain: SUPERSET_DOMAIN,
      mountPoint,
      fetchGuestToken: () => firstValueFrom(this.supersetService.getGuestToken(dashboardId)),
      dashboardUiConfig: {
        hideTitle: true,
        filters,
        ...(nativeFilters && { urlParams: { native_filters: nativeFilters } }),
      },
      iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox'],
    });

    const iframe = mountPoint.querySelector('iframe');
    if (iframe) {
      iframe.width = '100%';
      iframe.height = '100%';
    }
    return embedded;
  }
}
