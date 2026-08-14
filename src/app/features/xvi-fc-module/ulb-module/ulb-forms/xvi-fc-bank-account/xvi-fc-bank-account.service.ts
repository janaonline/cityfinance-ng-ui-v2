import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { FileService, S3SignedUrlRequestItem, S3UrlResult } from '../../../../../shared/dynamic-form/components/file/file.service';
import {
  ApiResponse,
  SubmitXviFcBankAccountPayload,
  XviFcBankAccountFormConfig,
  XviFcBankAccountResponse,
  XviFcIfscLookupResponse,
} from './xvi-fc-bank-account.models';

@Injectable({ providedIn: 'root' })
export class XviFcBankAccountService {
  private readonly http = inject(HttpClient);
  private readonly fileService = inject(FileService);
  private readonly baseUrl = environment.api.url2;

  getBankAccount(params: { yearId: string; ulbId?: string }): Observable<XviFcBankAccountResponse | null> {
    const query = new URLSearchParams({ yearId: params.yearId });
    if (params.ulbId) query.set('ulbId', params.ulbId);

    return this.http
      .get<ApiResponse<XviFcBankAccountResponse | null> | XviFcBankAccountResponse | null>(
        `${this.baseUrl}xvi-fc/bank-account?${query.toString()}`,
      )
      .pipe(map((res) => (res === null ? null : this.unwrap(res))));
  }

  getFormConfig(yearId: string): Observable<XviFcBankAccountFormConfig> {
    return this.http
      .get<ApiResponse<XviFcBankAccountFormConfig> | XviFcBankAccountFormConfig>(
        `${this.baseUrl}xvi-fc/bank-account/form-config?yearId=${encodeURIComponent(yearId)}`,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  lookupIfsc(ifscCode: string): Observable<XviFcIfscLookupResponse> {
    return this.http
      .get<ApiResponse<XviFcIfscLookupResponse> | XviFcIfscLookupResponse>(
        `${this.baseUrl}xvi-fc/bank-account/ifsc/${encodeURIComponent(ifscCode)}`,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  submitBankAccount(payload: SubmitXviFcBankAccountPayload): Observable<XviFcBankAccountResponse> {
    return this.http
      .post<ApiResponse<XviFcBankAccountResponse> | XviFcBankAccountResponse>(
        `${this.baseUrl}xvi-fc/bank-account`,
        payload,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  getSignedUrls(items: S3SignedUrlRequestItem[]): Observable<S3UrlResult[]> {
    return this.fileService.getSignedUrls(items);
  }

  uploadProofToS3(signedUrl: string, file: File): Observable<void> {
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
