import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError } from 'rxjs';
import { MenuItem, SideBarModel } from '../../shared/components/side-menu/interface';
// import { SideBarModel } from '../../shared/components/side-menu/interface';
import { XvifcRouteContext } from './xvi-fc-module.service';
import { buildXvifcFeatureLink, Roles } from './xvi-fc-side-menu.config';
import { environment } from '../../../environments/environment';
// import { SIDE_MENU_ITEMS } from './temp';

interface ApiMenuItem {
  label: string;
  icon?: string;
  separator?: boolean;
  expanded?: boolean;
  featureKey?: string;
  routerLink?: string[];
  items?: ApiMenuItem[];
}

interface ApiSideMenuResponse {
  topModel: ApiMenuItem[];
  bottomModel: ApiMenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class XviFcSideMenuApiService {
  private readonly http = inject(HttpClient);

  // private readonly baseUrl = 'http://localhost:3001/api/v2';
  private readonly baseUrl = environment.api.url2;
  getSideMenu(context: XvifcRouteContext): Observable<SideBarModel> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('id_token') : null;
    const headers = new HttpHeaders(
      token ? { Authorization: `Bearer ${token}`, 'x-access-token': token } : {},
    );
    return this.http
      .get<{ success: boolean; data: ApiSideMenuResponse; timestamp: string }>(
        `${this.baseUrl}xvi-fc/sidebar/${context.role}`,
        {
          headers,
          params: {
            yearId: context.yearId,
          },
        },
      )
      .pipe(
        map((wrapper) => this.mapApiResponseToSideBarModel(wrapper.data, context)),
        catchError((error) => {
          console.error('Failed to load side menu API.', error);
          throw error;
        }),
      );
  }

  private mapApiResponseToSideBarModel(
    response: ApiSideMenuResponse,
    context: XvifcRouteContext,
  ): SideBarModel {
    return {
      topModel: this.mapItems(response.topModel, context, true),
      bottomModel: this.mapItems(response.bottomModel, context),
    };
  }

  private mapItems(
    items: ApiMenuItem[],
    context: XvifcRouteContext,
    isTopLevel = false,
  ): MenuItem[] {
    return items.map((item) => ({
      ...item,
      routerLink: this.resolveRouterLink(item, context, isTopLevel),
      items: item.items ? this.mapItems(item.items, context) : undefined,
    }));
  }

  private resolveRouterLink(
    item: ApiMenuItem,
    context: XvifcRouteContext,
    isTopLevel = false,
  ): string[] | undefined {
    if (item.separator) {
      return undefined;
    }

    // Top-level items with a direct routerLink and no featureKey/children
    // are section headers — keep them non-navigable.
    if (isTopLevel && item.routerLink?.length && !item.featureKey && !item.items?.length) {
      return undefined;
    }

    if (item.routerLink?.length) {
      return item.routerLink;
    }

    if (item.featureKey) {
      return buildXvifcFeatureLink(
        context.role as Roles,
        context.entityId,
        context.yearId,
        item.featureKey,
      );
    }

    return undefined;
  }

  // private getFallbackMenu(context: XvifcRouteContext): SideBarModel {
  //   const menuFactory = SIDE_MENU_ITEMS[context.role];

  //   if (!menuFactory) {
  //     throw new Error(`No side menu configured for role: ${context.role}`);
  //   }

  //   return menuFactory(context.yearId);
  // }
}
