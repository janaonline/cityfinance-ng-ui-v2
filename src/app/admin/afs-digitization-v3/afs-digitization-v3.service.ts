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
  /** Digitized by the old flow: contents unknown; can be re-queued for v3 */
  isLegacy?: boolean;
  expectedDocType?: string;
  noOfPages?: number;
  /** FastAPI job id (`job_id` from `POST /afs-digitization/jobs`) */
  jobId?: string;
  summary?: string;
  error?: string;
  /** When the job finished (completed or failed) */
  digitizedAt?: string;
  /** How long the job took to run, in milliseconds */
  elapsedMs?: number;
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
  /** PDF uploaded from this page (same slot as the AFS dashboard's Upload); null until one is uploaded */
  afsPdfUrl?: string | null;
  afsPdfUrlSigned?: string | null;
  afsPdfPageCount?: number | null;
  /** Digitized Excel, signed by the API like the PDF; null until the file is digitized */
  excelUrl: string | null;
  excelUrlSigned: string | null;
  /** From the annual account's PDF metadata; null until backfilled */
  pdfPageCount: number | null;
  pdfSizeBytes: number | null;
  /** Same file as an earlier slot: not digitized itself, follows `duplicateOfDocType` */
  isDuplicate?: boolean;
  duplicateOfDocType?: string | null;
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

/** Overall counts across every year, audit type and doc type (not tied to the filters). */
export interface DigitizationV3OverallMetrics {
  /** Unique files to digitize; null pages until the uniqueness baseline has been built */
  total: number;
  totalPages: number | null;
  digitized: number;
  queued: number;
  processing: number;
  failed: number;
  updatedAt: string | null;
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
  /** ISO instants; the page sends the start / end of the picked local days */
  digitizedFrom?: string;
  digitizedTo?: string;
  sortColumn?: 'digitizedAt' | 'pages';
  sortDirection?: 'asc' | 'desc';
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

  getOverallMetrics() {
    return this.http
      .get<{ success: boolean; data: DigitizationV3OverallMetrics }>(`${this.base}/metrics`)
      .pipe(map((res) => res.data));
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
