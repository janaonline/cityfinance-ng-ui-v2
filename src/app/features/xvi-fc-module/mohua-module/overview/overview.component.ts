import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { findRouteParam } from '../route-params.util';
import { MohuaPageLoaderComponent } from '../page-loader/page-loader.component';
import { OverviewBriefingComponent } from './briefing/overview-briefing.component';
import { MohuaOverviewService } from './mohua-overview.service';
import { OverviewData, StateStatus } from './overview.models';
import { OverviewStatesGlanceComponent, StateFilter } from './states-glance/overview-states-glance.component';

const LOAD_ERROR = 'Could not load the overview. Please try again.';

/** MoHUA overview: a briefing band with allocation and stage counts, and every state at a glance. */
@Component({
  selector: 'app-mohua-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MohuaPageLoaderComponent, OverviewBriefingComponent, OverviewStatesGlanceComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class MohuaOverviewComponent {
  private readonly service = inject(MohuaOverviewService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);

  readonly yearLabel = signal<string>(this.readStored(XVIFC_LS_KEYS.selectedYearString));
  readonly overview = signal<OverviewData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = computed(() => this.overview()?.rows ?? []);
  readonly stateFilter = signal<StateFilter | null>(null);

  private readonly statesSection = viewChild('states', { read: ElementRef<HTMLElement> });

  constructor() {
    this.load();
  }

  load(): void {
    const yearId = findRouteParam(this.route.snapshot, 'yearId') || this.readStored(XVIFC_LS_KEYS.selectedYearId);
    if (!yearId) {
      this.loading.set(false);
      this.error.set('Select a financial year to view the overview.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.service
      .getOverview(yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.overview.set(data);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(err instanceof HttpErrorResponse ? (err.error?.message ?? LOAD_ERROR) : LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  /** A status button in the briefing band filters the states section and brings it into view. */
  showStatus(status: StateStatus): void {
    this.stateFilter.set(status);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.statesSection()?.nativeElement.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  private readStored(key: string): string {
    try {
      return localStorage.getItem(key) ?? '';
    } catch {
      return '';
    }
  }
}
