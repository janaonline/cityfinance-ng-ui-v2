import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type DigitizationV3Status = 'not-digitized' | 'queued' | 'processing' | 'digitized' | 'failed';

export interface DigitizationV3Segment {
  docType: string;
  startPage: number;
  endPage: number;
  title?: string;
  isDuplicate?: boolean;
}

export interface DigitizationV3Info {
  status: DigitizationV3Status;
  detectedDocTypes?: string[];
  segments?: DigitizationV3Segment[];
  isConsolidated?: boolean;
  isMismatch?: boolean;
  expectedDocType?: string;
  noOfPages?: number;
  /** FastAPI job id (`job_id` from `POST /afs-digitization/jobs`) */
  jobId?: string;
  summary?: string;
  error?: string;
  digitizedAt?: string;
}

export interface DigitizationV3Row {
  _id: string;
  ulb: string;
  ulbName: string;
  ulbCode?: string;
  stateName: string;
  yearLabel: string;
  docType: string;
  pdfUrl: string | null;
  pdfUrlSigned: string | null;
  /** Digitized Excel, signed by the API like the PDF; null until the file is digitized */
  excelUrl: string | null;
  excelUrlSigned: string | null;
  /** From the annual account's PDF metadata; null until backfilled */
  pdfPageCount: number | null;
  pdfSizeBytes: number | null;
  digitization: DigitizationV3Info;
}

export interface DigitizationV3ListResponse {
  success: boolean;
  data: DigitizationV3Row[];
  totalCount: number;
  /** Counts for the whole selection, ignoring the status / contents / mismatch filters. */
  metrics: DigitizationV3Metrics;
}

export interface DigitizationV3Metrics {
  total: number;
  withPdf: number;
  notDigitized: number;
  queued: number;
  processing: number;
  digitized: number;
  failed: number;
  consolidated: number;
  mismatch: number;
}

export interface EnqueueSummary {
  success: boolean;
  /** Groups the jobs queued by this call (also stored on each file and in FastAPI) */
  batchId?: string;
  matched: number;
  queued: number;
  skippedNoPdf: number;
  skippedDuplicate?: number;
  skippedAlreadyQueued: number;
  skippedAlreadyDigitized: number;
  failedToQueue: number;
}

/** FastAPI's log for one job (status, progress, error and warnings, timestamps). */
export interface AfsDigitizationJobLog {
  afsDigitizationJobId: string;
  status: string;
  progressStep: string | null;
  message: string | null;
  errorMessage: string | null;
  warnings: string[];
  filename: string | null;
  ocrEngine: string | null;
  geminiModel: string | null;
  pageCount: number | null;
  detectedDocumentType: string | null;
  multipleDocumentsDetected: boolean | null;
  ocrCostUsd: number | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/** Body accepted by every afs-digitization-v3 endpoint. */
export interface DigitizationV3Query {
  yearId: string;
  docType: string;
  auditType: string;
  stateId?: string[];
  ulbId?: string[];
  populationCategory?: string;
  digitizationV3Status?: DigitizationV3Status;
  isConsolidated?: boolean;
  isMismatch?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AfsDigitizationV3Service {
  private readonly base = `${environment.api.url2}afs-digitization-v3`;

  constructor(private http: HttpClient) {}

  list(query: DigitizationV3Query) {
    return this.http.post<DigitizationV3ListResponse>(`${this.base}/list`, query);
  }

  getJobLog(afsDigitizationJobId: string) {
    return this.http
      .get<{ success: boolean; data: AfsDigitizationJobLog }>(`${this.base}/jobs/${afsDigitizationJobId}/log`)
      .pipe(map((res) => res.data));
  }

  enqueueByFilter(query: DigitizationV3Query) {
    return this.http.post<EnqueueSummary>(`${this.base}/enqueue-by-filter`, query);
  }
}
