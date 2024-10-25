import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class NationalMapSectionService {
  dataAvailabilityVal = new Subject<any>();
  currentSelectedStateId = new Subject<any>();
  selectedYear = new Subject<any>();
  currentSubTab: BehaviorSubject<any> = new BehaviorSubject<any>({});
  constructor(private http: HttpClient) { }

  setCurrentSubTabValue(val: any) {
    this.currentSubTab.next(val);
    return;
  }

  getDataAvailabilityValue() {
    return this.dataAvailabilityVal;
  }
  setDataAvailabilityValue(val: any) {
    this.dataAvailabilityVal.next(val);
    return;
  }

  setCurrentSelectedId(val: any) {
    this.currentSelectedStateId.next(val);
    return;
  }

  setCurrentSelectYear(val: any) {
    this.selectedYear.next(val);
    return;
  }

  getNationalData(nationalInput: any) {
    return this.http.get(
      environment.api.url +
      `national-dashboard/data-availability?financialYear=${nationalInput.financialYear}&stateId=${nationalInput.stateId}&population=${nationalInput.populationCat}&ulbType=${nationalInput.ulbType}`
    );
  }

  DownloadNationalTableData(nationalInput: any) {
    return this.http.get(
      environment.api.url +
      `national-dashboard/data-availability?financialYear=${nationalInput.financialYear}&stateId=${nationalInput.stateId}&population=${nationalInput.populationCat}&ulbType=${nationalInput.ulbType}&csv=${nationalInput.csv}`,
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
