import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

/** An Autonomous District Council, as returned by `GET master/adc`. */
export interface IAdc {
  _id: string;
  name: string;
  state: string;
}

@Injectable({ providedIn: 'root' })
export class AdcService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.url2}master/adc`;

  /**
   * Active ADCs. ADMIN gets the given state's ADCs (or every state's when `stateId` is omitted); a State user
   * always gets its own state's regardless of the param, so only ADMIN callers need to pass it.
   */
  list(stateId?: string): Observable<IAdc[]> {
    let params = new HttpParams();
    if (stateId) params = params.set('stateId', stateId);
    return this.http.get<unknown>(this.baseUrl, { params }).pipe(map((res) => unwrapList<IAdc>(res)));
  }
}

// The dev backend may return a bare array instead of the { success, data } envelope.
function unwrapList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const data = (response as { data?: unknown } | null)?.data;
  return Array.isArray(data) ? (data as T[]) : [];
}
