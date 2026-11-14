import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import {
  EXEMPTION_UNAVAILABLE_FOR_FORMS,
  FORM_OPTIONS,
  FORM_TO_TAB,
  ReviewFormId,
  ReviewStatus,
  SLB_UNAVAILABLE_BUCKET_KEYS,
  STATUS_BUCKETS,
} from '../../state-module/ulb-submissions/ulb-submissions.models';
import { UlbSubmissionsService } from '../../state-module/ulb-submissions/ulb-submissions.service';

interface AdcOverviewBucket {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}

interface AdcOverviewFormCard {
  readonly form: ReviewFormId;
  readonly label: string;
  /** `?form=` query param the review table restores its "Select Form" dropdown from. */
  readonly tab: string;
  readonly total: number;
  readonly buckets: readonly AdcOverviewBucket[];
  readonly failed: boolean;
}

/**
 * ADC landing page: per-form status counts for the ADC's own ULBs. Built client-side from the same
 * `state/ulb-submissions` list endpoints the review table uses (the API already scopes them to the ADC), asking
 * for a single row per form because only each response's `counts` is used.
 */
@Component({
  selector: 'app-adc-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './adc-overview.component.html',
  styleUrl: './adc-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdcOverviewComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly ulbSubmissionsService = inject(UlbSubmissionsService);

  private readonly user = this.readStoredUser();
  readonly adcName = this.user.adcName ?? '';
  readonly stateName = this.user.stateName ?? '';
  readonly yearLabel = this.resolveYearLabel();

  readonly isLoading = signal(true);
  readonly cards = signal<AdcOverviewFormCard[]>([]);
  readonly hasError = computed(() => this.cards().length > 0 && this.cards().every((card) => card.failed));

  constructor() {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    const designYearId = this.resolveDesignYearId();

    forkJoin(
      FORM_OPTIONS.map((option) =>
        this.ulbSubmissionsService
          .list({
            designYearId,
            form: option.value,
            search: '',
            status: null,
            page: 1,
            pageSize: 1,
            sortField: 'ulbName',
            sortDirection: 'asc',
          })
          .pipe(
            map((res): AdcOverviewFormCard => this.buildCard(option.value, option.label, res.counts)),
            catchError(() => of<AdcOverviewFormCard>(this.buildCard(option.value, option.label, null))),
          ),
      ),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cards) => {
        this.cards.set(cards);
        this.isLoading.set(false);
      });
  }

  /** Query params for the review table so a count link opens it on that form and status bucket. */
  queryParamsFor(card: AdcOverviewFormCard, bucket: AdcOverviewBucket): Record<string, string> {
    return { form: card.tab, status: bucket.key };
  }

  private buildCard(
    form: ReviewFormId,
    label: string,
    counts: Readonly<Record<ReviewStatus, number>> | null,
  ): AdcOverviewFormCard {
    const buckets = STATUS_BUCKETS.filter((bucket) => !this.isBucketUnavailable(form, bucket.key)).map(
      (bucket): AdcOverviewBucket => ({
        key: bucket.key,
        label: bucket.label,
        count: counts ? bucket.statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0) : 0,
      }),
    );
    return {
      form,
      label,
      tab: FORM_TO_TAB[form] ?? '',
      total: buckets.reduce((sum, bucket) => sum + bucket.count, 0),
      buckets,
      failed: counts === null,
    };
  }

  /** Mirrors the review table: SLB has no review/return/MoHUA buckets, PFMS Bank Account has no exemption bucket. */
  private isBucketUnavailable(form: ReviewFormId, bucketKey: string): boolean {
    if (form === 'SERVICE_LEVEL_BENCHMARKS') return SLB_UNAVAILABLE_BUCKET_KEYS.has(bucketKey);
    if (bucketKey === 'EXEMPTED') return EXEMPTION_UNAVAILABLE_FOR_FORMS.has(form);
    return false;
  }

  // The design year lives on the route as :yearId, a few levels up from this component's own route.
  private resolveDesignYearId(): string {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot) {
      const value = snapshot.paramMap.get('yearId')?.trim();
      if (value) return value;
      snapshot = snapshot.parent;
    }
    return (typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) : null) ?? '';
  }

  private resolveYearLabel(): string {
    const stored =
      typeof localStorage !== 'undefined' ? localStorage.getItem(XVIFC_LS_KEYS.selectedYearString) : null;
    return stored ? stored.replace(/^FY-/, 'FY ') : 'FY —';
  }

  private readStoredUser(): { adcName?: string | null; stateName?: string | null } {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? (JSON.parse(raw) as { adcName?: string | null; stateName?: string | null }) : {};
    } catch {
      return {};
    }
  }
}
