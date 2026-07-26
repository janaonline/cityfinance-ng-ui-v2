import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs/operators';
import { MaterialModule } from '../../material.module';
import { MATERIAL_THEME_CLASS, provideMaterialThemeScope } from '../../core/theming/material-theme.providers';
import { XvFcDataReviewService } from './xv-fc-data-review.service';
import {
  isXvFcSubmittedStatus,
  XvFcCurrencyUnit,
  XvFcDraftLineItemPayload,
  XvFcFinalAction,
  XvFcLineItem,
  XvFcSourceDocument,
  XV_FC_CURRENCY_UNIT_LABELS,
  XV_FC_DECLARATION_TARGET_CODE,
  XV_FC_SUPPORTING_DOCUMENT_TARGET_CODE,
} from './models/xv-fc-review.model';
import { FlagRowDialogComponent, FlagRowDialogData } from './flag-row-dialog/flag-row-dialog.component';
import { XvFcReviewPreviewComponent } from './preview/xv-fc-review-preview.component';
import { XvFcReviewSuccessComponent } from './success/xv-fc-review-success.component';
import { formatXvFcAmount, groupXvFcLineItems } from './xv-fc-review-format.util';
import { PageErrorStateComponent } from '../xvi-fc-module/shared/page-error-state/page-error-state.component';
import { PtaxReviewComponent } from './ptax/ptax-review.component';

type Screen = 'review' | 'preview' | 'success';
type ModuleTab = 'afs' | 'ptax';

/**
 * This is a standalone page (no XVI-FC side-menu shell) — external portals link to it
 * directly. Since it isn't nested under `XviFcModuleComponent`, it applies the XVI-FC
 * Material theme (CSS vars + overlay scoping) to itself instead of inheriting it.
 */
const XVIFC_THEME_CLASS = 'xvifc-theme';

@Component({
  selector: 'app-xv-fc-data-review',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    XvFcReviewPreviewComponent,
    XvFcReviewSuccessComponent,
    PageErrorStateComponent,
    PtaxReviewComponent,
  ],
  templateUrl: './xv-fc-data-review.component.html',
  styleUrl: './xv-fc-data-review.component.scss',
  host: {
    class: XVIFC_THEME_CLASS,
  },
  providers: [...provideMaterialThemeScope(XVIFC_THEME_CLASS)],
})
export class XvFcDataReviewComponent {
  activeTab = signal<ModuleTab>('afs');

  readonly service = inject(XvFcDataReviewService);
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
  pendingAction = signal<XvFcFinalAction>('ACCEPT_NO_CHANGES');
  successFy = signal<string | null>(null);

  savingDraft = signal(false);
  submitting = signal(false);
  uploadingDeclaration = signal(false);
  uploadingSupportDoc = signal(false);

  lineItemGroups = computed(() => groupXvFcLineItems(this.service.fyDetail()?.lineItems ?? []));
  totalItems = computed(() => this.service.fyDetail()?.lineItems.length ?? 0);
  flaggedItems = computed(() => (this.service.fyDetail()?.lineItems ?? []).filter((i) => i.flagged));
  flagCount = computed(() => this.flaggedItems().length);
  isLocked = computed(() => {
    const detail = this.service.fyDetail();
    return !!detail && (!!detail.finalAction || isXvFcSubmittedStatus(detail.status));
  });
  /** One shared supporting document for the whole FY — required once anything is flagged. */
  commonSupportingDocument = computed(() => this.service.fyDetail()?.supportingDocument ?? null);
  hasRequiredSupportDoc = computed(
    () => this.flagCount() === 0 || !!this.commonSupportingDocument(),
  );
  canSubmit = computed(
    () =>
      !!this.service.fyDetail()?.declaration &&
      this.flaggedItems().every((i) => !!i.comment) &&
      this.hasRequiredSupportDoc() &&
      !this.isLocked(),
  );
  submitBlockedReason = computed(() => {
    const detail = this.service.fyDetail();
    if (!detail?.declaration) return 'Upload the signed declaration above to enable this.';
    if (!this.hasRequiredSupportDoc()) {
      return 'Attach a supporting document for the line items you flagged to enable this.';
    }
    if (!this.flaggedItems().every((i) => !!i.comment)) {
      return 'Add a comment for every line item you flagged to enable this.';
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
    if (isXvFcSubmittedStatus(summary.status)) return 'dot-done';
    if (summary.flaggedCount > 0) return 'dot-flag';
    return '';
  }

  // ── Amount formatting ────────────────────────────────────────────────
  formatAmount(amountInLakhs: number | null | undefined): string {
    return formatXvFcAmount(amountInLakhs, this.currentUnit());
  }

  downloadPdf() {
    const fy = this.currentFy();
    const yearId = this.currentYearId();
    if (!fy || !yearId) return;
    this.service.downloadPdf(yearId, this.currentUnit()).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `XV-FC-Review-${fy}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast('Downloaded XV-FC-Review-' + fy + '.pdf');
      },
      error: () => this.toast('Failed to download the PDF. Please try again.'),
    });
  }

  downloadSourceDocument(doc: XvFcSourceDocument) {
    this.viewDocument(doc.targetCode);
  }

  /** Opens a signed, freshly-generated GET URL for any uploaded doc — declaration or a line item. */
  viewDocument(targetCode: string) {
    const yearId = this.currentYearId();
    if (!yearId) return;
    this.service.getDocumentSignedUrl(yearId, targetCode).subscribe({
      next: (url) => window.open(url, '_blank', 'noopener'),
      error: () => this.toast('Failed to open this document. Please try again.'),
    });
  }

  viewDeclaration() {
    this.viewDocument(XV_FC_DECLARATION_TARGET_CODE);
  }

  viewSupportingDocument() {
    this.viewDocument(XV_FC_SUPPORTING_DOCUMENT_TARGET_CODE);
  }

  // ── Flagging ──────────────────────────────────────────────────────────
  openFlagDialog(item: XvFcLineItem) {
    if (this.isLocked()) return;
    const ref = this.dialog.open<FlagRowDialogComponent, FlagRowDialogData>(FlagRowDialogComponent, {
      width: '600px',
      data: {
        code: item.code,
        label: item.name,
        existing: item.flagged
          ? { flagged: item.flagged, proposedValue: item.proposedValue, comment: item.comment }
          : null,
      },
      panelClass: this.themeClass ?? undefined,
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      if (result === 'unflag') {
        this.service.setLineItemFlagLocally(item.code, false, null, '');
        this.toast('Flag removed.');
        return;
      }
      this.service.setLineItemFlagLocally(result.code, true, result.proposedValue, result.comment);
      this.toast('Flag saved for ' + item.code + '. Attach a supporting document below.');
    });
  }

  /**
   * `loadFyDetail` wholesale-replaces `fyDetail` from the server, which would silently wipe
   * any flags/comments set locally but not yet persisted via `saveDraft`. Snapshot them first
   * and re-apply on top of the freshly loaded line items so an in-progress review survives a
   * document-upload reload.
   */
  private async reloadFyDetailPreservingFlags(yearId: string) {
    const localFlags = new Map(
      (this.service.fyDetail()?.lineItems ?? []).map((item) => [
        item.code,
        { flagged: item.flagged, proposedValue: item.proposedValue, comment: item.comment },
      ]),
    );
    await this.service.loadFyDetail(yearId);
    const detail = this.service.fyDetail();
    if (!detail) return;
    this.service.fyDetail.set({
      ...detail,
      lineItems: detail.lineItems.map((item) => {
        const local = localFlags.get(item.code);
        return local
          ? { ...item, flagged: local.flagged, proposedValue: local.proposedValue, comment: local.comment }
          : item;
      }),
    });
  }

  onCommonSupportFileChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const yearId = this.currentYearId();
    if (!file || !yearId) return;
    input.value = '';
    this.uploadingSupportDoc.set(true);
    this.service.uploadDocument(yearId, XV_FC_SUPPORTING_DOCUMENT_TARGET_CODE, file).subscribe({
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

  // ── Declaration ──────────────────────────────────────────────────────
  onDeclarationChosen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const yearId = this.currentYearId();
    if (!file || !yearId) return;
    input.value = '';
    this.uploadingDeclaration.set(true);
    this.service.uploadDocument(yearId, XV_FC_DECLARATION_TARGET_CODE, file).subscribe({
      next: async () => {
        await this.reloadFyDetailPreservingFlags(yearId);
        this.uploadingDeclaration.set(false);
        this.toast('Declaration attached.');
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

  // ── Draft / preview / submit ─────────────────────────────────────────
  private buildDraftPayload(): XvFcDraftLineItemPayload[] {
    return (this.service.fyDetail()?.lineItems ?? []).map((item) => ({
      code: item.code,
      flagged: item.flagged,
      proposedValue: item.proposedValue ?? undefined,
      comment: item.comment ?? undefined,
    }));
  }

  saveDraft() {
    const yearId = this.currentYearId();
    if (!yearId || !this.service.fyDetail()) return;
    this.savingDraft.set(true);
    this.service.saveDraft(yearId, this.buildDraftPayload()).subscribe({
      next: () => {
        this.savingDraft.set(false);
        this.toast('Draft saved. Come back anytime to finish this review.');
      },
      error: () => {
        this.savingDraft.set(false);
        this.toast('Failed to save the draft. Please try again.');
      },
    });
  }

  openPreview(action: XvFcFinalAction) {
    if (action === 'SUBMIT_WITH_COMMENTS' && this.flagCount() === 0) {
      this.toast('Nothing is flagged — use "Accept — no changes" instead, or flag a row first.');
      return;
    }
    if (action === 'ACCEPT_NO_CHANGES' && this.flagCount() > 0) {
      this.toast('You have flagged items — use "Submit with comments", or remove the flags first.');
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
          this.toast('FY ' + fy + ' review submitted.');
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
