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
  {
    path: 'validation',
    loadComponent: () =>
      import('./ocr-validation/ocr-validation.component').then(
        (mod) => mod.OcrValidationComponent,
      ),
  },
  {
    path: 'validation-list',
    loadComponent: () =>
      import('./ocr-validation-list/ocr-validation-list.component').then(
        (mod) => mod.OcrValidationListComponent,
      ),
  },

];
