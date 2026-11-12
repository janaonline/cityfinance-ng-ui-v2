import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiEnvelope, unwrapResponse } from '../api-response.util';
import {
  CLAIMS_INSTALLMENT,
  ClaimLetterDetail,
  ClaimLetterSoDecision,
  ClaimLetterUlbs,
  ClaimLettersStates,
  StateClaimLetters,
} from './claims-submission.models';
import type {
  ReturnLetterDialogResult,
  ReturnUlbDialogResult,
} from './return-dialog/return-claim-letter-dialog.component';

/** Claim letter data for MoHUA's Claims & Submissions screens, plus the SO's approve and return. */
@Injectable({ providedIn: 'root' })
export class ClaimsSubmissionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}xvi-fc/mohua/claim-letters/`;

  getStates(yearId: string): Observable<ClaimLettersStates> {
    return this.get<ClaimLettersStates>(`${yearId}/${CLAIMS_INSTALLMENT}`);
  }

  getStateClaimLetters(stateId: string, yearId: string): Observable<StateClaimLetters> {
    return this.get<StateClaimLetters>(`state/${stateId}/${yearId}/${CLAIMS_INSTALLMENT}`);
  }

  getClaimLetter(claimLetterId: string): Observable<ClaimLetterDetail> {
    return this.get<ClaimLetterDetail>(`letter/${claimLetterId}`);
  }

  getClaimLetterUlbs(claimLetterId: string, query: { search?: string; page?: number; limit?: number }): Observable<ClaimLetterUlbs> {
    let params = new HttpParams();
    if (query.search) params = params.set('search', query.search);
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    return this.get<ClaimLetterUlbs>(`letter/${claimLetterId}/ulbs`, params);
  }

  approveClaimLetter(claimLetterId: string, expectedRevision: number, remark?: string): Observable<ClaimLetterDetail> {
    return this.http
      .post<ApiEnvelope<ClaimLetterDetail> | ClaimLetterDetail>(`${this.baseUrl}letter/${claimLetterId}/approve`, {
        expectedRevision,
        ...(remark ? { remark } : {}),
      })
      .pipe(map((response) => unwrapResponse(response)));
  }

  /** SO return: the letter closes; the ULBs marked returned and the picked State-wide items reopen for correction. */
  returnClaimLetter(
    claimLetterId: string,
    expectedRevision: number,
    selection: ReturnLetterDialogResult,
  ): Observable<ClaimLetterDetail> {
    return this.http
      .post<ApiEnvelope<ClaimLetterDetail> | ClaimLetterDetail>(`${this.baseUrl}letter/${claimLetterId}/return`, {
        expectedRevision,
        stateFormIds: selection.stateFormIds,
        ...(selection.stateRemark ? { stateRemark: selection.stateRemark } : {}),
      })
      .pipe(map((response) => unwrapResponse(response)));
  }

  /** The SO's return mark on one ULB (its forms, rows and remark), or PENDING to clear it. */
  decideUlb(
    claimLetterId: string,
    ulbId: string,
    decision: { status: 'PENDING' } | ({ status: 'RETURNED' } & ReturnUlbDialogResult),
  ): Observable<ClaimLetterSoDecision | null> {
    return this.http
      .put<ApiEnvelope<ClaimLetterSoDecision | null> | ClaimLetterSoDecision | null>(
        `${this.baseUrl}letter/${claimLetterId}/ulb/${ulbId}/decision`,
        decision,
      )
      .pipe(map((response) => unwrapResponse(response)));
  }

  private get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http
      .get<ApiEnvelope<T> | T>(`${this.baseUrl}${path}`, { params })
      .pipe(map((response) => unwrapResponse(response)));
  }
}
