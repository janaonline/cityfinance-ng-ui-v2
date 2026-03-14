export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: unknown[] | string;
  exact?: boolean;
  url?: string;
  target?: '_blank' | '_self';
  items?: readonly MenuItem[];
  separator?: boolean;
  path?: string;
  class?: string;
  disabled?: boolean;
  expanded?: boolean;
}

export interface SideBarModel {
  topModel: MenuItem[];
  bottomModel: MenuItem[];
}
