import { Routes } from '@angular/router';
import { uploadDocumentsDeactivateGuard } from './ulb-forms/upload-documents/upload-documents-deactivate.guard';

export const ULB_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./ulb-module.component').then((m) => m.UlbModuleComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () => import('./overview/overview.component').then((m) => m.OverviewComponent),
      },
      {
        path: 'support-hours',
        loadComponent: () => import('./support-hours/support-hours.component').then((m) => m.SupportHoursComponent),
      },
      {
        path: 'faq',
        loadComponent: () => import('../shared/faq/faq.component').then((m) => m.FaqComponent),
      },
      {
        path: 'ulb-forms',
        loadComponent: () => import('./ulb-forms/ulb-forms.component').then((m) => m.UlbFormsComponent),
      },
      {
        path: 'upload-audited',
        loadComponent: () =>
          import('./ulb-forms/upload-documents/upload-documents.component').then((m) => m.UploadDocumentsComponent),
        data: { uploadType: 'audited' },
        canDeactivate: [uploadDocumentsDeactivateGuard],
      },
      {
        path: 'upload-provisional',
        loadComponent: () =>
          import('./ulb-forms/upload-documents/upload-documents.component').then((m) => m.UploadDocumentsComponent),
        data: { uploadType: 'provisional' },
        canDeactivate: [uploadDocumentsDeactivateGuard],
      },
      {
        path: 'fill-disclosure',
        loadComponent: () =>
          import('./ulb-forms/fill-disclosure/fill-disclosure.component').then((m) => m.FillDisclosureComponent),
      },
      {
        path: 'xvi-fc-bank-account',
        loadComponent: () =>
          import('./ulb-forms/xvi-fc-bank-account/xvi-fc-bank-account.component').then(
            (m) => m.XviFcBankAccountComponent,
          ),
      },
      {
        path: 'slb',
        loadComponent: () => import('./ulb-forms/slb/slb.component').then((m) => m.SlbComponent),
      },
      {
        path: 'roles-teams-unified-view',
        loadComponent: () =>
          import('./roles-teams-overview/roles-teams-overview.component').then((m) => m.RolesTeamsOverviewComponent),
      },
      {
        path: '**',
        redirectTo: '/xvifc',
      },
    ],
  },
];
