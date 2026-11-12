import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { findRouteParam } from '../../route-params.util';
import {
  CLAIMS_INSTALLMENT,
  StateClaimLetters,
  claimStatusBadgeClass,
  claimStatusLabel,
  formatReceivedOn,
  formatRupeesInCrore,
} from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';

const LOAD_ERROR ='Could not load this state’s claim letters. Please try again.';

/** One state's claim letters: under review, returned or acknowledged by MoHUA. */
@Component({
  selector: 'app-mohua-state-claim-letters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MohuaPageLoaderComponent],
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

  readonly stateId = this.route.snapshot.paramMap.get('stateId') ?? '';
  readonly data = signal<StateClaimLetters | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
