import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourcesServicesService {

  constructor(
    private http: HttpClient
  ) { }

  tooltikCardShow = new Subject<any>();
  getScorePerValue() {
    return this.http.get(
      `${environment.api.url}scorePerformance`
    );
  }
  getReportCard(ulbId) {
    return this.http.get(
      `${environment.api.url}scorePerformanceByUlb/${ulbId}`
    );
  }
  postScoreReport(body) {
    return this.http.post(
      `${environment.api.url}scorePerformanceQuestionAnswer`, body
    )
  }
}
