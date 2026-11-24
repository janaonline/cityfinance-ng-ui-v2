import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface EvalCaseInput {
  job_id: string;
  label?: string;
  expected: Record<string, unknown>;
}

export interface EvalCaseResult {
  job_id: string;
  label: string | null;
  pdf: string | null;
  status: string | null;
  error: string;
  ocr_cost_usd?: number | null;
  self_reported?: { accuracy_score?: number | null; overall_assessment?: string | null };
  classification?: { exact_match: boolean; precision: number | null; recall: number | null };
  extraction?: {
    cell_accuracy: number | null;
    row_recall: number | null;
    row_precision: number | null;
    column_swaps: number;
    diffs: { page: number; label?: string; issue: string; expected?: unknown; actual?: unknown }[];
  };
  arithmetic?: { exact_match: boolean; false_positive: string[]; false_negative: string[] };
}

export interface EvalSummary {
  cases: number;
  cases_failed_to_run: number;
  classification_exact_match: number | null;
  classification_precision: number | null;
  classification_recall: number | null;
  extraction_cell_accuracy: number | null;
  extraction_row_recall: number | null;
  extraction_row_precision: number | null;
  extraction_column_swaps: number;
  arithmetic_exact_match: number | null;
  arithmetic_false_positives: number;
  arithmetic_false_negatives: number;
}

export interface EvalRunSummary {
  run_id: string;
  name: string;
  created_at: string;
  summary: EvalSummary;
}

export interface EvalRun extends EvalRunSummary {
  cases: EvalCaseResult[];
}

@Injectable({ providedIn: 'root' })
export class AfsDigitizationEvalsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.api.url3 + 'afs-digitization/evals/runs';

  createRun(name: string, cases: EvalCaseInput[]): Observable<EvalRun> {
    return this.http.post<EvalRun>(this.base, { name: name || null, cases });
  }

  listRuns(page = 1, pageSize = 20): Observable<{ total: number; runs: EvalRunSummary[] }> {
    return this.http.get<{ total: number; runs: EvalRunSummary[] }>(this.base, {
      params: { page, page_size: pageSize },
    });
  }

  getRun(runId: string): Observable<EvalRun> {
    return this.http.get<EvalRun>(`${this.base}/${runId}`);
  }

  deleteRun(runId: string): Observable<{ deleted: string }> {
    return this.http.delete<{ deleted: string }>(`${this.base}/${runId}`);
  }
}
