import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { MaterialModule } from '../../../material.module';
import { MATERIAL_THEME_CLASS } from '../../../core/theming/material-theme.providers';
import { PtaxReviewService } from './ptax-review.service';
import {
  isPtaxLockedStatus,
  isPtaxSubmittedStatus,
  PtaxDraftMetricPayload,
  PtaxFinalAction,
  PtaxMetric,
  PTAX_DECLARATION_TARGET_CODE,
  PTAX_SUPPORTING_DOCUMENT_TARGET_CODE,
} from './ptax-review.model';
import {
  FlagRowDialogComponent,
  FlagRowDialogData,
  FlagRowDialogOrderConstraint,
} from '../flag-row-dialog/flag-row-dialog.component';
import { XvFcCurrencyUnit, XV_FC_CURRENCY_UNIT_LABELS } from '../models/xv-fc-review.model';
import { formatXvFcAmount } from '../xv-fc-review-format.util';
import { PageErrorStateComponent } from '../../xvi-fc-module/shared/page-error-state/page-error-state.component';

type Screen = 'review' | 'preview' | 'success';

@Component({
  selector: 'app-ptax-review',
  standalone: true,
  imports: [CommonModule, MaterialModule, PageErrorStateComponent],
  templateUrl: './ptax-review.component.html',
  styleUrl: './ptax-review.component.scss',
})
export class PtaxReviewComponent {
  readonly service = inject(PtaxReviewService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  /** Lets the flag dialog (opened via the root MatDialog) inherit the xvifc-theme CSS vars. */
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });

  readonly unitLabels = XV_FC_CURRENCY_UNIT_LABELS;
  readonly units: XvFcCurrencyUnit[] = ['whole', 'lakhs', 'crores'];

  screen = signal<Screen>('review');
  currentFy = signal<string | null>(null);
  /** Backend id for `currentFy` — this, not the FY label, is what every API call uses. */
  currentYearId = signal<string | null>(null);
  currentUnit = signal<XvFcCurrencyUnit>('lakhs');
  pendingAction = signal<PtaxFinalAction>('ACCEPT_NO_CHANGES');
  successFy = signal<string | null>(null);

  submitting = signal(false);
  uploadingDeclaration = signal(false);
  uploadingSupportDoc = signal(false);

  metrics = computed(() => this.service.fyDetail()?.metrics ?? []);
  flaggedItems = computed(() => this.metrics().filter((m) => m.flagged));
  flagCount = computed(() => this.flaggedItems().length);
  isLocked = computed(() => isPtaxLockedStatus(this.service.fyDetail()?.status));
  isRejected = computed(() => {
    const detail = this.service.fyDetail();
    return !!detail && isPtaxSubmittedStatus(detail.status) && !this.isLocked();
  });
  /** One shared supporting document for the whole FY — always optional, never blocks submission. */
  commonSupportingDocument = computed(() => this.service.fyDetail()?.supportingDocument ?? null);
  /** Order rules (e.g. 1.10 must not exceed 1.9) currently broken by the metrics' effective values. */
  orderRuleViolations = computed(() => {
    const rules = this.service.fyDetail()?.metricOrderRules ?? [];
    const byCode = new Map(this.metrics().map((m) => [m.code, m]));
    return rules.filter((rule) => {
      const greater = byCode.get(rule.greater);
      const lesser = byCode.get(rule.lesser);
      if (!greater || !lesser) return false;
      const greaterValue = this.effectiveValue(greater);
      const lesserValue = this.effectiveValue(lesser);
      return greaterValue != null && lesserValue != null && lesserValue > greaterValue;
    });
  });
  canSubmit = computed(
    () =>
      !!this.service.fyDetail()?.declaration &&
      this.flaggedItems().every((m) => !!m.comment) &&
      this.orderRuleViolations().length === 0 &&
      !this.isLocked(),
  );
  submitBlockedReason = computed(() => {
    const detail = this.service.fyDetail();
    if (!detail?.declaration) return 'Upload the signed declaration above to enable this.';
    if (!this.flaggedItems().every((m) => !!m.comment)) {
      return 'Add a comment for every metric you flagged to enable this.';
    }
    const violation = this.orderRuleViolations()[0];
    if (violation) {
      return `${violation.lesser} cannot be greater than ${violation.greater}.`;
    }
    return '';
  });

  constructor() {
    void this.init();
  }

  private async init() {
    await this.service.loadSummary();
    const summaries = this.service.summaries();
    const latest = summaries[summaries.length - 1] ?? null;
    if (latest) {
      this.switchYear(latest.financialYear, latest.yearId);
    }
  }

  // ── FY / unit switching ──────────────────────────────────────────────
  switchYear(fy: string, yearId: string) {
    this.currentFy.set(fy);
    this.currentYearId.set(yearId);
    void this.service.loadFyDetail(yearId);
  }

  switchUnit(unit: string) {
    this.currentUnit.set(unit as XvFcCurrencyUnit);
  }

  fyDotClass(yearId: string): string {
    const summary = this.service.summaries().find((s) => s.yearId === yearId);
    if (!summary) return '';
    if (isPtaxLockedStatus(summary.reviewStatus)) return 'dot-done';
    if (summary.flaggedCount > 0) return 'dot-flag';
    return '';
  }

  /** The value that will actually be submitted for this metric — its correction if flagged, else the original figure. */
  private effectiveValue(metric: PtaxMetric): number | null {
    if (metric.flagged && metric.proposedValue != null) return metric.proposedValue;
    const numeric = metric.value == null || metric.value === '' ? null : Number(metric.value);
    return numeric == null || Number.isNaN(numeric) ? null : numeric;
  }

  /** Builds the ordering constraint (if any) that applies to this metric against its paired sibling's current value. */
  private buildOrderConstraint(metric: PtaxMetric): FlagRowDialogOrderConstraint | null {
    const rules = this.service.fyDetail()?.metricOrderRules ?? [];
    const byCode = new Map(this.metrics().map((m) => [m.code, m]));
    for (const rule of rules) {
      if (rule.lesser === metric.code) {
        const greater = byCode.get(rule.greater);
        const limit = greater ? this.effectiveValue(greater) : null;
        if (limit != null) return { type: 'max', limit, otherCode: rule.greater };
      }
      if (rule.greater === metric.code) {
        const lesser = byCode.get(rule.lesser);
        const limit = lesser ? this.effectiveValue(lesser) : null;
        if (limit != null) return { type: 'min', limit, otherCode: rule.lesser };
      }
    }
    return null;
  }

  // ── Value formatting ────────────────────────────────────────────────
  formatValue(metric: PtaxMetric): string {
    const numeric = metric.value == null || metric.value === '' ? null : Number(metric.value);
    const value = numeric == null || Number.isNaN(numeric) ? null : numeric;
    if (metric.validation?.isRupee === false) {
      return value == null ? '—' : value.toLocaleString('en-IN');
    }
    return formatXvFcAmount(value, this.currentUnit());
  }

  downloadTable() {
    const fy = this.currentFy() ?? '';
    const rows = this.metrics().map((m) => ({
      Code: m.code,
      'Line Item': m.label,
      [`Amount (${this.unitLabels[this.currentUnit()]})`]: this.formatValue(m),
      Flag: m.flagged ? 'Flagged' : 'Accepted',
      'Proposed value': m.proposedValue ?? '',
      Comment: m.comment || '',
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Property Tax');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(file, `Property-Tax-FY${fy}.xlsx`);
  }

  // ── Flagging ──────────────────────────────────────────────────────────
  openFlagDialog(metric: PtaxMetric) {
    if (this.isLocked()) return;
    const ref = this.dialog.open<FlagRowDialogComponent, FlagRowDialogData>(FlagRowDialogComponent, {
      width: '600px',
      data: {
        code: metric.code,
        label: metric.label,
        existing: metric.flagged
          ? { flagged: metric.flagged, proposedValue: metric.proposedValue, comment: metric.comment }
          : null,
        validation: metric.validation,
        orderConstraint: this.buildOrderConstraint(metric),
      },
      panelClass: this.themeClass ?? undefined,
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result === 'unflag') {
        this.service.setMetricFlagLocally(metric.code, false, null, '');
        this.toast('Flag removed.');
        return;
      }
      this.service.setMetricFlagLocally(result.code, true, result.proposedValue, result.comment);
      this.toast('Flag saved for ' + metric.code + '. Attach a supporting document below.');
    });
  }

  /**
   * `loadFyDetail` wholesale-replaces `fyDetail` from the server, which would silently wipe
   * any flags/comments set locally but not yet persisted via `saveDraft`. Snapshot them first
   * and re-apply on top of the freshly loaded metrics so an in-progress review survives a
   * document-upload reload.
   */
  private async reloadFyDetailPreservingFlags(yearId: string) {
    const localFlags = new Map(
      this.metrics().map((m) => [m.code, { flagged: m.flagged, proposedValue: m.proposedValue, comment: m.comment }]),
    );
    await this.service.loadFyDetail(yearId);
    const detail = this.service.fyDetail();
    if (!detail) return;
    this.service.fyDetail.set({
      ...detail,
      metrics: detail.metrics.map((m) => {
        const local = localFlags.get(m.code);
        return local
          ? { ...m, flagged: local.flagged, proposedValue: local.proposedValue, comment: local.comment }
          : m;
      }),
    });
  }

  // ── Declaration ─────────────────────────────────────────────────────────
  onDeclarationChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const yearId = this.currentYearId();
    if (!file || !yearId) return;
    input.value = '';
    this.uploadingDeclaration.set(true);
    this.service.uploadDocument(yearId, PTAX_DECLARATION_TARGET_CODE, file).subscribe({
      next: async () => {
        await this.reloadFyDetailPreservingFlags(yearId);
        this.uploadingDeclaration.set(false);
        this.toast('Declaration uploaded.');
      },
      error: () => {
        this.uploadingDeclaration.set(false);
        this.toast('Failed to upload the declaration. Please try again.');
      },
    });
  }

  removeDeclaration() {
    this.service.clearDeclarationLocally();
  }

  viewDeclaration() {
    const yearId = this.currentYearId();
    if (!yearId) return;
    this.service.getDocumentSignedUrl(yearId, PTAX_DECLARATION_TARGET_CODE).subscribe({
      next: (url) => window.open(url, '_blank', 'noopener'),
      error: () => this.toast('Failed to open this document. Please try again.'),
    });
  }

  // ── Supporting document ────────────────────────────────────────────────
  onCommonSupportFileChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const yearId = this.currentYearId();
    if (!file || !yearId) return;
    input.value = '';
    this.uploadingSupportDoc.set(true);
    this.service.uploadDocument(yearId, PTAX_SUPPORTING_DOCUMENT_TARGET_CODE, file).subscribe({
      next: async () => {
        await this.reloadFyDetailPreservingFlags(yearId);
        this.uploadingSupportDoc.set(false);
        this.toast('Supporting document attached.');
      },
      error: () => {
        this.uploadingSupportDoc.set(false);
        this.toast('Failed to upload the supporting document. Please try again.');
      },
    });
  }

  removeSupportFile() {
    this.service.clearSupportingDocumentLocally();
  }

  viewSupportingDocument() {
    const yearId = this.currentYearId();
    if (!yearId) return;
    this.service.getDocumentSignedUrl(yearId, PTAX_SUPPORTING_DOCUMENT_TARGET_CODE).subscribe({
      next: (url) => window.open(url, '_blank', 'noopener'),
      error: () => this.toast('Failed to open this document. Please try again.'),
    });
  }

  // ── Draft / preview / submit ─────────────────────────────────────────
  private buildDraftPayload(): PtaxDraftMetricPayload[] {
    return this.metrics().map((m) => ({
      code: m.code,
      flagged: m.flagged,
      proposedValue: m.proposedValue ?? undefined,
      comment: m.comment || undefined,
    }));
  }

  openPreview(action: PtaxFinalAction) {
    if (action === 'SUBMIT_WITH_COMMENTS' && this.flagCount() === 0) {
      this.toast('Nothing is flagged - use "Accept - no changes" instead, or flag a metric first.');
      return;
    }
    if (action === 'ACCEPT_NO_CHANGES' && this.flagCount() > 0) {
      this.toast('You have flagged metrics - use "Submit with comments", or remove the flags first.');
      return;
    }
    this.pendingAction.set(action);
    this.screen.set('preview');
  }

  backToEdit() {
    this.screen.set('review');
  }

  onConfirmSubmit() {
    const fy = this.currentFy();
    const yearId = this.currentYearId();
    if (!fy || !yearId) return;
    this.submitting.set(true);
    // The submit body only carries `finalAction` — the backend validates flags/comments
    // against whatever was last persisted via /draft, so save the draft first.
    this.service
      .saveDraft(yearId, this.buildDraftPayload())
      .pipe(switchMap(() => this.service.submit(yearId, this.pendingAction())))
      .subscribe({
        next: (updatedDetail) => {
          this.service.fyDetail.set(updatedDetail);
          this.submitting.set(false);
          this.successFy.set(fy);
          this.screen.set('success');
          this.toast('FY ' + fy + ' Ptax review submitted.');
          void this.service.loadSummary();
        },
        error: () => {
          this.submitting.set(false);
          this.toast('Failed to submit. Please try again.');
        },
      });
  }

  onViewSubmission(fy: string) {
    this.successFy.set(fy);
    this.screen.set('success');
  }

  onBackToReview() {
    this.screen.set('review');
  }

  private toast(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 4000,
      panelClass: ['custom-snackbar-success'],
    });
  }
}
