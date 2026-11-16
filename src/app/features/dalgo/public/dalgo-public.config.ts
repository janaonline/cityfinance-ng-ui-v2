/** URL slugs of the public (no-login) dashboards served at `dalgo/:pageType`. */
export enum PublicDashboardType {
  MARKET_READINESS = 'market_readiness',
  AP_DASHBOARD = 'ap_dashboard',
  NMAM_CITY_RESPONSE = 'nmam_city_response_dashboard',
  RT_MUNICIPAL_FINANCE = 'rt_municipal_finance_dashboard',
}

export interface PublicDashboardDetails {
  type: PublicDashboardType;
  id: string;
}

export const PUBLIC_DASHBOARD_REGISTRY: Record<PublicDashboardType, PublicDashboardDetails> = {
  [PublicDashboardType.MARKET_READINESS]: {
    type: PublicDashboardType.MARKET_READINESS,
    id: 'd8eb1ef2-d91c-40f3-b81e-8f8ed92455b5',
  },
  [PublicDashboardType.AP_DASHBOARD]: {
    type: PublicDashboardType.AP_DASHBOARD,
    id: '137e753c-21b4-4d4f-a0a0-a80b3cbd2a52',
  },
  [PublicDashboardType.NMAM_CITY_RESPONSE]: {
    type: PublicDashboardType.NMAM_CITY_RESPONSE,
    id: '0018e5ef-f45c-4cdf-a937-80f12c035c44',
  },
  [PublicDashboardType.RT_MUNICIPAL_FINANCE]: {
    type: PublicDashboardType.RT_MUNICIPAL_FINANCE,
    id: '001526de-2c53-4f5d-aef4-b6ab2f93c3cd',
  },
};

export function getPublicDashboard(pageType: string | null | undefined): PublicDashboardDetails | null {
  if (!pageType || !Object.prototype.hasOwnProperty.call(PUBLIC_DASHBOARD_REGISTRY, pageType)) return null;
  return PUBLIC_DASHBOARD_REGISTRY[pageType as PublicDashboardType];
}
