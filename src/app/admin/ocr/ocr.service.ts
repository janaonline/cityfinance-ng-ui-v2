import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OcrApiResponse } from './upload-file-ocr/ocr-response';

export interface OcrTaskListItem {
  job_id?: string;
  filename?: string;
  ocr_method?: string;
  financial_year?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OcrTaskListResponse {
  items?: OcrTaskListItem[];
  tasks?: OcrTaskListItem[];
  data?: OcrTaskListItem[];
  results?: OcrTaskListItem[];
  records?: OcrTaskListItem[];
  payload?: OcrTaskListItem[] | OcrTaskListResponse;
  total?: number;
  count?: number;
  total_count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);

  uploadOcrFile(file: File, documentTypeId: string, financialYear: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('Document_type_ID', documentTypeId);
    formData.append('financialYear', financialYear);

    return this.http.post(
      environment.api.url3 + 'sarvam-validate/combined-gemini-validate',
      formData,
    );
  }

  getOcrDetails(params: { jobId?: string; filename?: string; ocrMethod: string }) {
    const queryParams: Record<string, string> = {
      ocrMethod: params.ocrMethod,
    };

    if (params.jobId) {
      queryParams['jobId'] = params.jobId;
    }

    if (params.filename) {
      queryParams['filename'] = params.filename;
    }

    return this.http.get<OcrApiResponse>(
      environment.api.url3 + 'sarvam-validate/tasks/latest',
      { params: queryParams },
    );
  }

  getOcrTasks(params: {
    jobId?: string;
    filename?: string;
    ocrMethod?: string;
    status?: string;
    skip: number;
    limit: number;
  }) {
    const queryParams: Record<string, string | number> = {
      skip: params.skip,
      limit: params.limit,
    };

    if (params.jobId) {
      queryParams['job_id'] = params.jobId;
    }

    if (params.filename) {
      queryParams['filename'] = params.filename;
    }

    if (params.ocrMethod) {
      queryParams['ocr_method'] = params.ocrMethod;
    }

    if (params.status) {
      queryParams['status'] = params.status;
    }

    return this.http.get<OcrTaskListResponse>(
      environment.api.url3 + 'sarvam-validate/tasks',
      { params: queryParams },
    );
  }
}
