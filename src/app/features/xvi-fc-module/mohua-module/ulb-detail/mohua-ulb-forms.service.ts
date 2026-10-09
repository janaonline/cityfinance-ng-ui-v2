import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SlbService } from '../../ulb-module/ulb-forms/slb/slb.service';
import { UploadDocumentsService } from '../../ulb-module/ulb-forms/upload-documents/upload-documents.service';
import { ApiEnvelope, unwrapNullableResponse } from '../api-response.util';
import {
  AnnualSectionResponse,
  BankAccountRecord,
  DurRecord,
  FormLoad,
  UlbFormStatuses,
  UlbFormsData,
} from './ulb-detail.models';

/** A failed call must not take the whole page down: it becomes `{ data: null, failed: true }`. */
function safely<T>(source: Observable<T | null>): Observable<FormLoad<T>> {
  return source.pipe(
    map((data) => ({ data, failed: false })),
    catchError(() => of({ data: null, failed: true })),
  );
}

/**
 * Loads one ULB's five forms for MoHUA, read-only. The form contents come from existing per-ULB GETs that the
 * ULB and the State reviewer already use; each form's status text and "submitted" flag come from the MoHUA API,
 * which owns that rule.
 */
@Injectable({ providedIn: 'root' })
export class MohuaUlbFormsService {
  private readonly http = inject(HttpClient);
  private readonly slbService = inject(SlbService);
  private readonly uploadDocuments = inject(UploadDocumentsService);
  private readonly api = `${environment.api.url2}xvi-fc/`;

  load(ulbId: string, yearId: string): Observable<UlbFormsData> {
    const section = (name: 'auditedData' | 'unauditedData') =>
      safely(
        this.http
          .get<
            ApiEnvelope<AnnualSectionResponse> | AnnualSectionResponse | null
          >(`${this.api}annual-account/by-ulb/${ulbId}/${yearId}`, { params: { section: name } })
          .pipe(map((response) => unwrapNullableResponse<AnnualSectionResponse>(response))),
      );

    return forkJoin({
      audited: section('auditedData'),
      unaudited: section('unauditedData'),
      auditedConfig: safely(this.uploadDocuments.getUploadConfig('audited', yearId)),
      provisionalConfig: safely(this.uploadDocuments.getUploadConfig('provisional', yearId)),
      bank: safely(
        this.http
          .get<
            ApiEnvelope<BankAccountRecord> | BankAccountRecord | null
          >(`${this.api}bank-account`, { params: { ulbId, yearId } })
          .pipe(map((response) => unwrapNullableResponse<BankAccountRecord>(response))),
      ),
      slb: safely(this.slbService.getSlbForm(ulbId, yearId)),
      statuses: safely(
        this.http
          .get<ApiEnvelope<UlbFormStatuses> | UlbFormStatuses | null>(`${this.api}mohua/ulb/${ulbId}/${yearId}/forms`)
          .pipe(map((response) => unwrapNullableResponse<UlbFormStatuses>(response))),
      ),
      dur: safely(
        this.http
          .get<ApiEnvelope<DurRecord> | DurRecord | null>(`${this.api}dur/by-ulb/${ulbId}/${yearId}`)
          .pipe(map((response) => unwrapNullableResponse<DurRecord>(response))),
      ),
    });
  }
}
