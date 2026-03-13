export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: unknown[] | string;
  url?: string;
  target?: '_blank' | '_self';
  items?: readonly MenuItem[];
  separator?: boolean;
  path?: string;
  class?: string;
  disabled?: boolean;
  expanded?: boolean;
}
