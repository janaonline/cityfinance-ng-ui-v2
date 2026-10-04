import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { XvFcReviewOverviewService } from './xv-fc-review-overview.service';
import { XV_FC_ADMIN_REVIEWABLE_YEARS } from '../models/xv-fc-review-admin.model';
import { XV_FC_PTAX_ADMIN_REVIEWABLE_YEARS } from '../models/ptax-review-admin.model';
import { XvFcOverviewFormStatus, XvFcOverviewOverallStatus, XvFcOverviewRow } from '../models/xv-fc-review-overview.model';

const OVERALL_STATUS_LABELS: Record<XvFcOverviewOverallStatus, string> = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted, Awaiting Review',
  VERIFYING: 'Verification in Progress',
  PARTIAL: 'Partially Reviewed',
  APPROVED: 'Approved by Admin',
  REJECTED: 'Rejected by Admin',
};

const STATUS_DOT_COLOR: Record<string, string> = {
  NOT_STARTED: '#9aa4b2',
  IN_PROGRESS: '#2a6ea8',
  DRAFT: '#2a6ea8',
  SUBMITTED: '#c9861a',
  LOCKED: '#c9861a',
  VERIFYING: '#6a4fbf',
  PARTIAL: '#c9861a',
  APPROVED: '#1a9a5c',
  REJECTED: '#d84343',
};

@Component({
  selector: 'app-xv-fc-review-admin-overview',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './xv-fc-review-admin-overview.component.html',
  styleUrl: './xv-fc-review-admin-overview.component.scss',
})
export class XvFcReviewAdminOverviewComponent {
  readonly service = inject(XvFcReviewOverviewService);
  private readonly router = inject(Router);

  readonly statusOptions: XvFcOverviewOverallStatus[] = [
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
    'VERIFYING',
    'PARTIAL',
    'APPROVED',
    'REJECTED',
  ];
  readonly statusLabels = OVERALL_STATUS_LABELS;

  formScope = signal<'' | 'afs' | 'ptax'>('');
  stateFilter = signal('');
  censusCodeFilter = signal('');
  searchFilter = signal('');
  statusFilter = signal<XvFcOverviewOverallStatus | ''>('');

  page = signal(1);
  pageSize = signal(50);
  sortBy = signal<'ulb' | 'state' | 'censusCode'>('ulb');
  sortOrder = signal<'asc' | 'desc'>('asc');

  exporting = signal(false);

  readonly rows = computed(() => this.service.listResponse()?.rows ?? []);
  readonly total = computed(() => this.service.listResponse()?.total ?? 0);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly rangeStart = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  constructor() {
    void this.refresh();
    void this.refreshAnalytics();
  }

  // ── Filters ─────────────────────────────────────────────────────────────
  onFilterChange() {
    this.page.set(1);
    void this.refresh();
  }

  onFormScopeChange() {
    void this.refreshAnalytics();
  }

  setSort(field: 'ulb' | 'state' | 'censusCode') {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    void this.refresh();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    void this.refresh();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.page.set(1);
    void this.refresh();
  }

  private async refresh() {
    // financialYear isn't sent — same as analytics below, it's optional server-side and defaults
    // to the same latest-reviewable-year this component already assumes locally (for the Detail
    // link and CSV filename), and there's no year selector on this screen to drive it from.
    await this.service.loadList({
      page: this.page(),
      limit: this.pageSize(),
      stateName: this.stateFilter() || undefined,
      censusCode: this.censusCodeFilter() || undefined,
      search: this.searchFilter() || undefined,
      overallStatus: this.statusFilter() || undefined,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    });
  }

  private async refreshAnalytics() {
    // financialYear is optional server-side (defaults to the same latest-reviewable-year this
    // component already defaults to) — the Overview screen has no year selector, so there's
    // nothing user-driven to forward here.
    await this.service.loadAnalytics({
      form: this.formScope() || undefined,
    });
  }

  // ── Row helpers ─────────────────────────────────────────────────────────
  dotColor(status: string): string {
    return STATUS_DOT_COLOR[status] ?? '#9aa4b2';
  }

  statusLabel(status: XvFcOverviewOverallStatus): string {
    return OVERALL_STATUS_LABELS[status] ?? status;
  }

  /**
   * One number instead of the old three ("X% / Y% / Z pending") — how much of this form's
   * flagged items have a decision at all (accepted or rejected), regardless of which way it
   * went. Paired with the raw pending count in the template for the "how much is left" context.
   */
  reviewedPct(form: XvFcOverviewFormStatus): number {
    if (form.flaggedCount === 0) return 0;
    return Math.round(((form.flaggedCount - form.pendingCount) / form.flaggedCount) * 100);
  }

  /** Which form to land the admin on by default — an active review (submitted/verifying) wins, else whichever is finalized, else AFS. */
  defaultTabFor(row: XvFcOverviewRow): 'afs' | 'ptax' {
    const active = ['SUBMITTED', 'LOCKED', 'VERIFYING'];
    if (active.includes(row.afs.status)) return 'afs';
    if (active.includes(row.ptax.status)) return 'ptax';
    if (['APPROVED', 'REJECTED'].includes(row.afs.status)) return 'afs';
    if (['APPROVED', 'REJECTED'].includes(row.ptax.status)) return 'ptax';
    return 'afs';
  }

  actionLabel(row: XvFcOverviewRow): string {
    const active = ['SUBMITTED', 'LOCKED', 'VERIFYING'];
    if (active.includes(row.afs.status) || active.includes(row.ptax.status)) return 'Verify';
    if (['APPROVED', 'REJECTED'].includes(row.afs.status) || ['APPROVED', 'REJECTED'].includes(row.ptax.status)) {
      return 'View';
    }
    return 'Open';
  }

  open(row: XvFcOverviewRow) {
    // Navigate to the year THIS row's chosen form is actually active on — each ULB, each form,
    // independently resolves its own most-relevant reviewable year server-side (see
    // XvFcReviewOverviewService.buildJoinAndDeriveStages), so a single locally-guessed year would
    // land the wrong ULB's Detail screen on empty/stale data whenever its real activity isn't on
    // whatever year happened to be guessed. Falls back to the latest reviewable year only when
    // this form has no activity on any year yet (financialYear null) — the Detail screen's own
    // "no data yet" state handles that year tab already.
    const tab = this.defaultTabFor(row);
    // Ptax's reviewable window starts a year earlier (2018-19) than AFS's (2019-20) — the
    // fallback has to match whichever form is actually being opened.
    const fallbackYears = tab === 'afs' ? XV_FC_ADMIN_REVIEWABLE_YEARS : XV_FC_PTAX_ADMIN_REVIEWABLE_YEARS;
    const financialYear =
      (tab === 'afs' ? row.afs.financialYear : row.ptax.financialYear) ?? fallbackYears[fallbackYears.length - 1];
    void this.router.navigate(['/admin/xv-fc-review', row.ulbId, financialYear], {
      queryParams: { form: tab },
    });
  }

  // ── Export ──────────────────────────────────────────────────────────────
  async downloadSummary() {
    this.exporting.set(true);
    try {
      const blob = await this.service.exportCsv({
        stateName: this.stateFilter() || undefined,
        censusCode: this.censusCodeFilter() || undefined,
        search: this.searchFilter() || undefined,
        overallStatus: this.statusFilter() || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Matches the backend's own Content-Disposition filename convention (today's date) — the
      // export has no year concept of its own to name the file after; see the FY column inside
      // the CSV itself for the actual per-row financial year.
      a.download = `XV-FC-Review-Summary-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      this.exporting.set(false);
    }
  }
}
