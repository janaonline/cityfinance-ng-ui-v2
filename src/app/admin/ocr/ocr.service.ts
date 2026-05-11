import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OcrApiResponse } from './upload-file-ocr/ocr-response';
import { IULB } from '../../core/models/ulb';
import {
  OcrValidationJobSubmitResponse,
  OcrValidationBatchSubmitResponse,
  OcrValidationJobStatusResponse,
  OcrValidationJobResult,
  OcrValidationJobsListResponse,
} from './ocr-validation/ocr-validation-models';

export interface OcrTaskListItem {
  job_id?: string;
  filename?: string;
  ocr_method?: string;
  financial_year?: string;
  expected?: string | number | boolean | Record<string, unknown> | null;
  total_pages?: number;
  pdf_quality?: {
    report?: {
      total_pages?: number;
    };
  };
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
  skip?: number;
  limit?: number;
  total_pages?: number;
  count?: number;
  total_count?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);

  uploadOcrFile(
    file: File,
    documentTypeId: string,
    financialYear: string,
    ocrMethod: string,
    model: string,
    enableOrientationCheck: boolean,
    ulb?: IULB | string | null,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', documentTypeId);
    formData.append('financial_year', financialYear);
    formData.append('ocr_method', ocrMethod);
    formData.append('model', model);
    formData.append('enable_orientation_check', String(enableOrientationCheck));

    if (ulb && typeof ulb === 'object') {
      const ulbKeys: string[] = [ulb?.name];

      if (ulb?.slug) ulbKeys.push(ulb.slug);
      if (ulb?.keywords) ulbKeys.push(ulb.keywords);
      const ulbKey = ulbKeys.join('|');
      // formData.append('ulb_name', ulbName);
      formData.append('ulb_name', ulbKey);
      formData.append('ulb_id', ulb?._id);
    } else {
      formData.append('ulb_name', ulb ? ulb.trim() : '');
    }
    return this.http.post(
      environment.api.url3 + 'sarvam-validate/combined-gemini-validate',
      formData,
    );
  }

  getOcrDetails(params: { jobId?: string; filename?: string; ocrMethod: string }) {
    const queryParams: Record<string, string> = {
      ocr_method: params.ocrMethod,
    };

    if (params.jobId) {
      queryParams['job_id'] = params.jobId;
    }

    if (params.filename) {
      queryParams['filename'] = params.filename;
    }

    return this.http.get<OcrApiResponse>(
      environment.api.url3 + 'sarvam-validate/tasks/latest',
      { params: queryParams },
    );
  }
  getulb(ulb: IULB | string | null | undefined): string {
    if (ulb && typeof ulb === 'object') {
      const ulbKeys: string[] = [ulb?.name];

      if (ulb?.slug) ulbKeys.push(ulb.slug);
      if (ulb?.keywords) ulbKeys.push(ulb.keywords);
      const ulbKey = ulbKeys.join('|');
      return ulbKey;
    } else {
      return ulb ? ulb.trim() : '';
    }
  }
  submitOcrValidationJob(
    file: File,
    extractionModel: string,
    validationModel: string,
    ulb?: IULB | string | null,
    financialYear?: string | null,
    docType?: string | null,
    tableExists?: boolean | null,
    enableOrientationCheck?: boolean,
    enableFinancialValidation?: boolean,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('extraction_model', extractionModel);
    formData.append('validation_model', validationModel);
    const ulbName = this.getulb(ulb);
    if (ulbName) formData.append('ulb_name', ulbName);
    if (financialYear) formData.append('financial_year', financialYear);
    if (docType) formData.append('doc_type', docType);
    if (tableExists !== null && tableExists !== undefined) {
      formData.append('table_exists', String(tableExists));
    }
    if (enableOrientationCheck !== undefined) {
      formData.append('enable_orientation_check', String(enableOrientationCheck));
    }
    if (enableFinancialValidation !== undefined) {
      formData.append('enable_financial_validation', String(enableFinancialValidation));
    }
    return this.http.post<OcrValidationJobSubmitResponse>(
      environment.api.url3 + 'ocr-validation/jobs',
      formData,
    );
  }

  submitOcrValidationBatch(
    files: File[],
    extractionModel: string,
    validationModel: string,
    ulb?: IULB | string | null,
    financialYear?: string | null,
    docType?: string | null,
    enableOrientationCheck?: boolean,
    enableFinancialValidation?: boolean,
  ) {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('extraction_model', extractionModel);
    formData.append('validation_model', validationModel);
    const ulbName = this.getulb(ulb);
    if (ulbName) formData.append('ulb_name', ulbName);
    if (financialYear) formData.append('financial_year', financialYear);
    if (docType) formData.append('doc_type', docType);
    if (enableOrientationCheck !== undefined) {
      formData.append('enable_orientation_check', String(enableOrientationCheck));
    }
    if (enableFinancialValidation !== undefined) {
      formData.append('enable_financial_validation', String(enableFinancialValidation));
    }
    return this.http.post<OcrValidationBatchSubmitResponse>(
      environment.api.url3 + 'ocr-validation/jobs/batch',
      formData,
    );
  }

  getOcrValidationJobStatus(jobId: string) {
    return this.http.get<OcrValidationJobStatusResponse>(
      environment.api.url3 + `ocr-validation/jobs/${jobId}`,
    );
  }

  getOcrValidationJobResult(jobId: string) {
    return this.http.get<OcrValidationJobResult>(
      environment.api.url3 + `ocr-validation/jobs/${jobId}/result`,
    );
  }

  listOcrValidationJobs(params?: {
    status?: string;
    batch_id?: string;
    job_id?: string;
    filename?: string;
    ulb_name?: string;
    skip?: number;
    limit?: number;
  }) {
    const queryParams: Record<string, string | number> = {};
    if (params?.status) queryParams['status'] = params.status;
    if (params?.batch_id) queryParams['batch_id'] = params.batch_id;
    if (params?.job_id) queryParams['job_id'] = params.job_id;
    if (params?.filename) queryParams['filename'] = params.filename;
    if (params?.ulb_name) queryParams['ulb_name'] = params.ulb_name;
    if (params?.skip !== undefined) queryParams['skip'] = params.skip;
    if (params?.limit !== undefined) queryParams['limit'] = params.limit;
    return this.http.get<OcrValidationJobsListResponse>(
      environment.api.url3 + 'ocr-validation/jobs',
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

    return this.http.get<OcrTaskListResponse>(environment.api.url3 + 'sarvam-validate/tasks', {
      params: queryParams,
    });
  }
}
