import { IUserLoggedInDetails } from '../../core/models/login/userLoggedInDetails';
import { MenuItem, SideBarModel } from '../../shared/components/side-menu';
import { isDalgoAvailable } from './dalgo.config';

const DATA_HUB_SEGMENT = 'data-hub';

function isDataHubItem(item: MenuItem): boolean {
  const link = item.routerLink;
  if (!Array.isArray(link) || !link.length) return false;
  return link[link.length - 1] === DATA_HUB_SEGMENT;
}

function withoutDataHub(items: readonly MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  for (const item of items) {
    if (isDataHubItem(item)) continue;
    if (item.items?.length) {
      const children = withoutDataHub(item.items);
      // Drop a group that only existed to hold the Data Hub item.
      if (!children.length) continue;
      result.push({ ...item, items: children });
    } else {
      result.push(item);
    }
  }
  return result;
}

/** Removes the Data Hub sidebar item when it isn't available to the logged-in user. */
export function filterDataHubItem(menu: SideBarModel, user: IUserLoggedInDetails | null): SideBarModel {
  if (isDalgoAvailable(user)) return menu;
  return {
    topModel: withoutDataHub(menu.topModel),
    bottomModel: withoutDataHub(menu.bottomModel),
  };
}
