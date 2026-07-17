import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { StateDashboardApiResponse } from './state-dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class StateDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getDashboard(stateId: string, yearId: string): Observable<StateDashboardApiResponse> {
    return this.http.get<StateDashboardApiResponse>(`${this.baseUrl}xvi-fc/state/${stateId}/${yearId}/dashboard`);
  }
}
