import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import {
  ApiResponse,
  FileService,
  S3SignedUrlRequestItem,
  S3UrlResult,
} from '../../../../../shared/dynamic-form/components/file/file.service';
import { BudgetDocumentResponse, UploadBudgetDocumentPayload } from './xvi-fc-budget-document.models';

@Injectable({ providedIn: 'root' })
export class XviFcBudgetDocumentService {
  private readonly http = inject(HttpClient);
  private readonly fileService = inject(FileService);
  private readonly baseUrl = environment.api.url2;

  getBudgetDocument(yearId: string): Observable<BudgetDocumentResponse> {
    return this.http
      .get<ApiResponse<BudgetDocumentResponse> | BudgetDocumentResponse>(
        `${this.baseUrl}xvi-fc/budget-document?yearId=${encodeURIComponent(yearId)}`,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  uploadBudgetDocument(payload: UploadBudgetDocumentPayload): Observable<BudgetDocumentResponse> {
    return this.http
      .post<ApiResponse<BudgetDocumentResponse> | BudgetDocumentResponse>(
        `${this.baseUrl}xvi-fc/budget-document`,
        payload,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  getSignedUrls(items: S3SignedUrlRequestItem[]): Observable<S3UrlResult[]> {
    return this.fileService.getSignedUrls(items);
  }

  uploadToS3(signedUrl: string, file: File): Observable<void> {
    return from(
      fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`S3 upload failed (${res.status} ${res.statusText}).`);
        }
      }),
    );
  }

  private unwrap<T>(res: ApiResponse<T> | T): T {
    if (res !== null && typeof res === 'object' && 'success' in (res as object)) {
      return (res as ApiResponse<T>).data;
    }
    return res as T;
  }
}
