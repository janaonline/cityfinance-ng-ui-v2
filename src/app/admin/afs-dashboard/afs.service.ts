import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface ResponseData {
  success: boolean;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class AfsService {

  constructor(private http: HttpClient) { }

  getFilters() {
    const url = `${environment.api.url}afs-digitization/afs-filters`;
    return this.http.get<any>(url);
  }

  getRequestLog(requestId: string) {
    const url = `${environment.api.url2}afs-digitization/request-log/${requestId}`;
    return this.http.get<ResponseData>(url);
  }

  getAfsList(params: any) {
    const url = `${environment.api.url2}afs-digitization/afs-list`;
    return this.http.get<any>(url, { params });
  }
}
