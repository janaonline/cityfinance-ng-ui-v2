import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ExploresectionTable } from '../home/dashboard-map-section/interfaces';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}
  dashboardInformation(ifPeople = true, ulbOrStateid: any, type: string | string[], year: string) {
    let headers = new HttpHeaders();
    headers = headers.append('type', type);
    let request = '';
    // if (national) {
    //   request = `${environment.api.url}all-dashboard/people-information?year=${year}?national=${national}`;
    // }
    if (ifPeople) request = `${environment.api.url}all-dashboard/people-information?year=${year}`;
    else request = `${environment.api.url}all-dashboard/money-information?year=${year}`;

    if (type == 'ulb') {
      request += `&ulb=${ulbOrStateid}`;
    } else if (type == 'national') {
      request += `&type=${type}`;
    } else request += `&state=${ulbOrStateid}`;
    return this.http.get(request, { headers });
  }

  getDashboardTabData(dashboardId: string) {
    return this.http.get(`${environment.api.url}dashboardHeaders/${dashboardId}`);
  }

  getLatestDataYear(ulb: any) {
    return this.http.get(`${environment.api.url}all-dashboard/latest-year?ulb=${ulb}`);
  }

  getYearList(ulb: string | number) {
    return this.http.get(`${environment.api.url}all-dashboard/latest-year/list?ulb=${ulb}`);
  }
  getMoUData(ulb: any) {
    return this.http.get(`${environment.api.url}UA/getUAfile?ulbId=${ulb}`);
  }

  getMoneyInfo(year: string = '', stateId: string = '', ulbId: string = '') {
    let params = new HttpParams();
    if (year) params = params.set('year', year);
    if (stateId) params = params.set('stateId', stateId);
    if (ulbId) params = params.set('ulbId', ulbId);

    return this.http.get<{
      result: ExploresectionTable[];
      year: string;
      audit_status: string | null;
      isActive: boolean;
      lastModifiedAt: string | null;
    }>(`${environment.api.url}dashboard/financial-info/get-data`, { params });
  }
}
