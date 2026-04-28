import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface NextSupportHour {
  date: string;
  description: string;
  time: string;
  hostedBy: string;
}

export interface UpcomingSupportHour {
  date: string;
  details: string;
  status: string;
}

export interface SupportHoursApiResponse {
  nextSupportHour: NextSupportHour;
  upcomingSupportHours: UpcomingSupportHour[];
}

@Injectable({ providedIn: 'root' })
export class SupportHoursService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.url2;

  getSupportHours(): Observable<SupportHoursApiResponse> {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('id_token') : null;
    const headers = new HttpHeaders(
      token ? { Authorization: `Bearer ${token}`, 'x-access-token': token } : {},
    );
    return this.http
      .get<{ success: boolean; data: SupportHoursApiResponse; timestamp: string }>(
        `${this.baseUrl}xvi-fc/support-hours`,
        { headers },
      )
      .pipe(map((wrapper) => wrapper.data));
  }
}
