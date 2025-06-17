import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class NationalService {
  constructor(private http: HttpClient) {}

  getNationalRevenueData(nationalInput:any, endPoint:any) {
    return this.http.get(
      environment.api.url +
        `national-dashboard/${endPoint}?financialYear=${nationalInput.financialYear}&type=${nationalInput.type}&formType=${nationalInput.formType}&stateId=${nationalInput.stateId}
      `
    );
  }

  getNationalRevenueMixData(RevenueMixInput:any, endPoint:any) {
    return this.http.get(
      environment.api.url +
        `national-dashboard/${endPoint}?financialYear=${RevenueMixInput?.financialYear}&formType=${RevenueMixInput?.formType}&stateId=${RevenueMixInput?.stateId}&type=${RevenueMixInput?.type} `
    );
  }

  DownloadNationalTableData(downloadInput:any, endPoint:any) {
    return this.http.get(
      environment.api.url +
        `national-dashboard/${endPoint}?financialYear=${downloadInput?.financialYear}&formType=${downloadInput?.formType}&stateId=${downloadInput?.stateId}&type=${downloadInput?.type}&csv=${downloadInput.csv} `,
      { responseType: "blob" }
    );
  }
}
