import type { RoleCard } from './landing.component';

export const landingCards: RoleCard[] = [
  {
    title: 'XV FC',
    subtitle: 'ULB',
    description: 'Upload compliance documents, track submission status, and monitor your eligible grant amount.',
    icon: 'bar_chart',
    accent: 'green',
    col: 'col-12 col-md-6',
    allowedRoles: ['ULB', 'STATE', 'MOHUA', 'DOE', 'ADMIN'],
    link: '/v1/fc-home-page',
  },
  {
    title: 'XVI FC',
    subtitle: 'STATE REVIEWER',
    description: 'Review ULB submissions, validate compliance documents, and forward eligible applications to MoHUA.',
    icon: 'account_balance',
    accent: 'blue',
    col: 'col-12 col-md-6',
    allowedRoles: ['ULB', 'STATE', 'MOHUA', 'DOE', 'ADMIN'],
    route: ['/xvifc/year'],
  },
  // {
  //   title: 'XV FC Review',
  //   subtitle: 'MINISTRY REVIEWER',
  //   description:
  //     'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
  //   icon: 'track_changes',
  //   accent: 'orange',
  //   col: 'col-12 col-md-4',
  //   allowedRoles: ['ULB', 'ADMIN'],
  //   route: ['/auth/login', 'XVIFC'],
  // },
  // {
  //   title: 'OCR Validation',
  //   subtitle: 'Admin REVIEWER',
  //   description:
  //     'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
  //   icon: 'track_changes',
  //   accent: 'orange',
  //   col: 'col-12 col-md-4',
  //   allowedRoles: ['ADMIN'],
  //   route: ['/auth/login', 'XVIFC'],
  // },
  //   {
  //     title: 'MoHUA Reviewer',
  //     subtitle: 'MINISTRY REVIEWER',
  //     description:
  //       'Review state-validated submissions, run compliance checks, and issue sanction letters for fund release.',
  //     icon: 'track_changes',
  //     accent: 'orange',
  //     col: 'col-12 col-md-4',
  //     allowedRoles: ['MOHUA', 'DOE', 'ADMIN'],
  //     route: ['/auth/login', 'XVIFC'],
  //   },
  //   {
  //     title: 'Admin (Tech Team)',
  //     subtitle: 'ADMIN',
  //     description: 'Send system notifications, bulk reminders, and manage communications across all user roles.',
  //     icon: 'notifications',
  //     accent: 'indigo',
  //     col: 'col-12 col-md-4',
  //     route: ['/auth/login'],
  //   },
  // {
  //   title: 'Community Board',
  //   subtitle: 'OPEN DISCUSSION',
  //   description:
  //     'Ask questions, share resources, and discuss urban local body grants with officials across states and ministries.',
  //   icon: 'groups',
  //   accent: 'green',
  //   btnLabel: 'Browse',
  //   link: '/forum',
  // },
];
