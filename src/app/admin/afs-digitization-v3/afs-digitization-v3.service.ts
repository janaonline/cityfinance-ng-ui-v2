import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
  digitizationV3: DigitizationV3Info;
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
  matched: number;
  queued: number;
  skippedNoPdf: number;
  skippedAlreadyQueued: number;
  skippedAlreadyDigitized: number;
  failedToQueue: number;
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

  enqueueByFilter(query: DigitizationV3Query) {
    return this.http.post<EnqueueSummary>(`${this.base}/enqueue-by-filter`, query);
  }
}
