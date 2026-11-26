import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MohuaPageLoaderComponent } from '../page-loader/page-loader.component';
import { findRouteParam } from '../route-params.util';
import { CountUpDirective, RevealDirective } from '../state-detail/state-detail.directives';
import {
  CLAIMS_INSTALLMENT,
  ClaimLetterListItem,
  ClaimLettersStateRow,
  ClaimLettersStates,
  claimStatusBadgeClass,
  claimStatusLabel,
  formatOrdinal,
  formatReceivedOn,
  formatRupeesInCrore,
} from './claims-submission.models';
import { ClaimsSubmissionService } from './claims-submission.service';

const LOAD_ERROR = 'Could not load the claim letters. Please try again.';

/** A stage chip the States table can be narrowed to: its letters' statuses, as the API counts them. */
type ClaimStageKey = 'underReview' | 'approved' | 'returned';

/** Each stage chip's letter statuses, matching the summary cards' counts (All letters is no filter at all). */
const STAGE_STATUSES: Readonly<Record<ClaimStageKey, readonly number[]>> = {
  underReview: [15],
  approved: [5, 7],
  returned: [16, 6],
};

/** Which states the table shows: every state, only those that sent a claim letter, or only those that have not. */
type StateFilter = 'all' | 'received' | 'pending';

/** One step of the national claim pipeline: its headline, a line under it, the amount and an optional note.
 *  `value: null` is a step not tracked yet (released: the DoE release step isn't built). */
interface PipelineStep {
  key: 'submitted' | 'underReview' | 'approved' | 'released';
  label: string;
  icon: string;
  value: string | null;
  sub: string;
  amount: string | null;
  note: string | null;
}

function claimsText(count: number): string {
  return `${count} ${count === 1 ? 'claim' : 'claims'}`;
}

const FILTER_OPTIONS: readonly { value: StateFilter; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: 'bi-grid' },
  { value: 'received', label: 'Claim received', icon: 'bi-envelope-check' },
  { value: 'pending', label: 'Awaiting claim', icon: 'bi-hourglass-split' },
];

/** MoHUA's "Claims & Submissions": every state with whether its first claim letter has arrived. */
@Component({
  selector: 'app-mohua-claims-submission',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MohuaPageLoaderComponent,
    RevealDirective,
    CountUpDirective,
  ],
  templateUrl: './claims-submission.component.html',
  styleUrl: './claims-submission.component.scss',
})
export class ClaimsSubmissionComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClaimsSubmissionService);
  private readonly destroyRef = inject(DestroyRef);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;
  readonly installment = CLAIMS_INSTALLMENT;
  readonly formatCrore = formatRupeesInCrore;
  readonly ordinal = formatOrdinal;
  readonly formatDate = formatReceivedOn;
  readonly letterStatusLabel = claimStatusLabel;
  readonly letterBadgeClass = claimStatusBadgeClass;

  private readonly yearId = findRouteParam(this.route.snapshot, 'yearId');

  /** States whose row is open; several can be open at once. */
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  /** The stage chip the table is narrowed to (its States open, only its letters shown); null shows everything. */
  readonly stage = signal<ClaimStageKey | null>(null);

  /** The chips beside "States": All letters plus each stage, with the counts the summary cards show. */
  readonly stageChips = computed(() => {
    const o = this.data()?.overview;
    return [
      { value: 'all', label: 'All letters', count: o?.submitted.claims ?? 0 },
      { value: 'underReview', label: 'Under review by MoHUA', count: o?.underReview.claims ?? 0 },
      { value: 'approved', label: 'Approved', count: o?.approved.claims ?? 0 },
      { value: 'returned', label: 'Returned', count: o?.returned.claims ?? 0 },
    ] as const;
  });

  readonly data = signal<ClaimLettersStates | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** The national headline (total allocation) and the claim pipeline: submitted -> under review -> approved -> released. */
  readonly pipeline = computed<{ allocation: string; allocationSub: string; steps: PipelineStep[] } | null>(() => {
    const o = this.data()?.overview;
    if (!o) return null;
    const ofClaims = `of ${claimsText(o.submitted.claims)}`;
    return {
      allocation: this.formatCrore(o.totalAllocation),
      allocationSub: `across ${o.stateCount} ${o.stateCount === 1 ? 'state' : 'states'}`,
      steps: [
        {
          key: 'submitted',
          label: 'Submitted',
          icon: 'bi-envelope-paper',
          value: claimsText(o.submitted.claims),
          sub: `from ${o.submitted.states} of ${o.stateCount} states`,
          amount: this.formatCrore(o.submitted.amount),
          note: o.returned.claims > 0 ? `${o.returned.claims} returned for correction` : null,
        },
        {
          key: 'underReview',
          label: 'Under review by MoHUA',
          icon: 'bi-hourglass-split',
          value: claimsText(o.underReview.claims),
          sub: ofClaims,
          amount: this.formatCrore(o.underReview.amount),
          note: 'With the Section Officer',
        },
        {
          key: 'approved',
          label: 'Approved',
          icon: 'bi-patch-check',
          value: claimsText(o.approved.claims),
          sub: ofClaims,
          amount: this.formatCrore(o.approved.amount),
          note:
            o.approved.states > 0 ? `from ${o.approved.states} ${o.approved.states === 1 ? 'state' : 'states'}` : null,
        },
        {
          key: 'released',
          label: 'Released',
          icon: 'bi-cash-coin',
          value: null,
          sub: 'by DoE',
          amount: null,
          note: null,
        },
      ],
    };
  });

  readonly filterOptions = FILTER_OPTIONS;
  /** The State name search and the claim filter; both apply on the page, to the states already loaded. */
  readonly query = signal('');
  readonly filter = signal<StateFilter>('all');

  /** How many states each filter would show (the counts on the filter buttons and the heading pill). */
  readonly counts = computed<Record<StateFilter, number>>(() => {
    const states = this.data()?.states ?? [];
    const received = states.filter((s) => s.firstClaimStatus === 'RECEIVED').length;
    return { all: states.length, received, pending: states.length - received };
  });

  readonly visibleStates = computed(() => {
    const term = this.query().trim().toLowerCase();
    const filter = this.filter();
    const stage = this.stage();
    return (this.data()?.states ?? []).filter(
      (s) =>
        (filter === 'all' || (filter === 'received') === (s.firstClaimStatus === 'RECEIVED')) &&
        (!term || s.name.toLowerCase().includes(term)) &&
        (!stage || this.lettersOf(s).length > 0),
    );
  });

  /** A State's letters, narrowed to the chosen stage chip's statuses when one is chosen. */
  lettersOf(row: ClaimLettersStateRow): ClaimLetterListItem[] {
    const stage = this.stage();
    const letters = row.claimLetters ?? [];
    return stage ? letters.filter((l) => STAGE_STATUSES[stage].includes(l.status)) : letters;
  }

  /** The stage chips: one narrows the table to that stage's letters; All letters (null) shows everything. */
  selectStage(key: ClaimStageKey | null): void {
    this.stage.set(key);
  }

  /** The claimed amount as a share of the State's installment allocation ("33%", "<1%"); null when there is
   *  no claim or no allocation to compare with. */
  claimedPercent(row: ClaimLettersStateRow): string | null {
    if (row.amountClaimed === null || !row.installmentAllocation) return null;
    const pct = (row.amountClaimed / row.installmentAllocation) * 100;
    if (pct > 0 && pct < 1) return '<1%';
    return `${Math.round(pct)}%`;
  }

  clearFilters(): void {
    this.query.set('');
    this.filter.set('all');
    this.stage.set(null);
  }

  /** While a stage chip is chosen its States are all shown open; otherwise only the rows MoHUA opened. */
  isExpanded(stateId: string): boolean {
    return this.stage() !== null || this.expanded().has(stateId);
  }

  /** Opens or closes a State's row. While a stage chip is chosen every listed State is open, so the toggle is hidden. */
  toggle(stateId: string): void {
    const next = new Set(this.expanded());
    if (!next.delete(stateId)) next.add(stateId);
    this.expanded.set(next);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    // A reload starts with every row closed and no stage chip chosen.
    this.expanded.set(new Set());
    this.stage.set(null);
    this.service
      .getStates(this.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }
}
