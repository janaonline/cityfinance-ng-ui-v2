import { SideBarModel } from '../../shared/components/side-menu/interface';
import { buildXvifcFeatureLink, Roles, XvifcYearId } from './xvi-fc-side-menu.config';

type SideBarFactory = (yearId: XvifcYearId) => SideBarModel;

// Temporary mock payload until the side-menu API is available.
// Keep this file shaped around menu data so it can be swapped with API output later.
const buildMenuItem = (label: string, icon: string, routerLink: string[] | string) => ({
  label,
  icon,
  routerLink,
});

export const SIDE_MENU_ITEMS: Record<Roles, SideBarFactory> = {
  ULB: (yearId) => ({
    topModel: [
      {
        label: 'XVI Financial Commission',
        routerLink: ['/xvifc'],
        icon: 'bi bi-bank',
      },
      { label: '_', separator: true },
      buildMenuItem(
        'Overview',
        'bi bi-speedometer2',
        buildXvifcFeatureLink('ULB', yearId, 'overview'),
      ),
    ],
    bottomModel: [],
  }),

  STATE: (yearId) => ({
    topModel: [
      {
        label: 'XVI Financial Commission',
        routerLink: ['/xvifc'],
        icon: 'bi bi-bank',
      },
      { label: '_', separator: true },
      buildMenuItem(
        'Overview',
        'bi bi-speedometer2',
        buildXvifcFeatureLink('STATE', yearId, 'overview'),
      ),
      {
        label: 'Review',
        icon: 'bi bi-clipboard-data',
        items: [
          buildMenuItem(
            'ULB Submissions',
            'bi bi-upload',
            buildXvifcFeatureLink('STATE', yearId, 'ulb-submissions'),
          ),
          buildMenuItem(
            'Insights',
            'bi bi-bar-chart-line',
            buildXvifcFeatureLink('STATE', yearId, 'insights'),
          ),
        ],
      },
      {
        label: 'State level conditions',
        icon: 'bi bi-diagram-3',
        items: [
          buildMenuItem(
            'FY 2026-27 Requirements',
            'bi bi-list-check',
            buildXvifcFeatureLink('STATE', yearId, 'requirements'),
          ),
          buildMenuItem(
            'SFC Status',
            'bi bi-building',
            buildXvifcFeatureLink('STATE', yearId, 'sfc-status'),
          ),
          buildMenuItem(
            'Elected Body Status',
            'bi bi-person-badge',
            buildXvifcFeatureLink('STATE', yearId, 'elected-body-status'),
          ),
          buildMenuItem(
            'Devolution Formula',
            'bi bi-calculator',
            buildXvifcFeatureLink('STATE', yearId, 'devolution-formula'),
          ),
        ],
      },
      {
        label: 'XVI-FC Grants',
        icon: 'bi bi-cash-stack',
        items: [
          buildMenuItem(
            'Special Infrastructure',
            'bi bi-hammer',
            buildXvifcFeatureLink('STATE', yearId, 'special-infrastructure'),
          ),
          buildMenuItem(
            'Urbanisation Premium',
            'bi bi-buildings',
            buildXvifcFeatureLink('STATE', yearId, 'urbanisation-premium'),
          ),
        ],
      },
      {
        label: 'DoE tracking',
        icon: 'bi bi-activity',
        items: [
          buildMenuItem(
            'DoE Status',
            'bi bi-check2-circle',
            buildXvifcFeatureLink('STATE', yearId, 'doe-status'),
          ),
        ],
      },
    ],
    bottomModel: [
      {
        label: 'Give feedback',
        icon: 'bi bi-chat-square-text',
        expanded: false,
        routerLink: buildXvifcFeatureLink('STATE', yearId, 'feedback'),
      },
    ],
  }),

  MOHUA: (yearId) => ({
    topModel: [
      {
        label: 'XVI Financial Commission',
        routerLink: ['/xvifc'],
        icon: 'bi bi-bank',
      },
      { label: '_', separator: true },
      buildMenuItem('Workspace', 'bi bi-building-gear', buildXvifcFeatureLink('MOHUA', yearId)),
      {
        label: 'Review',
        icon: 'bi bi-clipboard-data',
        items: [
          buildMenuItem(
            'Review ULB Submissions',
            'bi bi-ui-checks-grid',
            buildXvifcFeatureLink('MOHUA', yearId, 'review-ulb-submissions'),
          ),
          buildMenuItem(
            'Review State Submissions',
            'bi bi-ui-checks-grid',
            buildXvifcFeatureLink('MOHUA', yearId, 'review-state-submissions'),
          ),
        ],
      },
    ],
    bottomModel: [],
  }),

  DOE: (yearId) => ({
    topModel: [
      {
        label: 'XVI Financial Commission',
        routerLink: ['/xvifc'],
        icon: 'bi bi-bank',
      },
      { label: '_', separator: true },
      buildMenuItem('Workspace', 'bi bi-building-gear', buildXvifcFeatureLink('DOE', yearId)),
    ],
    bottomModel: [],
  }),
};
