import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ICreditRatingData } from '../../core/models/creditRating/creditRatingResponse';
import { BorrowingsKeys, BsIsData, ExploresectionTable, ISlb } from '../../core/models/interfaces';

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

  // Money info cards: tax rev, own rev, grants, tot rev, tot exp, bs size.
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

  // City page: balance sheet and income statement table.
  getBsIsData(ulbId: string, btnKey: string = 'incomeStatement') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    params = params.set('btnKey', btnKey);

    return this.http.get<{ data: BsIsData[]; population: number }>(
      `${environment.api.url}dashboard/city/bs-is`,
      {
        params,
      },
    );
  }

  // City page: borrowings section.
  getBorrowingsData(ulbId: string = '', stateId: string = '') {
    let params = new HttpParams();
    if (ulbId) params = params.set('ulbId', ulbId);
    if (stateId) params = params.set('stateId', stateId);

    return this.http.get<{ data: BorrowingsKeys[] }>(`${environment.api.url}/BondIssuerItem`, {
      params,
    });
  }

  // Json file in UI.
  getCreditRatingsData() {
    return this.http.get<ICreditRatingData[]>(`/assets/files/credit-rating-new.json`);
  }

  // Get 28 Slbs data.
  fetchCitySlbChartData(type = 'Water Supply', compUlb = '', ulb = '', year = '2020-21') {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (compUlb) params = params.set('compUlb', compUlb);
    if (ulb) params = params.set('ulb', ulb);
    if (year) params = params.set('year', year);

    return this.http.get<{ data: ISlb[] }>(`${environment.api.url}indicators`, { params });
  }
}
