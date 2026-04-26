import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { SideBarModel } from '../../shared/components/side-menu/interface';
// import { SideBarModel } from '../../shared/components/side-menu/interface';
import { XvifcRouteContext } from './xvi-fc-module.service';
import { buildXvifcFeatureLink, Roles } from './xvi-fc-side-menu.config';
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

  private readonly baseUrl = 'http://localhost:3001/api/v2';

  getSideMenu(context: XvifcRouteContext): Observable<SideBarModel> {
    return this.http
      .get<ApiSideMenuResponse>(`${this.baseUrl}/xvi-fc/sidebar/${context.role}`, {
        params: {
          yearId: context.yearId,
        },
      })
      .pipe(
        map((response) => this.mapApiResponseToSideBarModel(response, context)),
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
      topModel: this.mapItems(response.topModel, context),
      bottomModel: this.mapItems(response.bottomModel, context),
    };
  }

  private mapItems(items: ApiMenuItem[], context: XvifcRouteContext): any[] {
    return items.map((item) => ({
      ...item,
      routerLink: this.resolveRouterLink(item, context),
      items: item.items ? this.mapItems(item.items, context) : undefined,
    }));
  }

  private resolveRouterLink(item: ApiMenuItem, context: XvifcRouteContext): string[] | undefined {
    if (item.separator) {
      return undefined;
    }

    if (item.routerLink?.length) {
      return item.routerLink;
    }

    if (item.featureKey) {
      return buildXvifcFeatureLink(context.role as Roles, context.yearId, item.featureKey);
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
