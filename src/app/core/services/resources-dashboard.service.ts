import { Injectable } from "@angular/core";

import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Subject } from "rxjs";

import { Chart } from "chart.js";
import { Observable } from "rxjs/internal/Observable";

import { environment } from "../../../environments/environment";
@Injectable({
  providedIn: "root",
})
export class ResourcesDashboardService {
  showCard = new Subject<any>();
  resourceCount: BehaviorSubject<any> = new BehaviorSubject([]);
  castCount = this.resourceCount.asObservable()
  hideSearchedData: BehaviorSubject<any> = new BehaviorSubject([]);
  castSearchedData = this.hideSearchedData.asObservable()
  constructor(private https: HttpClient) { }
  getShowCardValue() {
    return this.showCard;
  }
  setShowCardValue(val) {
    this.showCard.next(val);
    return;
  }
  getDataSets(year, type, category, state, ulb, globalName, skip: number = 0) {
    return this.https.get(
      `${environment.api.url}annual-accounts/datasets?year=${year}&type=${type}&category=${category}&state=${state}&ulb=${ulb}&globalName=${globalName}&skip=${skip}`
    );
  }
  getSearchedData(filter) {
    return this.https.get(
      `${environment.api.url}?search=${filter}`
    );
  }
  updateResouceCount(resourceCount) {
    this.resourceCount.next(resourceCount);
  }
  updateSearchedData(hideSearchedData) {
    this.hideSearchedData.next(hideSearchedData);
  }

  GlobalSearch(input) {
    return this.https.get(
      `${environment.api.url}resourceDashboard/search?name=${input}`
    );
  }

  getPdfData(pdfInput) {
    return this.https.get(
      `${environment.api.url}resourceDashboard/?toolKitVisible=${pdfInput?.toolKitVisible}&type=PDF&header=${pdfInput?.header}&subHeader=${pdfInput?.subHeader}&globalName=${pdfInput?.globalName}&state=${pdfInput?.state}&ulb=${pdfInput?.ulb}&year=${pdfInput?.year}`
    )
  }

  getStandardizedExcel(body) {
    return this.https.post(
      `${environment.api.url}annual-accounts/datasets`, body, { responseType: "blob" }
    )
  }

  getYearsList() {
    return this.https.get(`${environment.api.url}resourceDashboard/allYears`)
  }

  getMunicipalityBondsRepositoryCategories() {
    return this.https.get(`${environment.api.url}main_category/list`);
  }
  getMunicipalityBondsRepositorySubCategories(categoryId) {
    return this.https.get(`${environment.api.url}sub_category/list?categoryId=` + categoryId);
  }
  getMunicipalityBondsRepositoryList(params) {
    return this.https.get(`${environment.api.url}municipalBondRepository/list`, { params });
  }
}
