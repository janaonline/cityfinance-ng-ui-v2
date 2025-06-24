import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";


@Injectable({
  providedIn: "root",
})
export class DashboardService {
  constructor(private http: HttpClient) { }
  dashboardInformation(ifPeople = true, ulbOrStateid: any, type: string | string[], year: string) {
    let headers = new HttpHeaders();
    headers = headers.append("type", type);
    let request = "";
    // if (national) {
    //   request = `${environment.api.url}all-dashboard/people-information?year=${year}?national=${national}`;
    // }
    if (ifPeople)
      request = `${environment.api.url}all-dashboard/people-information?year=${year}`;
    else
      request = `${environment.api.url}all-dashboard/money-information?year=${year}`;

    if (type == "ulb") {
      request += `&ulb=${ulbOrStateid}`;
    } else if (type == "national") {
      request += `&type=${type}`;
    } else request += `&state=${ulbOrStateid}`;
    return this.http.get(request, { headers });
  }

  getDashboardTabData(dashboardId: string) {
    return this.http.get(
      `${environment.api.url}dashboardHeaders/${dashboardId}`
    );
  }

  getLatestDataYear(ulb: any) {
    return this.http.get(
      `${environment.api.url}all-dashboard/latest-year?ulb=${ulb}`
    );
  }

  getYearList(ulb: string | number) {
    return this.http.get(
      `${environment.api.url}all-dashboard/latest-year/list?ulb=${ulb}`
    );
  }
  getMoUData(ulb: any) {
    return this.http.get(
      `${environment.api.url}UA/getUAfile?ulbId=${ulb}`
    );
  }
}
