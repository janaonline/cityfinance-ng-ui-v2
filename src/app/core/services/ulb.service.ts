import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IUlbSummary } from '../models/ulb-summary';

@Injectable({
  providedIn: 'root',
})
export class UlbService {
  private readonly http = inject(HttpClient);

  searchAutocomplete(query: string, limit = 20) {
    return this.http.get<IUlbSummary[]>(environment.api.url3 + 'ulbs/autocomplete', {
      params: { q: query, limit: String(limit) },
    });
  }
}
