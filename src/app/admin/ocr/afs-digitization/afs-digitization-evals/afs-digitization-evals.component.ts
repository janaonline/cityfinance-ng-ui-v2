import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MaterialModule } from '../../../../material.module';
import {
  AfsDigitizationEvalsService,
  EvalCaseInput,
  EvalRun,
  EvalRunSummary,
} from './afs-digitization-evals.service';

interface CaseDraft {
  jobId: string;
  label: string;
  expectedText: string;
}

@Component({
  standalone: true,
  selector: 'app-afs-digitization-evals',
  imports: [CommonModule, FormsModule, RouterLink, MaterialModule],
  templateUrl: './afs-digitization-evals.component.html',
  styleUrl: './afs-digitization-evals.component.scss',
})
export class AfsDigitizationEvalsComponent implements OnInit {
  private readonly api = inject(AfsDigitizationEvalsService);

  runName = '';
  drafts: CaseDraft[] = [{ jobId: '', label: '', expectedText: '' }];

  readonly running = signal(false);
  readonly loadingRuns = signal(false);
  readonly error = signal('');
  readonly runs = signal<EvalRunSummary[]>([]);
  readonly selected = signal<EvalRun | null>(null);

  ngOnInit(): void {
    this.loadRuns();
  }

  loadRuns(): void {
    this.loadingRuns.set(true);
    this.api
      .listRuns()
      .pipe(finalize(() => this.loadingRuns.set(false)))
      .subscribe({
        next: (res) => this.runs.set(res.runs),
        error: () => this.error.set('Could not load past eval runs.'),
      });
  }

  addDraft(): void {
    this.drafts.push({ jobId: '', label: '', expectedText: '' });
  }

  removeDraft(i: number): void {
    this.drafts.splice(i, 1);
    if (!this.drafts.length) this.addDraft();
  }

  async onFile(event: Event, draft: CaseDraft): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    draft.expectedText = await file.text();
    if (!draft.label) draft.label = file.name.replace(/\.expected\.json$|\.json$/i, '');
  }

  run(): void {
    this.error.set('');
    const cases: EvalCaseInput[] = [];
    for (const [i, d] of this.drafts.entries()) {
      if (!d.jobId.trim() && !d.expectedText.trim()) continue;
      try {
        const expected = JSON.parse(d.expectedText);
        if (!d.jobId.trim() || typeof expected !== 'object' || expected === null || Array.isArray(expected)) {
          throw new Error('invalid');
        }
        cases.push({ job_id: d.jobId.trim(), label: d.label.trim() || undefined, expected });
      } catch {
        this.error.set(`Case ${i + 1}: needs a job ID and valid expected JSON (an object).`);
        return;
      }
    }
    if (!cases.length) {
      this.error.set('Add at least one case.');
      return;
    }
    this.running.set(true);
    this.api
      .createRun(this.runName.trim(), cases)
      .pipe(finalize(() => this.running.set(false)))
      .subscribe({
        next: (run) => {
          this.selected.set(run);
          this.loadRuns();
        },
        error: (err) => this.error.set(this.describe(err)),
      });
  }

  open(run: EvalRunSummary): void {
    this.api.getRun(run.run_id).subscribe({
      next: (r) => this.selected.set(r),
      error: () => this.error.set('Could not load that run.'),
    });
  }

  remove(run: EvalRunSummary): void {
    if (!confirm(`Delete eval run "${run.name}"?`)) return;
    this.api.deleteRun(run.run_id).subscribe({
      next: () => {
        if (this.selected()?.run_id === run.run_id) this.selected.set(null);
        this.loadRuns();
      },
      error: () => this.error.set('Could not delete that run.'),
    });
  }

  pct(v: number | null | undefined): string {
    return v === null || v === undefined ? '-' : `${(v * 100).toFixed(1)}%`;
  }

  private describe(err: { error?: { detail?: unknown } }): string {
    const detail = err?.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    return 'Eval run failed.';
  }
}
