import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

interface ResponseData {
  success: boolean;
  data: any;
}

export interface AfsExcelFile {
  annualAccountsId?: string;
  ulb: string;
  year: string;
  auditType: string;
  docType: string;
  pdfUrl: string;
  uploadedBy: string;
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

  getAfsList(params: any) {
    const url = `${environment.api.url2}afs-digitization/afs-list`;
    return this.http.get<any>(url, { params });
  }
  // to be migrate to api

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

  getMetrics(params: any) {
    this.http.get(`${environment.api.url}afs-digitization/afs-metrics`, { params })
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
}