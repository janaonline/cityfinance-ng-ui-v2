import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class XviFcService {

  constructor(private http: HttpClient) { }

  getUlbForm(ulb: string) {
    const params = { ulb };
    return this.http.get(
      `${environment.api.url}xviFc/fetch_form`, { params }
    );
  }
}