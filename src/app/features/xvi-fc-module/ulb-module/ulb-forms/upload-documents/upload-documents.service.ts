import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import type { UploadDocumentDef, UploadPageConfig } from './upload-documents.component';

interface ApiFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  validations?: Array<{ name: string; validator: unknown; message: string }>;
}

interface UploadConfigApiData {
  meta: {
    uploadType: 'audited' | 'provisional';
    description: string;
    confirmLabel: string;
    documentYearId: string;
    documentYear: string;
  };
  data: ApiFieldConfig[];
}

@Injectable({ providedIn: 'root' })
export class UploadDocumentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getUploadConfig(type: 'audited' | 'provisional', designYearId: string): Observable<UploadPageConfig> {
    return this.http
      .get<
        { success: boolean; data: UploadConfigApiData } | UploadConfigApiData
      >(`${this.baseUrl}xvi-fc/annual-account/upload-config/${type}?yearId=${designYearId}`)
      .pipe(
        map((res) => {
          // Dev server returns raw payload; local NestJS wraps it as { success, data, timestamp }
          const apiData = 'success' in res ? res.data : res;
          return this.mapToConfig(type, apiData);
        }),
      );
  }

  private mapToConfig(type: 'audited' | 'provisional', apiData: UploadConfigApiData): UploadPageConfig {
    return {
      type,
      description: apiData.meta.description,
      confirmLabel: apiData.meta.confirmLabel,
      documentYearId: apiData.meta.documentYearId,
      documentYear: apiData.meta.documentYear,
      documents: apiData.data.map(
        (field): UploadDocumentDef => ({
          id: field.key,
          title: field.label,
          subtitle: field.placeholder ?? '',
          required: field.required !== false,
          allowedFileTypes: field.allowedFileTypes ?? ['pdf'],
          maxFileSize: field.maxFileSize ?? 50,
          minPages: field.validations?.find((v) => v.name === 'minPages')?.validator as number | undefined,
        }),
      ),
    };
  }
}
