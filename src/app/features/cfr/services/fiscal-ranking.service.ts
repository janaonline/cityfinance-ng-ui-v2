import { KeyValue } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';

import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { USER_TYPE } from '../../../core/models/user/userType';
import { UserUtility } from '../../../core/util/user/user';
import { TableResponse } from './common-table.interface';

export enum StatusType {
  'notStarted' = 1,
  'inProgress' = 2,
  'verificationNotStarted' = 8,
  'verificationInProgress' = 9,
  'returnedByPMU' = 10,
  'ackByPMU' = 11,
}

export interface Table {
  id?: string;
  info?: string;
  endpoint?: string;
  response: TableResponse | null;
}

export interface MapData {
  _id: string;
  heatMaps: HeatMap[];
  ulbWiseData: UlbWiseData;
  formWiseData: FormWiseData;
  stateName: string;
  totalUlbs: number;
}
export interface HeatMap {
  _id: string;
  stateId: string;
  code: string;
  percentage: number;
}
export interface UlbWiseData {
  notStarted: number;
  totalUlbs: number;
  inProgress: number;
  submitted: number;
}
export interface FormWiseData {
  verificationNotStarted: number;
  totalForms: number;
  verificationInProgress: number;
  approved: number;
  rejected: number;
}

export interface TrackingHistoryData {
  srNo: number;
  action: string;
  Date: string;
}

export interface TrackingHistoryResponse {
  success: boolean;
  data: TrackingHistoryData[];
  message: string;
}
export interface FrFilter {
  label: string;
  id: string;
  key?: string;
  value?: string;
}

export interface Filter {
  stateTypeFilter?: [];
  ulbParticipationFilter?: [];
  ulbRankingStatusFilter?: [];
  populationBucketFilter?: [];
}

export interface UlbData {
  censusCode: string;
  name: string;
  populationBucket: number;
  sbCode?: string;
  ulb: string;
}

export const removeFalsy = (obj: { [s: string]: unknown } | ArrayLike<unknown>) =>
  Object.entries(obj).reduce((a: any, [k, v]) => (v ? ((a[k] = v), a) : a), {});

const getValueByPath = (response: any, path: string) => {
  return path
    .split('.')
    .reduce(
      (value: { [x: string]: any }, key: string | number) =>
        value && value[key] !== undefined ? value[key] : undefined,
      response,
    );
};

export const tableMapperPipe = (columns: any, tablePath: string = '') => {
  return map((response: any) => {
    const mutable = tablePath ? getValueByPath(response, tablePath) : response;
    console.log('mutable', mutable);
    mutable.columns =
      columns ||
      mutable.columns.map((column: any[]) => ({
        ...column,
        sort: column.sort || 0,
      }));
    return response;
  });
};

@Injectable({
  providedIn: 'root',
})
export class FiscalRankingService {
  userUtil = new UserUtility();

  public badCredentials: Subject<boolean> = new Subject<boolean>();
  public helper = new JwtHelperService();
  loginLogoutCheck = new Subject<any>();
  constructor(private http: HttpClient) {}
  getfiscalUlbForm(dYr: any, id: any) {
    return this.http.get(`${environment.api.url}fiscal-ranking/view?design_year=${dYr}&ulb=${id}`);
  }
  // cardApi : any="https://democityfinanceapi.dhwaniris.in/api/v1/FRHomePageContent";
  // getHeroes() {
  //   return this.http.get ("https://democityfinanceapi.dhwaniris.in/api/v1/FRHomePageContent")
  //   }
  getLandingPageCard() {
    return this.http.get(
      // `${environment.api.url}menu?role=ULB&year=606aafb14dff55e6c075d3ae&isUa=false`
      `${environment.api.url}FRHomePageContent`,
    );
  }

  sortPosition(itemA: KeyValue<number, FormGroup>, itemB: KeyValue<number, FormGroup>) {
    const a = +itemA.value.controls['position']?.value;
    const b = +itemB.value.controls['position']?.value;
    return a > b ? 1 : b > a ? -1 : 0;
  }

  signin(user: any) {
    return this.http.post(environment.api.url + 'login', user);
  }

  verifyCaptcha(recaptcha: string) {
    return this.http.post(`${environment.api.url}captcha_validate`, {
      recaptcha,
    });
  }

  getToken() {
    return localStorage.getItem('id_token');
  }

  loggedIn() {
    return !this.helper.isTokenExpired(this.getToken());
  }

  downloadFile(blob: any, type: string, filename: string): void {
    try {
      // Create an object URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a hidden anchor element
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;

      // Append the anchor to the body, trigger the download, and remove the anchor
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Release the object URL to free memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  }

  getTableResponse(
    endpoint: string,
    queryParams: string,
    columns: any,
    tablePath: string = '',
    params = {},
  ) {
    return this.http
      .get(`${environment.api.url}/${endpoint}?${queryParams}`, { params })
      .pipe(tableMapperPipe(columns, tablePath));
  }

  getStateWiseForm(params: any = {}) {
    if (this.userUtil.getUserType() == USER_TYPE.STATE) {
      params['state'] = this.userUtil.getLoggedInUserDetails()?.state;
    }
    const queryParams = new URLSearchParams(removeFalsy(params)).toString();
    return this.http.get<{ data: MapData }>(
      `${environment.api.url}/fiscal-ranking/getStateWiseForm?` + queryParams,
    );
  }

  getTrackingHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams(removeFalsy(params)).toString();
      return this.http.get<TrackingHistoryResponse>(
        `${environment.api.url}/fiscal-ranking/tracking-history?` + queryParams,
      );
    } catch (err: any) {
      console.log('error in getTrackingHistory :: ', err.message);
      return err;
    }
  }

  searchUlb(query: string = '') {
    return this.http.get(`${environment.api.url}scoring-fr/autocomplete-ulbs?q=${query}`);
  }

  ulbDetails(ulbId: string) {
    return this.http.get(`${environment.api.url}scoring-fr/ulb/${ulbId}`);
  }

  dashboard() {
    return this.http.get(`${environment.api.url}scoring-fr/dashboard`);
  }

  callGetMethod(endPoints: string, queryParam: any) {
    return this.http.get(`${environment.api.url}${endPoints}`, {
      params: queryParam,
    });
  }

  states() {
    return this.http.get(`${environment.api.url}scoring-fr/states`);
  }

  topRankedUlbs(queryParams: string, columns: any, params: any) {
    return this.http
      .get(`${environment.api.url}scoring-fr/top-ranked-ulbs?${queryParams}`, { params })
      .pipe(tableMapperPipe(columns, 'tableData'));
  }

  topRankedStates(params: any) {
    return this.http.get(`${environment.api.url}scoring-fr/top-ranked-states`, { params });
  }

  getBarchartData(ulbsString: any) {
    return this.http.get(`${environment.api.url}scoring-fr/search-ulbs?${ulbsString}`);
  }

  getApiResponse(endPoints: string, params: any) {
    // const params = { ulb };
    return this.http.get(`${environment.api.url}${endPoints}`, { params });
  }

  downloadRankings() {
    return this.http.get(`${environment.api.url}scoring-fr/top-ranked-ulbs-dump`, {
      responseType: 'blob',
    });
  }
}
