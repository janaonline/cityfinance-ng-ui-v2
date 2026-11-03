import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

interface GuestTokenResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class SupersetService {
  private readonly http = inject(HttpClient);

  getGuestToken(dashboardId: string): Observable<string> {
    const body = { resources: [{ type: 'dashboard', id: dashboardId }] };
    return this.http.post<GuestTokenResponse>(`${environment.api.url}dalgo/auth`, body).pipe(
      map((response) => response.token),
      catchError((error) => {
        console.error('Superset guest token request failed:', error);
        return throwError(() => new Error("Couldn't connect to Superset"));
      }),
    );
  }
}
