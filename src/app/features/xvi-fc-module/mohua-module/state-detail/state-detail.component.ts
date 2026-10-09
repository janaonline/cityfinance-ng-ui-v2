import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { SAMPLE_PDF_PATH } from '../ulb-detail/ulb-detail.placeholder';
import { CountUpDirective, RevealDirective } from './state-detail.directives';
import { ClaimLetter, STATE_DETAIL, StateDetail, Tone, UlbRow, UlbStatus } from './state-detail.placeholder';

const PAGE_SIZE = 15;
const ULB_COLUMNS = ['name', 'census', 'allocation', 'electedBody', 'audited', 'provisional', 'pfms', 'slb', 'dur', 'status'];
const CLAIM_COLUMNS = ['id', 'received', 'ulbs', 'amount', 'status', 'pdf'];
/** Latest claim letters shown before the "View all" toggle (one row of three). */
const CLAIMS_COLLAPSED_COUNT = 3;

const STATUS_LABEL: Record<UlbStatus, string> = {
  eligible: 'Eligible',
  notStarted: 'Not Started',
  inProgress: 'In Progress',
  underReview: 'Under Review',
  exemption: 'Exemption Req.',
};

/** The overall-status filter is split in two dropdowns; each ULB has one status, so a value from either group sets the one filter. */
const ELIGIBILITY_STATUSES: UlbStatus[] = ['eligible', 'exemption'];
const PROGRESS_STATUSES: UlbStatus[] = ['notStarted', 'inProgress', 'underReview'];

const STATUS_TONE: Record<UlbStatus, Tone> = {
  eligible: 'good',
  notStarted: 'grey',
  inProgress: 'teal',
  underReview: 'orange',
  exemption: 'bad',
};

/** "andhra-pradesh" -> "Andhra Pradesh". */
function titleCase(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

@Component({
  selector: 'app-mohua-state-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    RouterLink,
    RevealDirective,
    CountUpDirective,
  ],
  templateUrl: './state-detail.component.html',
  styleUrl: './state-detail.component.scss',
})
export class StateDetailComponent {
  private readonly route = inject(ActivatedRoute);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;

  readonly detail: StateDetail = STATE_DETAIL;
  readonly eligibilityOptions = ELIGIBILITY_STATUSES.map((key) => ({ key, label: STATUS_LABEL[key] }));
  readonly progressOptions = PROGRESS_STATUSES.map((key) => ({ key, label: STATUS_LABEL[key] }));

  readonly stateName = toSignal(this.route.paramMap.pipe(map((params) => titleCase(params.get('stateId') ?? ''))), {
    initialValue: '',
  });

  readonly showAllClaims = signal(false);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<UlbStatus | 'all'>('all');
  readonly page = signal(1);

  readonly eligibilityValue = computed(() => (ELIGIBILITY_STATUSES.includes(this.statusFilter() as UlbStatus) ? this.statusFilter() : 'all'));
  readonly progressValue = computed(() => (PROGRESS_STATUSES.includes(this.statusFilter() as UlbStatus) ? this.statusFilter() : 'all'));

  readonly filteredUlbs = computed<UlbRow[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    return this.detail.ulbs.filter(
      (u) => (status === 'all' || u.status === status) && u.name.toLowerCase().includes(term),
    );
  });

  /** Claim letters, newest first. */
  readonly sortedClaims = computed<ClaimLetter[]>(() =>
    [...this.detail.claimLetters].sort((a, b) => b.receivedOn.localeCompare(a.receivedOn)),
  );

  readonly visibleClaims = computed(() =>
    this.showAllClaims() ? this.sortedClaims() : this.sortedClaims().slice(0, CLAIMS_COLLAPSED_COUNT),
  );

  readonly canToggleClaims = computed(() => this.sortedClaims().length > CLAIMS_COLLAPSED_COUNT);

  readonly pageSize = PAGE_SIZE;
  readonly ulbColumns = ULB_COLUMNS;
  readonly claimColumns = CLAIM_COLUMNS;
  /** The five form columns of the ULB table; `def` is also the UlbRow property that holds the flag. */
  readonly formColumns: { def: 'audited' | 'provisional' | 'pfms' | 'slb' | 'dur'; label: string }[] = [
    { def: 'audited', label: 'Audited' },
    { def: 'provisional', label: 'Provisional' },
    { def: 'pfms', label: 'PFMS' },
    { def: 'slb', label: 'SLB' },
    { def: 'dur', label: 'DUR' },
  ];
  readonly pageStart = computed(() => (this.page() - 1) * PAGE_SIZE);
  readonly pagedUlbs = computed(() => this.filteredUlbs().slice(this.pageStart(), this.pageStart() + PAGE_SIZE));

  readonly formsTotal = this.detail.totalUlbs;

  toggleClaims(): void {
    this.showAllClaims.update((open) => !open);
  }

  statusLabel(status: UlbStatus): string {
    return STATUS_LABEL[status];
  }

  statusTone(status: UlbStatus): Tone {
    return STATUS_TONE[status];
  }

  formPercent(approved: number): number {
    return Math.round((approved / this.formsTotal) * 100);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onEligibilityFilter(value: UlbStatus | 'all'): void {
    this.setStatusFilter(value, ELIGIBILITY_STATUSES);
  }

  onProgressFilter(value: UlbStatus | 'all'): void {
    this.setStatusFilter(value, PROGRESS_STATUSES);
  }

  /** Choosing "All" in a dropdown only clears the filter if it was that dropdown's own value. */
  private setStatusFilter(value: UlbStatus | 'all', group: UlbStatus[]): void {
    if (value !== 'all' || group.includes(this.statusFilter() as UlbStatus)) this.statusFilter.set(value);
    this.page.set(1);
  }

  /** Opens a form's PDF in a new tab. Shows the sample PDF until the API returns real file URLs. */
  viewFile(fileUrl: string = SAMPLE_PDF_PATH): void {
    window.open(new URL(fileUrl, document.baseURI).href, '_blank', 'noopener');
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
  }
}
