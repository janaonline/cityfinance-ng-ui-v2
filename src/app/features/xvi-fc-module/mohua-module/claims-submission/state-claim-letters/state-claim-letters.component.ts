import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { findRouteParam } from '../../route-params.util';
import { CountUpDirective, RevealDirective } from '../../state-detail/state-detail.directives';
import {
  CLAIMS_INSTALLMENT,
  StateClaimLetters,
  claimStatusBadgeClass,
  claimStatusLabel,
  formatReceivedOn,
  formatRupeesInCrore,
} from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';

const LOAD_ERROR = 'Could not load this state’s claim letters. Please try again.';

/** The State's claim progress, as the two rings show it. Percentages are whole numbers, 0-100. */
interface ClaimProgress {
  ulbs: {
    /** ULBs the State can claim: those in a letter plus those in none yet. */
    total: number;
    claimed: number;
    approved: number;
    underReview: number;
    pending: number;
    /** ULBs in returned letters; they overlap the others once resubmitted, so they are a note, not a segment. */
    returned: number;
    claimedPct: number;
    approvedPct: number;
    underReviewPct: number;
  };
  amount: { total: number; claimed: number; balance: number; claimedPct: number };
}

function percent(part: number, whole: number): number {
  return whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0;
}

/** The icon on a letter's status pill, keyed by the pill's tone (`claimStatusBadgeClass`). */
const STATUS_ICON: Readonly<Record<string, string>> = {
  'cs-badge--good': 'bi-check-circle-fill',
  'cs-badge--bad': 'bi-arrow-return-left',
  'cs-badge--review': 'bi-hourglass-split',
};

/** The same, as a bare glyph that fits the small round stamp. */
const STAMP_ICON: Readonly<Record<string, string>> = {
  'cs-badge--good': 'bi-check-lg',
  'cs-badge--bad': 'bi-arrow-return-left',
  'cs-badge--review': 'bi-hourglass-split',
};

/** One state's claim letters: under review, returned or acknowledged by MoHUA. */
@Component({
  selector: 'app-mohua-state-claim-letters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatCardModule, MohuaPageLoaderComponent, RevealDirective, CountUpDirective],
  templateUrl: './state-claim-letters.component.html',
  styleUrl: './state-claim-letters.component.scss',
})
export class StateClaimLettersComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ClaimsSubmissionService);
  private readonly destroyRef = inject(DestroyRef);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;
  readonly installment = CLAIMS_INSTALLMENT;
  readonly formatCrore = formatRupeesInCrore;
  readonly formatDate = formatReceivedOn;
  readonly badgeClass = claimStatusBadgeClass;
  readonly statusLabel = claimStatusLabel;

  statusIcon(status: number): string {
    return STATUS_ICON[claimStatusBadgeClass(status)] ?? 'bi-circle';
  }

  /** The small stamp on a letter card's icon, as on the dashboard's State Form Completion cards. */
  stampIcon(status: number): string {
    return STAMP_ICON[claimStatusBadgeClass(status)] ?? 'bi-dot';
  }
  readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';
  readonly data = signal<StateClaimLetters | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  /** Numbers for the two rings: ULBs (approved and under review, of the claimable ULBs) and amount claimed. */
  readonly progress = computed<ClaimProgress | null>(() => {
    const s = this.data()?.summary;
    if (!s) return null;
    const totalUlbs = s.claimedUlbs + s.pendingUlbs;
    const totalAmount = s.amountClaimed + s.balance;
    // The approved and under-review segments together never run past the claimed share of the ring.
    const approvedPct = percent(s.approvedUlbs, totalUlbs);
    return {
      ulbs: {
        total: totalUlbs,
        claimed: s.claimedUlbs,
        approved: s.approvedUlbs,
        underReview: s.underReviewUlbs,
        pending: s.pendingUlbs,
        returned: s.returnedUlbs,
        claimedPct: percent(s.claimedUlbs, totalUlbs),
        approvedPct,
        underReviewPct: Math.min(percent(s.underReviewUlbs, totalUlbs), 100 - approvedPct),
      },
      amount: {
        total: totalAmount,
        claimed: s.amountClaimed,
        balance: s.balance,
        claimedPct: percent(s.amountClaimed, totalAmount),
      },
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getStateClaimLetters(this.stateId, findRouteParam(this.route.snapshot, 'yearId'))
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
