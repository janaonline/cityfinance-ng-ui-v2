import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SfcStatusApiResponse, SfcStatusFormData } from './sfc-status.models';

@Injectable({ providedIn: 'root' })
export class SfcStatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getSfcStatusForm(stateId: string, yearId: string): Observable<SfcStatusFormData> {
    return this.http
      .get<SfcStatusApiResponse>(`${this.baseUrl}xvi-fc/state/sfc-status/${stateId}/${yearId}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error('SFC status form data could not be loaded.');
          }
          return response.data;
        }),
      );
  }
}
