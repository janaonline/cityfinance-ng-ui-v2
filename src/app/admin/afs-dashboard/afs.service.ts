import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ResponseData {
  success: boolean;
  data: any;
  totalCount?: number;
}

export interface FilterValues {
  stateId: string[];
  // stateName: string | '';
  populationCategory?: string | '';
  ulbId: string[];
  yearId: string | '';
  docType: string | '';
  auditType: 'audited' | 'unAudited' | '';
  digitizationStatus?: string | '';
  page?: number;
  limit?: number;
}

export interface AfsExcelFile {
  annualAccountsId?: string;
  ulb: string;
  year: string;
  auditType: string;
  docType: string;
  pdfUrl: string;
  uploadedBy: string;
  jobId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AfsService {

  constructor(private http: HttpClient) { }

  getFilters() {
    const url = `${environment.api.url2}afs-digitization/filters`;
    return this.http.get<ResponseData>(url);
  }

  getUlbs(params: { stateIds: string[]; populationCategory: string; }) {
    const url = `${environment.api.url2}afs-digitization/ulbs`;
    return this.http.get<ResponseData>(url, { params });
  }

  getRequestLog(requestId: string) {
    const url = `${environment.api.url2}afs-digitization/request-log/${requestId}`;
    return this.http.get<ResponseData>(url);
  }

  getAfsList(payload: any) {
    const url = `${environment.api.url2}afs-digitization/afs-list`;
    return this.http.post<ResponseData>(url, payload);
  }

  dumpDigitizationReport(params: any) {
    return this.http.get<ResponseData>(`${environment.api.url2}afs-digitization/dump/afs-excel`, { params, responseType: 'blob' as 'json' });
  }

  uploadAfsFile(payload: AfsExcelFile) {
    // const url = `${environment.api.url}afs-digitization/afs-file`;
    // const response: any = await this.http.post(url, formData).toPromise();
    const url = `${environment.api.url2}afs-digitization/upload-afs-file`;
    return this.http.post<any>(url, payload);
  }

  getAfsFile(params: { ulbId: string; financialYear: string; auditType: string; docType: string }) {
    const url = `${environment.api.url}afs-digitization/afs-file`;
    return this.http.get<any>(url, { params });
  }

  digitizeFile(formData: any) {
    for (const [key, value] of formData.entries()) {
      console.log(key, value, value instanceof Blob ? '(Blob/File)' : '');
    }
    return this.http.post(
      environment.api.url3 + "digitization/AFS_Digitization",
      formData
    );
  }

  saveDigitizeReq(metaBody: any) {
    return this.http.post(
      environment.api.url + 'afs-digitization/save-request-only',
      metaBody
    )
  }

  getDashboardCards() {
    return this.http.get<ResponseData>(`${environment.api.url2}afs-digitization/metrics`)
  }

  afsExcelFile(backendForm: any) {
    this.http.post(
      environment.api.url + 'afs-digitization/afs-excel-file',
      backendForm
    )
  }

  startDigitization(payloads: { jobs: AfsExcelFile[] }) {
    return this.http.post(
      environment.api.url2 + 'afs-digitization/enqueue-batch',
      payloads
    );
  }

  removeJob(job: AfsExcelFile) {
    const url = `${environment.api.url2}afs-digitization/remove-job`;
    return this.http.post<any>(url, job);
  }
}