import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest } from 'rxjs';
import { MaterialModule } from '../../../material.module';
import { MATERIAL_THEME_CLASS } from '../../../core/theming/material-theme.providers';
import { XvFcReviewAdminService } from '../xv-fc-review-admin.service';
import { PtaxReviewAdminService } from '../ptax/ptax-review-admin.service';
import { XV_FC_ADMIN_REVIEWABLE_YEARS, isXvFcAdminFinalized } from '../models/xv-fc-review-admin.model';
import { XV_FC_PTAX_ADMIN_REVIEWABLE_YEARS } from '../models/ptax-review-admin.model';
import {
  RejectReasonDialogComponent,
  RejectReasonDialogData,
} from '../dialogs/reject-reason-dialog/reject-reason-dialog.component';
import {
  FinalSubmitDialogComponent,
  FinalSubmitDialogData,
} from '../dialogs/final-submit-dialog/final-submit-dialog.component';
import { ReopenDialogComponent, ReopenDialogData } from '../dialogs/reopen-dialog/reopen-dialog.component';
import {
  AuditTrailDialogComponent,
  AuditTrailDialogData,
  AuditTrailEntry,
} from '../dialogs/audit-trail-dialog/audit-trail-dialog.component';
// Generic, feature-agnostic helpers — safe to reuse across the ULB and admin sides alike.
import { extractApiErrorMessage } from '../../../features/xv-fc-review/xv-fc-review-error.util';
import { groupXvFcLineItems } from '../../../features/xv-fc-review/xv-fc-review-format.util';
import { XvFcLineItemGroup } from '../../../features/xv-fc-review/models/xv-fc-review.model';

type Tab = 'afs' | 'ptax';
type DecisionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;

/** Common shape the template renders regardless of form — AFS's lineItems and Ptax's metrics differ in field names. */
interface DisplayRow {
  code: string;
  name: string;
  section: string | null;
  subSection: string | null;
  originalValue: number | null;
  correctedValue: number | null;
  flagged: boolean;
  decisionStatus: DecisionStatus;
  reason: string;
}

const STATUS_DOT_COLOR: Record<string, string> = {
  NOT_STARTED: '#9aa4b2',
  DRAFT: '#2a6ea8',
  SUBMITTED: '#c9861a',
  LOCKED: '#c9861a',
  VERIFYING: '#6a4fbf',
  APPROVED: '#1a9a5c',
  REJECTED: '#d84343',
};

@Component({
  selector: 'app-xv-fc-review-admin-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MaterialModule],
  templateUrl: './xv-fc-review-admin-detail.component.html',
  styleUrl: './xv-fc-review-admin-detail.component.scss',
})
export class XvFcReviewAdminDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  // MatDialog is a root singleton, so the MAT_DIALOG_DEFAULT_OPTIONS override that
  // provideMaterialThemeScope() registers on the shell component never reaches it — the panel
  // class has to be forwarded explicitly on every open() call instead (see that provider's own
  // doc comment). Without this, dialogs render with none of this feature's button/table styling.
  private readonly themeClass = inject(MATERIAL_THEME_CLASS);

  readonly afsService = inject(XvFcReviewAdminService);
  readonly ptaxService = inject(PtaxReviewAdminService);

  ulbId = signal('');
  financialYear = signal('');
  currentTab = signal<Tab>('afs');
  // Ptax's reviewable window starts a year earlier (2018-19) than AFS's (2019-20) — the year-tabs
  // bar must reflect whichever form's tab is active, not one shared list.
  readonly reviewableYears = computed(() =>
    this.currentTab() === 'afs' ? XV_FC_ADMIN_REVIEWABLE_YEARS : XV_FC_PTAX_ADMIN_REVIEWABLE_YEARS,
  );
  collapsedSections = signal<Record<string, boolean>>({});
  filter = signal<'all' | 'pending' | 'accepted' | 'rejected' | 'changed'>('all');
  submitting = signal(false);

  // Must read from whichever service matches the active tab — Ptax's reviewable window starts a
  // year earlier (2018-19) than AFS's (2019-20), so afsService.yearsSummary() has no entry at all
  // for FY 2018-19. Reading it unconditionally here meant selecting that year while on the Ptax
  // tab always resolved to null, silently skipping the detail load (and its API call) entirely.
  currentYearId = computed(() => {
    const list = this.currentTab() === 'afs' ? this.afsService.yearsSummary() : this.ptaxService.yearsSummary();
    return list.find((y) => y.financialYear === this.financialYear())?.yearId ?? null;
  });

  readonly loading = computed(() =>
    this.currentTab() === 'afs' ? this.afsService.detailLoading() : this.ptaxService.detailLoading(),
  );
  readonly loadError = computed(() =>
    this.currentTab() === 'afs' ? this.afsService.detailError() : this.ptaxService.detailError(),
  );

  readonly rows = computed<DisplayRow[]>(() => {
    if (this.currentTab() === 'afs') {
      const detail = this.afsService.detail();
      if (!detail) return [];
      return detail.lineItems.map((li) => ({
        code: li.code,
        name: li.name ?? li.code,
        section: li.section,
        subSection: li.subSection,
        originalValue: li.originalValue,
        correctedValue: li.proposedValue,
        flagged: li.flagged,
        decisionStatus: li.adminDecision?.status ?? (li.flagged ? 'PENDING' : null),
        reason: li.adminDecision?.reason ?? '',
      }));
    }
    const detail = this.ptaxService.detail();
    if (!detail) return [];
    return detail.metrics.map((m) => ({
      code: m.code,
      name: m.label,
      section: null,
      subSection: null,
      originalValue: m.value != null && m.value !== '' && !Number.isNaN(Number(m.value)) ? Number(m.value) : null,
      correctedValue: m.proposedValue,
      flagged: m.flagged,
      decisionStatus: m.adminDecision?.status ?? (m.flagged ? 'PENDING' : null),
      reason: m.adminDecision?.reason ?? '',
    }));
  });

  readonly filteredRows = computed(() => {
    const rows = this.rows();
    switch (this.filter()) {
      case 'pending':
        return rows.filter((r) => r.flagged && r.decisionStatus === 'PENDING');
      case 'accepted':
        return rows.filter((r) => r.decisionStatus === 'ACCEPTED');
      case 'rejected':
        return rows.filter((r) => r.decisionStatus === 'REJECTED');
      case 'changed':
        return rows.filter((r) => r.flagged);
      default:
        return rows;
    }
  });

  /**
   * AFS only — same section/subSection grouping (and "Others" pinning/merge rules) the ULB
   * dashboard uses for these exact 77 line items, so both sides show identical headers over the
   * same data. Ptax renders flat.
   */
  readonly groupedSections = computed(() => {
    if (this.currentTab() !== 'afs') return null;
    const rows = this.filteredRows().map((r) => ({ ...r, section: r.section ?? 'Other' }));
    return groupXvFcLineItems(rows);
  });

  sectionItemCount(group: XvFcLineItemGroup<DisplayRow>): number {
    return group.subGroups.reduce((sum, sg) => sum + sg.items.length, 0);
  }

  readonly flaggedCount = computed(() => this.rows().filter((r) => r.flagged).length);
  readonly acceptedCount = computed(() => this.rows().filter((r) => r.decisionStatus === 'ACCEPTED').length);
  readonly rejectedCount = computed(() => this.rows().filter((r) => r.decisionStatus === 'REJECTED').length);
  readonly decidedCount = computed(() => this.acceptedCount() + this.rejectedCount());
  readonly pendingCount = computed(() => this.flaggedCount() - this.decidedCount());
  readonly allDecided = computed(() => this.pendingCount() === 0);

  readonly currentStatus = computed(() =>
    this.currentTab() === 'afs' ? this.afsService.detail()?.status : this.ptaxService.detail()?.status,
  );
  readonly isLocked = computed(() => isXvFcAdminFinalized(this.currentStatus()));
  readonly isVerifying = computed(() => this.currentStatus() === 'VERIFYING');

  readonly declaration = computed(() =>
    this.currentTab() === 'afs' ? this.afsService.detail()?.declaration : this.ptaxService.detail()?.declaration,
  );
  readonly supportingDocument = computed(() =>
    this.currentTab() === 'afs'
      ? this.afsService.detail()?.supportingDocument
      : this.ptaxService.detail()?.supportingDocument,
  );

  readonly ulbName = computed(() => this.afsService.detail()?.ulbName ?? this.ptaxService.detail()?.ulbName ?? '');
  readonly formLabel = computed(() =>
    this.currentTab() === 'afs' ? 'Audited Financial Statement' : 'Property Tax',
  );

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, queryParams]) => {
      this.ulbId.set(params.get('ulbId') ?? '');
      this.financialYear.set(params.get('financialYear') ?? '');
      const form = queryParams.get('form');
      this.currentTab.set(form === 'ptax' ? 'ptax' : 'afs');
      void this.loadAll();
    });
  }

  private async loadAll(): Promise<void> {
    await Promise.all([
      this.afsService.loadYearsSummary(this.ulbId()),
      this.ptaxService.loadYearsSummary(this.ulbId()),
    ]);
    await this.loadCurrentTabDetail();
  }

  private async loadCurrentTabDetail(): Promise<void> {
    const yearId = this.currentYearId();
    if (!yearId) return;
    if (this.currentTab() === 'afs') {
      await this.afsService.loadDetail(this.ulbId(), yearId);
    } else {
      await this.ptaxService.loadDetail(this.ulbId(), yearId);
    }
  }

  // ── Navigation ──────────────────────────────────────────────────────────
  switchTab(tab: Tab) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { form: tab },
      queryParamsHandling: 'merge',
    });
  }

  selectYear(fy: string) {
    void this.router.navigate(['/admin/xv-fc-review', this.ulbId(), fy], {
      queryParams: { form: this.currentTab() },
    });
  }

  yearDotStatus(fy: string): string {
    const list = this.currentTab() === 'afs' ? this.afsService.yearsSummary() : this.ptaxService.yearsSummary();
    return list.find((y) => y.financialYear === fy)?.status ?? 'NOT_STARTED';
  }

  /** Status dot for the AFS/Ptax tab itself, for the CURRENT financial year — independent of which tab is active. */
  yearDotStatusForTab(tab: Tab): string {
    const list = tab === 'afs' ? this.afsService.yearsSummary() : this.ptaxService.yearsSummary();
    return list.find((y) => y.financialYear === this.financialYear())?.status ?? 'NOT_STARTED';
  }

  dotColor(status: string): string {
    return STATUS_DOT_COLOR[status] ?? '#9aa4b2';
  }

  /** Percentage change of the ULB's corrected value vs. the original — null hides the badge. */
  diffPercent(row: DisplayRow): number | null {
    if (!row.flagged || row.originalValue == null || row.correctedValue == null || row.originalValue === 0) {
      return null;
    }
    if (row.correctedValue === row.originalValue) return null;
    return Math.round(((row.correctedValue - row.originalValue) / row.originalValue) * 100);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleSection(key: string) {
    this.collapsedSections.update((m) => ({ ...m, [key]: !m[key] }));
  }

  expandAll() {
    // Absence of a key already reads as "not collapsed" (see the template's fallback), so
    // clearing the map is equivalent to expanding every section, current or future.
    this.collapsedSections.set({});
  }

  collapseAll() {
    const sections = this.groupedSections() ?? [];
    this.collapsedSections.set(Object.fromEntries(sections.map((g) => [g.section, true])));
  }

  // ── Decisions ───────────────────────────────────────────────────────────
  accept(row: DisplayRow) {
    this.submitDecision(row, { decision: 'ACCEPTED', correctedValue: row.correctedValue ?? undefined });
  }

  reject(row: DisplayRow) {
    const ref = this.dialog.open<RejectReasonDialogComponent, RejectReasonDialogData, string | undefined>(
      RejectReasonDialogComponent,
      { width: '500px', panelClass: this.themeClass, data: { code: row.code, label: row.name } },
    );
    ref.afterClosed().subscribe((reason) => {
      if (reason === undefined) return;
      this.submitDecision(row, { decision: 'REJECTED', reason });
    });
  }

  /**
   * The Rejection Reason column stays editable after the initial Reject (matching the approved
   * prototype's inline `reason-input`) — re-sends the same REJECTED decision with the updated
   * text. The backend now allows re-deciding an already-decided item, so this just overwrites
   * the stored reason without disturbing the ACCEPTED/REJECTED status itself.
   */
  updateReason(row: DisplayRow, reason: string) {
    if (row.decisionStatus !== 'REJECTED' || reason === row.reason) return;
    this.submitDecision(row, { decision: 'REJECTED', reason });
  }

  private submitDecision(
    row: DisplayRow,
    payload: { decision: 'ACCEPTED' | 'REJECTED'; reason?: string; correctedValue?: number },
  ) {
    const yearId = this.currentYearId();
    if (!yearId) return;
    const verb = payload.decision === 'ACCEPTED' ? 'accepted' : 'rejected';
    if (this.currentTab() === 'afs') {
      this.afsService.decideLineItem(this.ulbId(), yearId, row.code, payload).subscribe({
        next: (detail) => {
          this.afsService.detail.set(detail);
          this.toast(`${row.code} ${verb}.`);
          // The very first decision on a submission auto-bumps its status (LOCKED/SUBMITTED →
          // VERIFYING) — refresh the year-tab dots so that shows up without a page reload.
          void this.afsService.loadYearsSummary(this.ulbId());
        },
        error: (err) => this.toast(extractApiErrorMessage(err, 'Failed to save this decision. Please try again.')),
      });
    } else {
      this.ptaxService.decideMetric(this.ulbId(), yearId, row.code, payload).subscribe({
        next: (detail) => {
          this.ptaxService.detail.set(detail);
          this.toast(`${row.code} ${verb}.`);
          void this.ptaxService.loadYearsSummary(this.ulbId());
        },
        error: (err) => this.toast(extractApiErrorMessage(err, 'Failed to save this decision. Please try again.')),
      });
    }
  }

  acceptAll() {
    const yearId = this.currentYearId();
    if (!yearId || this.pendingCount() === 0) return;
    this.submitting.set(true);
    if (this.currentTab() === 'afs') {
      this.afsService.acceptAll(this.ulbId(), yearId).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.afsService.detail.set(detail);
          this.toast('Pending line items accepted.');
          void this.afsService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to accept pending items. Please try again.'));
        },
      });
    } else {
      this.ptaxService.acceptAll(this.ulbId(), yearId).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.ptaxService.detail.set(detail);
          this.toast('Pending metrics accepted.');
          void this.ptaxService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to accept pending items. Please try again.'));
        },
      });
    }
  }

  openFinalSubmit() {
    const ref = this.dialog.open<FinalSubmitDialogComponent, FinalSubmitDialogData, boolean>(
      FinalSubmitDialogComponent,
      {
        width: '480px',
        panelClass: this.themeClass,
        data: {
          ulbName: this.ulbName(),
          formLabel: this.formLabel(),
          acceptedCount: this.acceptedCount(),
          rejectedCount: this.rejectedCount(),
          total: this.flaggedCount(),
        },
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) this.finalize();
    });
  }

  private finalize() {
    const yearId = this.currentYearId();
    if (!yearId) return;
    this.submitting.set(true);
    if (this.currentTab() === 'afs') {
      this.afsService.finalize(this.ulbId(), yearId).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.afsService.detail.set(detail);
          this.toast(`Final Submit complete - ${this.formLabel()} is now ${detail.status}.`);
          void this.afsService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to finalize. Please try again.'));
        },
      });
    } else {
      this.ptaxService.finalize(this.ulbId(), yearId).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.ptaxService.detail.set(detail);
          this.toast(`Final Submit complete - ${this.formLabel()} is now ${detail.status}.`);
          void this.ptaxService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to finalize. Please try again.'));
        },
      });
    }
  }

  openReopen() {
    const ref = this.dialog.open<ReopenDialogComponent, ReopenDialogData, string | undefined>(ReopenDialogComponent, {
      width: '480px',
      panelClass: this.themeClass,
      data: { ulbName: this.ulbName(), formLabel: this.formLabel() },
    });
    ref.afterClosed().subscribe((reason) => {
      if (reason !== undefined) this.reopen(reason);
    });
  }

  private reopen(reason: string) {
    const yearId = this.currentYearId();
    if (!yearId) return;
    this.submitting.set(true);
    if (this.currentTab() === 'afs') {
      this.afsService.reopen(this.ulbId(), yearId, reason).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.afsService.detail.set(detail);
          this.toast(`${this.formLabel()} reopened for the ULB.`);
          void this.afsService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to reopen. Please try again.'));
        },
      });
    } else {
      this.ptaxService.reopen(this.ulbId(), yearId, reason).subscribe({
        next: (detail) => {
          this.submitting.set(false);
          this.ptaxService.detail.set(detail);
          this.toast(`${this.formLabel()} reopened for the ULB.`);
          void this.ptaxService.loadYearsSummary(this.ulbId());
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast(extractApiErrorMessage(err, 'Failed to reopen. Please try again.'));
        },
      });
    }
  }

  // ── Documents ───────────────────────────────────────────────────────────
  /**
   * Opens the tab synchronously, still inside the click's user-gesture context - browsers
   * silently block window.open() called from an async callback (e.g. after this request
   * resolves), so waiting for the signed-url response would lose the popup permission with no
   * error shown. Same fix applied to the ULB-side xv-fc-data-review.component.ts.
   */
  viewDocument(targetCode: string) {
    const yearId = this.currentYearId();
    if (!yearId) return;
    const tab = window.open('', '_blank');
    if (tab) tab.opener = null;
    const obs =
      this.currentTab() === 'afs'
        ? this.afsService.getDocumentSignedUrl(this.ulbId(), yearId, targetCode)
        : this.ptaxService.getDocumentSignedUrl(this.ulbId(), yearId, targetCode);
    obs.subscribe({
      next: (url) => {
        if (tab) tab.location.href = url;
      },
      error: (err) => {
        tab?.close();
        this.toast(extractApiErrorMessage(err, 'Failed to open this document. Please try again.'));
      },
    });
  }

  // ── Audit ───────────────────────────────────────────────────────────────
  openAudit(row: DisplayRow) {
    let entries: AuditTrailEntry[];
    if (this.currentTab() === 'afs') {
      entries = (this.afsService.detail()?.auditTrail ?? [])
        .filter((a) => a.lineItemCode === row.code)
        .map((a) => ({
          createdAt: a.createdAt,
          performedByRole: a.performedByRole,
          action: a.action,
          previousValue: a.previousValue,
          newValue: a.newValue,
          reason: a.reason,
        }));
    } else {
      entries = (this.ptaxService.detail()?.history ?? [])
        .filter((h) => h.metricCode === row.code)
        .map((h) => ({
          createdAt: h.createdAt,
          performedByRole: h.performedByRole,
          action: h.action,
          previousValue: h.previousValue,
          newValue: h.newValue,
          reason: h.reason,
        }));
    }
    this.dialog.open<AuditTrailDialogComponent, AuditTrailDialogData>(AuditTrailDialogComponent, {
      // Wide enough for all 6 columns (incl. a free-text Note) to fit without the horizontal
      // scroll .table-responsive falls back to for pathologically long unbroken note text.
      width: '860px',
      maxWidth: '95vw',
      panelClass: this.themeClass,
      data: { title: `Change history for ${row.code} - ${row.name}`, entries },
    });
  }

  private toast(message: string) {
    this.snackBar.open(message, 'Close', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 4000,
    });
  }
}
