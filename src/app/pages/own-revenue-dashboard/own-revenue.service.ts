import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class OwnRevenueService {

  constructor(private httpClient: HttpClient) {

  }

  displayDataAvailable(body: any) {
    if (!Object.prototype.hasOwnProperty.call(body, "csv")) {
      return this.httpClient.post(`${environment.api.url}data-available`, body);
    }
    return this.httpClient.post(`${environment.api.url}data-available`, body, {
      responseType: "blob",
    });
  }


  displayBarChartData(body: any) {
    if (!Object.prototype.hasOwnProperty.call(body, "csv")) {
      return this.httpClient.post(`${environment.api.url}topPerformance`, body);
    }
    return this.httpClient.post(`${environment.api.url}topPerformance`, body, {
      responseType: "blob",
    });
  }

  getULBTypeList() {
    return this.httpClient.get(
      `${environment.api.url}UlbType`
    );
  }

  getPieChartData(body: any) {
    return this.httpClient.post(`${environment.api.url}chart-data`, body);
  }
  getCardsData(body: any) {
    return this.httpClient.post(`${environment.api.url}cards-data`, body);
  }
  getTableData(body: any) {
    return this.httpClient.post(`${environment.api.url}table-data`, body);
  }

  getYearList(body: any) {
    return this.httpClient.post(`${environment.api.url}yearList`, body)
  }

}

// {{url}}/LineItem

