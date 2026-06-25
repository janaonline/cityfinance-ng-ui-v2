import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

export interface S3UrlItemDto {
  fileName: string;
  mimeType: string;
  fileSize?: number;
  pages?: number;
  folder?: string;
}

export interface S3UrlResult {
  url: string;
  fileAlias: string;
  fileUrl: string;
  path: string;
  fileSize?: number;
  pages?: number;
}

export interface DisclosureDocPayload {
  filepath: string;
  originalName: string;
  mimeType: string;
  sizeKb: number;
  pages: number;
}

export interface BankAccountPayload {
  accountNumber: string;
  unspentBalance: number;
  documents: DisclosureDocPayload[];
}

export interface FcPeriodPayload {
  manual: {
    bankAccounts: BankAccountPayload[];
  };
}

export interface SubmitDisclosurePayload {
  designYearId: string;
  fc14: FcPeriodPayload;
  fc15: FcPeriodPayload;
}

export interface DisclosureRecord {
  _id: string;
  ulb: string;
  designYear: string;
  fc14: FcPeriodPayload;
  fc15: FcPeriodPayload;
  formStatus: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** Folder under which all disclosure supporting documents are stored in S3. */
export const DISCLOSURE_S3_FOLDER = 'xvifc/unspent-balance-docs';

@Injectable({ providedIn: 'root' })
export class FillDisclosureService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  /** Batch-request presigned S3 PUT URLs for a list of files. */
  getSignedUrls(items: S3UrlItemDto[]): Observable<S3UrlResult[]> {
    return this.http
      .post<{ success: boolean; data: S3UrlResult[] } | S3UrlResult[]>(
        `${this.baseUrl}s3/signed-url`,
        items,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  /**
   * PUT a file directly to S3 using a presigned URL.
   * Uses the native fetch API to avoid Angular HTTP interceptors, which would
   * otherwise add an Authorization header that breaks the presigned signature.
   */
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

  /** Submit or re-submit a disclosure. The backend upserts on (ulb, designYear). */
  submitDisclosure(payload: SubmitDisclosurePayload): Observable<DisclosureRecord> {
    return this.http
      .post<{ success: boolean; data: DisclosureRecord } | DisclosureRecord>(
        `${this.baseUrl}xvi-fc/unspent-balance-disclosure`,
        payload,
      )
      .pipe(map((res) => this.unwrap(res)));
  }

  /** Retrieve an existing disclosure by design year (and optionally ULB ID). */
  getDisclosure(yearId: string, ulbId?: string): Observable<DisclosureRecord | null> {
    const params = new URLSearchParams({ yearId });
    if (ulbId) params.set('ulbId', ulbId);
    return this.http
      .get<{ success: boolean; data: DisclosureRecord | null } | DisclosureRecord | null>(
        `${this.baseUrl}xvi-fc/unspent-balance-disclosure?${params.toString()}`,
      )
      .pipe(
        map((res) =>
          res === null
            ? null
            : this.unwrap(res as { success: boolean; data: DisclosureRecord | null } | DisclosureRecord),
        ),
      );
  }

  /**
   * Generate a presigned S3 GET URL for a document that was previously saved
   * on the disclosure record. Use this to open/download stored documents.
   */
  getDocumentSignedUrl(
    disclosureId: string,
    filepath: string,
  ): Observable<{ signedUrl: string }> {
    const url =
      `${this.baseUrl}xvi-fc/unspent-balance-disclosure/` +
      `${encodeURIComponent(disclosureId)}/documents/signed-url` +
      `?filepath=${encodeURIComponent(filepath)}`;
    return this.http
      .get<{ success: boolean; data: { signedUrl: string } } | { signedUrl: string }>(url)
      .pipe(map((res) => this.unwrap(res)));
  }

  private unwrap<T>(res: { success: boolean; data: T } | T): T {
    if (res !== null && typeof res === 'object' && 'success' in (res as object)) {
      return (res as { success: boolean; data: T }).data;
    }
    return res as T;
  }
}
