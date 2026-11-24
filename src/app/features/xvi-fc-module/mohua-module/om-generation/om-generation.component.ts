import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { formatRupeesInCrore } from '../claims-submission/claims-submission.models';
import { MohuaPageLoaderComponent } from '../page-loader/page-loader.component';
import { findRouteParam } from '../route-params.util';
import { OM_STATUS_LABEL, OmStageFilter, OmStates, isIssued, matchesOmSearch, omStage } from './om-generation.models';
import { OmGenerationService } from './om-generation.service';
import { OmStepsComponent } from './om-steps/om-steps.component';

const LOAD_ERROR = 'Could not load the approved claim letters. Please try again.';

/** Step 2: verified claim letters grouped by State; Generate OM opens one letter's OM on its own page. */
@Component({
  selector: 'app-om-generation',
  imports: [
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MohuaPageLoaderComponent,
    OmStepsComponent,
  ],
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

  /** Search (State, claim letter no., OM no.) and the State / OM status filters; all on the loaded list. */
  readonly query = signal('');
  readonly stateFilter = signal<string>('ALL');
  readonly stageFilter = signal<OmStageFilter>('ALL');
  readonly stageOptions: readonly { value: OmStageFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'NOT_GENERATED', label: 'Not generated' },
    { value: 'GENERATED', label: OM_STATUS_LABEL.GENERATED },
    { value: 'ISSUED', label: OM_STATUS_LABEL.SIGNED_UPLOADED },
  ];

  /** Each State with only its letters that pass the filters; a State left with none is dropped. */
  readonly filteredStates = computed(() =>
    (this.data()?.states ?? [])
      .filter((state) => this.stateFilter() === 'ALL' || state.stateId === this.stateFilter())
      .map((state) => ({
        ...state,
        claimLetters: state.claimLetters.filter(
          (letter) =>
            (this.stageFilter() === 'ALL' || omStage(letter.omStatus) === this.stageFilter()) &&
            matchesOmSearch(this.query(), state.stateName, letter.claimLetterRefNo, letter.omRefNo),
        ),
      }))
      .filter((state) => state.claimLetters.length > 0),
  );

  clearFilters(): void {
    this.query.set('');
    this.stateFilter.set('ALL');
    this.stageFilter.set('ALL');
  }

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
