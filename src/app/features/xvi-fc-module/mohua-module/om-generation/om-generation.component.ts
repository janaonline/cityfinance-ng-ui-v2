import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatRupeesInCrore } from '../claims-submission/claims-submission.models';
import { MohuaPageLoaderComponent } from '../page-loader/page-loader.component';
import { findRouteParam } from '../route-params.util';
import { OM_STATUS_LABEL, OmStates, isIssued } from './om-generation.models';
import { OmGenerationService } from './om-generation.service';
import { OmStepsComponent } from './om-steps/om-steps.component';

const LOAD_ERROR = 'Could not load the verified claim letters. Please try again.';

/** Step 2: verified claim letters grouped by State; Generate OM opens one letter's OM on its own page. */
@Component({
  selector: 'app-om-generation',
  imports: [RouterLink, MohuaPageLoaderComponent, OmStepsComponent],
  templateUrl: './om-generation.component.html',
  styleUrl: './om-generation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmGenerationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OmGenerationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly mohuaRoute = this.route.parent;
  readonly formatCrore = formatRupeesInCrore;
  readonly statusLabel = OM_STATUS_LABEL;
  readonly isIssued = isIssued;

  private readonly yearId = findRouteParam(this.route.snapshot, 'yearId');

  readonly data = signal<OmStates | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
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
