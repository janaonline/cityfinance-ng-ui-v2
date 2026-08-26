import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FormStatusData {
  annualAccountId: string | null;
  auditedData: { form_status: string; form_status_id: number };
  unauditedData: { form_status: string; form_status_id: number };
  unspentBalanceDisclosure: {
    form_status: 'NOT_STARTED' | 'SUBMITTED';
    form_status_id: null;
  };
  xviFcBankAccount?: {
    form_status: string;
    form_status_id: number;
  };
  serviceLevelBenchmarks?: {
    form_status: string;
    form_status_id: number;
  };
}

const API = `${environment.api.url2}`;

function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && 'data' in r ? r['data'] : r) as T;
}

/** Holds the live annual-account form-status fetched from the API.
 *  Permission checks live in XviFcPermissionService, not here. */
@Injectable({ providedIn: 'root' })
export class AnnualAccountStateService {
  private readonly http = inject(HttpClient);

  readonly formStatus = signal<FormStatusData | null>(null);
  readonly loadError = signal<string | null>(null);

  async loadFormStatus(ulbId: string, designYearId: string): Promise<void> {
    this.loadError.set(null);
    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API}xvi-fc/form-status/${ulbId}/${designYearId}`));
      this.formStatus.set(unwrap<FormStatusData>(result));
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        // No record yet — leave formStatus null so UI shows pending state.
        return;
      }
      this.loadError.set('Failed to load form status. Please refresh and try again.');
    }
  }
}
