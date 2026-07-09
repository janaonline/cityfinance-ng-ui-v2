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
  {
    path: 'eval-benchmarks',
    loadComponent: () =>
      import('./ocr-eval-benchmarks/ocr-eval-benchmarks.component').then(
        (mod) => mod.OcrEvalBenchmarksComponent,
      ),
  },
  {
    path: 'eval-run-detail',
    loadComponent: () =>
      import('./ocr-eval-run-detail/ocr-eval-run-detail.component').then(
        (mod) => mod.OcrEvalRunDetailComponent,
      ),
  },
  {
    path: 'eval-run-compare',
    loadComponent: () =>
      import('./ocr-eval-run-compare/ocr-eval-run-compare.component').then(
        (mod) => mod.OcrEvalRunCompareComponent,
      ),
  },

];
