import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MohuaPageLoaderComponent } from '../page-loader/page-loader.component';
import { findRouteParam } from '../route-params.util';
import { CLAIMS_INSTALLMENT, ClaimLettersStates, formatOrdinal, formatRupeesInCrore } from './claims-submission.models';
import { ClaimsSubmissionService } from './claims-submission.service';

const LOAD_ERROR = 'Could not load the claim letters. Please try again.';

/** MoHUA's "Claims & Submissions": every state with whether its first claim letter has arrived. */
@Component({
  selector: 'app-mohua-claims-submission',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MohuaPageLoaderComponent],
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

  readonly data = signal<ClaimLettersStates | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getStates(findRouteParam(this.route.snapshot, 'yearId'))
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
