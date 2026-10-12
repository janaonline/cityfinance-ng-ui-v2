import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StatusHistoryPage } from './status-history.models';

interface FormHistoryResponse {
  success: boolean;
  message: string;
  data?: StatusHistoryPage;
}

/** Role-neutral: any reviewer table (PMU today, MoHUA later) passes the same form id the worklist
 *  already uses (`PmuReviewFormId` values — SFC_STATUS, GTC, DEVOLUTION_FORMULA, ELECTED_BODY,
 *  FC_UNSPENT). `installment` is only sent for installment-scoped forms (GTC, Devolution Formula). */
@Injectable({ providedIn: 'root' })
export class FormStatusHistoryService {
  private readonly http = inject(HttpClient);

  /** One page (server default 20, hard max 50). Omit `cursor` for the newest page; pass the previous
   *  page's `nextCursor` for the next, older one. */
  getHistory(
    form: string,
    stateId: string,
    yearId: string,
    installment?: number,
    cursor?: string,
  ): Observable<StatusHistoryPage> {
    let params = new HttpParams();
    if (installment !== undefined) params = params.set('installment', String(installment));
    if (cursor) params = params.set('cursor', cursor);

    return this.http
      .get<FormHistoryResponse>(`${environment.api.url2}xvi-fc/form-history/${form}/${stateId}/${yearId}`, { params })
      .pipe(
        map((res) => {
          if (!res.success) throw res;
          return res.data ?? { entries: [], hasMore: false, nextCursor: null };
        }),
      );
  }
}
