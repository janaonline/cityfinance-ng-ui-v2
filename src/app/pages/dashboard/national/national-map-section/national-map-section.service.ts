import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "../../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class NationalMapSectionService {
  dataAvailabilityVal = new Subject<any>();
  currentSelectedStateId = new Subject<any>();
  selectedYear = new Subject<any>();
  currentSubTab: BehaviorSubject<any> = new BehaviorSubject<any>({});
  constructor(private http: HttpClient) { }

  setCurrentSubTabValue(val: { data: any; HeadTab: any; }) {
    this.currentSubTab.next(val);
    return;
  }

  getDataAvailabilityValue() {
    return this.dataAvailabilityVal;
  }
  setDataAvailabilityValue(val: { data: any; }) {
    this.dataAvailabilityVal.next(val);
    return;
  }

  setCurrentSelectedId(val: { data: any; }) {
    this.currentSelectedStateId.next(val);
    return;
  }

  setCurrentSelectYear(val: { data: any; }) {
    this.selectedYear.next(val);
    return;
  }

  getNationalData(nationalInput: { financialYear: any; stateId: any; populationCat: any; ulbType: any; }) {
    return this.http.get(
      environment.api.url +
      `national-performance-dashboard/data-availability?financialYear=${nationalInput.financialYear}&stateId=${nationalInput.stateId}&population=${nationalInput.populationCat}&ulbType=${nationalInput.ulbType}`
    );
  }

  DownloadNationalTableData(nationalInput: { financialYear: any; stateId: any; populationCat: any; ulbType: any; csv: any; }) {
    return this.http.get(
      environment.api.url +
      `national-performance-dashboard/data-availability?financialYear=${nationalInput.financialYear}&stateId=${nationalInput.stateId}&population=${nationalInput.populationCat}&ulbType=${nationalInput.ulbType}&csv=${nationalInput.csv}`,
      { responseType: "blob" }
    );
  }

  getNationalMapData(financialYear: any) {
    return this.http.get(
      environment.api.url +
      `get-statewise-data-availability?financialYear=${financialYear}`
    );
  }

  getNationalFinancialYear() {
    return this.http.get(environment.api.url + `get-FYs-with-specification`);
  }
}
