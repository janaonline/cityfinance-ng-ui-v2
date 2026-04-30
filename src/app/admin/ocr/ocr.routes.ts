import { Route } from '@angular/router';

export const OCR_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./ocr-list/ocr-list.component').then((mod) => mod.OcrListComponent),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./upload-file-ocr/upload-file-ocr.component').then(
        (mod) => mod.UploadFileOcrComponent,
      ),
  },
  {
    path: 'details',
    loadComponent: () =>
      import('./get-ocr-details/get-ocr-details.component').then(
        (mod) => mod.GetOcrDetailsComponent,
      ),
  },
];
