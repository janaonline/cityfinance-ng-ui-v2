import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface FormStatusData {
  annualAccountId: string | null;
  auditedData: { form_status: string; form_status_id: number };
  unauditedData: { form_status: string; form_status_id: number };
}

const API = `${environment.api.url2}`;

/** Holds the live annual-account form-status fetched from the API.
 *  Permission checks live in XviFcPermissionService, not here. */
@Injectable({ providedIn: 'root' })
export class AnnualAccountStateService {
  private readonly http = inject(HttpClient);

  readonly formStatus = signal<FormStatusData | null>(null);

  async loadFormStatus(ulbId: string, designYearId: string): Promise<void> {
    try {
      const result = await firstValueFrom(
        this.http.get<{ success: boolean; data: FormStatusData }>(
          `${API}xvi-fc/annual-account/form-status/${ulbId}/${designYearId}`,
        ),
      );
      this.formStatus.set(result.data);
    } catch {
      // No record yet (404) or network error — leave signal null so UI shows pending state
    }
  }
}
