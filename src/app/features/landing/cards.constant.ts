import type { HomeCard } from './landing.component';

// TS-1262 — the 7 module cards from the ticket's table, plus XVI-FC Data Collection and State
// Dashboard (not in the ticket's table, added afterwards so every module the top nav already
// links to is actually reachable from "one home page with all my modules" — see nav-menu.config.ts
// for the same role gating these two already had there). Discussion Board and Public Disclosure
// keep the prototype's descriptive copy but are shipped as "comingSoon" here, trusting the
// ticket's written table over the (stale) prototype screenshot that badged them "live".
export const landingCards: HomeCard[] = [
  {
    title: 'Announcements',
    description: 'Program updates and notices from MoHUA and the Finance Commission secretariat.',
    icon: 'campaign',
    accent: 'gray',
    status: 'comingSoon',
  },
  {
    title: 'XVI-FC Grants',
    description:
      'Compliance uploads, state review, MoHUA verification, and sanction letters for the 16th Finance Commission grant cycle.',
    icon: 'account_balance',
    accent: 'blue',
    status: 'live',
    roles: ['ULB', 'STATE', 'MoHUA'],
    route: ['/xvifc/year'],
  },
  {
    title: 'XV-FC Grants',
    description:
      "Read-only record of 15th Finance Commission grant disbursements, utilisation reports, and sanction orders.",
    icon: 'archive',
    accent: 'green',
    status: 'readonly',
    roles: ['ULB', 'STATE', 'MoHUA'],
    // Separate deployed app (not this one) — same origin and token store, so no second sign-in on
    // staging/production. See login.service.ts navigateAfterLogin for the full explanation.
    link: '/v1/fc-home-page',
  },
  {
    title: 'XVI-FC Data Collection',
    description: 'Submit your ULB’s standardised financial data for the 16th Finance Commission report.',
    icon: 'edit_document',
    accent: 'indigo',
    status: 'live',
    roles: ['ULB'],
    route: ['/xvifc-form'],
  },
  {
    title: 'State Dashboard',
    description: 'Revenue and expenditure data for Urban Local Bodies, from FY 2019-20 to FY 2022-23.',
    icon: 'query_stats',
    accent: 'green',
    status: 'live',
    roles: ['STATE', 'STATE_DASHBOARD'],
    // Same V1 app as XV-FC Grants above — see that card's note.
    link: '/v1/state-dashboard',
  },
  {
    title: 'XV-FC Data Review',
    description: 'A dedicated space to review XV Finance Commission ULB data once this module is ready.',
    icon: 'table_chart',
    accent: 'gray',
    status: 'comingSoon',
  },
  {
    title: 'Discussion Board',
    description: 'Questions, updates and resources shared between ULBs, States and MoHUA.',
    icon: 'forum',
    accent: 'gray',
    status: 'comingSoon',
  },
  {
    title: 'Public Disclosure',
    description: "See every state's SFC and Elected Bodies status, not just your own state or role.",
    icon: 'public',
    accent: 'gray',
    status: 'comingSoon',
  },
  {
    title: 'Municipal Data Hub',
    description: 'State and ULB-level municipal finance data for the Municipal Data Hub pilot states.',
    icon: 'dashboard',
    accent: 'orange',
    status: 'live',
    roles: ['MoHUA', 'ULB', 'STATE'],
    municipalDataHubGated: true,
    route: ['/municipal-data-hub'],
  },
];
