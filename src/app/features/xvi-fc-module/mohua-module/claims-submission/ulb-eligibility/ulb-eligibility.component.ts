import { DatePipe, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, combineLatest, debounceTime, filter, map, switchMap, tap } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../core/services/amount-display-mode.service';
import { AmountDisplayToggleComponent } from '../../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { findRouteParam } from '../../route-params.util';
import {
  ULB_ELIGIBILITY_LETTER_STATUSES,
  ULB_ELIGIBILITY_NO_ALLOCATION,
  ULB_ELIGIBILITY_NOT_IN_LETTER,
  ULB_ELIGIBILITY_PAGE_SIZE,
  UlbEligibility,
  UlbEligibilityBatch,
  UlbEligibilityFilter,
  UlbEligibilityRow,
  claimStatusBadgeClass,
  claimStatusLabel,
  formatOrdinal,
} from '../claims-submission.models';
import { ClaimsSubmissionService } from '../claims-submission.service';

const LOAD_ERROR = 'Could not load the claim eligibility. Please try again.';
const SEARCH_DEBOUNCE_MS = 300;
/** Letter amounts are in lakh, so this page defaults to lakh too. */
const AMOUNT_UNIT = 'lakh';

/** A letter status as one icon in its colour; the label is the tooltip. Draft (2) has no badge class of its own. */
const STATUS_ICON: Readonly<Record<string, string>> = {
  'cs-badge--good': 'bi-check-circle-fill ue-status--good',
  'cs-badge--bad': 'bi-arrow-return-left ue-status--bad',
  'cs-badge--review': 'bi-hourglass-split ue-status--review',
};
const DRAFT_STATUS = 2;
const DRAFT_ICON = 'bi-pencil-fill ue-status--draft';

/** Singular or plural for the summary: "1 ULB is" / "4 ULBs are". */
const ulbNoun = (n: number): string => (n === 1 ? 'ULB' : 'ULBs');
const isAre = (n: number): string => (n === 1 ? 'is' : 'are');

/** The page's filters, kept in the URL so a link can open it pre-filtered (e.g. `?batch=2`). */
interface Filters {
  search: string;
  eligibility: UlbEligibilityFilter | null;
  batch: string | null;
  letterStatus: number | null;
  condition: string | null;
  page: number;
}

type FilterKey = Exclude<keyof Filters, 'page'>;

/** The API's own limits (its query DTO): a link outside them would get a 400, so they are dropped or cut here. */
const BATCH_PATTERN = /^(NONE|[1-9]|10)$/;
const SEARCH_MAX_LENGTH = 100;
const CONDITION_MAX_LENGTH = 64;

function readFilters(q: ParamMap): Filters {
  const eligibility = q.get('eligibility');
  const letterStatus = Number(q.get('letterStatus'));
  const page = Number(q.get('page'));
  const batch = q.get('batch');
  return {
    search: (q.get('search') ?? '').slice(0, SEARCH_MAX_LENGTH),
    eligibility: eligibility === 'ELIGIBLE' || eligibility === 'INELIGIBLE' ? eligibility : null,
    batch: batch && BATCH_PATTERN.test(batch) ? batch : null,
    letterStatus: ULB_ELIGIBILITY_LETTER_STATUSES.some((s) => s.status === letterStatus) ? letterStatus : null,
    condition: q.get('condition')?.slice(0, CONDITION_MAX_LENGTH) || null,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/**
 * Every ULB of one State, live: the claim letter's condition columns, Eligible or Ineligible, and the letter holding
 * it. Read-only, the same for MoHUA and PMU. The API caches the condition check for 15 minutes; Refresh rebuilds it.
 */
@Component({
  selector: 'app-mohua-ulb-eligibility',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    AmountDisplayToggleComponent,
    MohuaPageLoaderComponent,
  ],
  templateUrl: './ulb-eligibility.component.html',
  styleUrl: './ulb-eligibility.component.scss',
})
export class UlbEligibilityComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ClaimsSubmissionService);
  private readonly amounts = inject(AmountDisplayModeService);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  /** Parent (MoHUA or PMU module) route; links are built from it. */
  readonly mohuaRoute = this.route.parent;
  readonly yearId = findRouteParam(this.route.snapshot, 'yearId');
  readonly letterStatuses = ULB_ELIGIBILITY_LETTER_STATUSES;
  readonly notInLetter = ULB_ELIGIBILITY_NOT_IN_LETTER;
  /** Read once on arrival: Back returns to the page the user came from, or to the State's letters when opened directly. */
  readonly cameFromApp = !!this.router.getCurrentNavigation()?.previousNavigation;

  readonly stateId = signal('');
  readonly filters = signal<Filters>(readFilters(this.route.snapshot.queryParamMap));
  /** What the search box shows; the URL catches up after the debounce. */
  readonly searchText = signal(this.filters().search);
  readonly data = signal<UlbEligibility | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly states = signal<{ stateId: string; name: string }[]>([]);

  readonly installmentLabel = computed(() => `${formatOrdinal(this.data()?.installment ?? 1)} installment`);
  readonly hasFilters = computed(() => {
    const f = this.filters();
    return !!(f.search || f.eligibility || f.batch || f.letterStatus !== null || f.condition);
  });
  /** The year after the design year starts: ULBs formed after 31 March of it are not part of XVI FC. */
  readonly cutoffYear = computed(() => Number(this.data()?.designYearLabel.split('-')[0]) + 1 || null);
  readonly conditionLabels = computed(() => new Map(this.data()?.conditions.map((c) => [c.key, c.label]) ?? []));

  /** Batch options with State-wide counts. A deep-linked batch with no ULBs still shows. */
  readonly batchOptions = computed(() => {
    const counts = this.data()?.counts;
    if (!counts) return [];
    const options = counts.batches.map((b) => ({
      value: String(b.batchNumber),
      label: `Batch ${b.batchNumber}`,
      count: b.count,
    }));
    const selected = this.filters().batch;
    if (selected && selected !== ULB_ELIGIBILITY_NOT_IN_LETTER && !options.some((o) => o.value === selected)) {
      options.push({ value: selected, label: `Batch ${selected}`, count: 0 });
    }
    return [...options, { value: ULB_ELIGIBILITY_NOT_IN_LETTER, label: 'Not in a letter', count: counts.notInLetter }];
  });

  readonly batchLabel = computed(
    () => this.batchOptions().find((o) => o.value === this.filters().batch)?.label ?? 'All',
  );
  readonly letterStatusLabel = computed(
    () => this.letterStatuses.find((s) => s.status === this.filters().letterStatus)?.label ?? 'All',
  );
  readonly conditionLabel = computed(() => {
    const key = this.filters().condition;
    return key ? (this.conditionLabels().get(key) ?? key) : 'All';
  });
  /** The State menu; just the current State if the list failed to load. */
  readonly stateOptions = computed(() => {
    const listed = this.states();
    const d = this.data();
    return listed.length ? listed : d ? [{ stateId: this.stateId(), name: d.stateName }] : [];
  });

  /** The State in one sentence and two bullets, always for the whole State (filters change only the table). */
  readonly summary = computed(() => {
    const c = this.data()?.counts;
    if (!c) return null;
    const lead = !c.ineligible
      ? `All ${c.total} ULBs are eligible.`
      : !c.eligible
        ? `None of the ${c.total} ULBs is eligible yet.`
        : `${c.eligible} of ${c.total} ULBs ${isAre(c.eligible)} eligible; ${c.ineligible} ${isAre(c.ineligible)} ineligible.`;
    const batches = c.batches.map((b) => `Batch ${b.batchNumber} (${b.count} ${ulbNoun(b.count)})`).join(', ');
    const bullets = [
      c.inLetter
        ? `${c.inLetter} ${ulbNoun(c.inLetter)} ${isAre(c.inLetter)} in claim letters: ${batches}.`
        : 'No ULB is in a claim letter yet.',
    ];
    if (c.eligible) {
      const n = c.eligibleNotInLetter;
      bullets.push(
        n
          ? `${n} eligible ${ulbNoun(n)} ${isAre(n)} not in any claim letter yet.`
          : 'Every eligible ULB is in a claim letter.',
      );
    }
    return { lead, bullets };
  });

  readonly letterStatusCounts = computed(
    () => new Map(this.data()?.counts.letterStatuses.map((s) => [s.status, s.count]) ?? []),
  );

  private readonly request$ = new Subject<boolean>();
  private readonly searchInput$ = new Subject<string>();

  constructor() {
    // One request at a time: a newer one cancels an older one still in flight. `true` rebuilds the cached check.
    this.request$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap((refresh) => {
          const f = this.filters();
          return this.service
            .getUlbEligibility(this.stateId(), this.yearId, {
              search: f.search.trim() || undefined,
              eligibility: f.eligibility ?? undefined,
              batch: f.batch ?? undefined,
              letterStatus: f.letterStatus ?? undefined,
              condition: f.condition ?? undefined,
              page: f.page,
              limit: ULB_ELIGIBILITY_PAGE_SIZE,
              refresh,
            })
            .pipe(
              catchError((err: unknown) => {
                this.error.set(err instanceof HttpErrorResponse ? (err.error?.message ?? LOAD_ERROR) : LOAD_ERROR);
                this.loading.set(false);
                return EMPTY;
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.data.set(data);
        this.loading.set(false);
      });

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, query]) => {
        // On a State change the router emits the new query params before the new State id; skip that mixed pair.
        if (params.get('stateId') !== this.route.snapshot.paramMap.get('stateId')) return;
        const stateId = params.get('stateId') ?? '';
        if (stateId !== this.stateId()) this.data.set(null);
        this.stateId.set(stateId);
        // The search box is not synced back from the URL: that would overwrite what the user is still typing.
        // It is set on load, and Reset and a State change clear it themselves.
        this.filters.set(readFilters(query));
        this.request$.next(false);
      });

    // Compared with the URL, not the last value typed, so the same word works again after a Reset.
    this.searchInput$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        map((search) => search.trim()),
        filter((search) => search !== this.filters().search),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search) => this.setFilter('search', search));

    this.service
      .getStates(this.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.states.set(result.states.map((s) => ({ stateId: s.stateId, name: s.name }))),
        // The dropdown then shows only the current State, from the page data.
        error: () => this.states.set([]),
      });
  }

  onSearch(value: string): void {
    this.searchText.set(value);
    this.searchInput$.next(value);
  }

  /** Any filter change goes back to page 1. Empty values leave the URL. */
  setFilter(key: FilterKey, value: string | number | null): void {
    this.navigate({ [key]: value === '' ? null : value, page: null });
  }

  resetFilters(): void {
    this.clearSearch();
    this.navigate({ search: null, eligibility: null, batch: null, letterStatus: null, condition: null, page: null });
  }

  goToPage(page: number): void {
    this.navigate({ page: page > 1 ? page : null });
  }

  refresh(): void {
    this.request$.next(true);
  }

  retry(): void {
    this.request$.next(false);
  }

  /** A new State starts with no filters, and replaces this history entry so Back still leaves the page. */
  changeState(stateId: string): void {
    if (stateId === this.stateId()) return;
    this.clearSearch();
    void this.router.navigate(['claims-submission', stateId, 'ulb-eligibility'], {
      relativeTo: this.mohuaRoute,
      replaceUrl: true,
    });
  }

  /** Empties the box and replaces any search still waiting on the debounce. */
  private clearSearch(): void {
    this.searchText.set('');
    this.searchInput$.next('');
  }

  goBack(): void {
    this.location.back();
  }

  /** Passed to the ULB page, so its breadcrumb can return here with the same filters. */
  currentUrl(): string {
    return this.router.url;
  }

  amount(value: number | null): string {
    return this.amounts.format(value, AMOUNT_UNIT);
  }

  exactAmount(value: number | null): string {
    return this.amounts.formatExact(value);
  }

  /** An amount column (14th FC unspent) follows the page's units, like Tied and Untied; 0 reads "Nil". */
  conditionText(row: UlbEligibilityRow, index: number): string {
    const value = row.amounts?.[index] ?? null;
    if (value === null) return row.cells[index];
    const figure = value > 0 ? this.amount(value) : 'Nil';
    return row.cells[index] ? `${figure} (${row.cells[index]})` : figure;
  }

  /** The letter's status as MoHUA's claims pages word it. */
  batchStatusLabel(batch: UlbEligibilityBatch): string {
    return claimStatusLabel(batch.status, batch.statusLabel);
  }

  batchStatusIcon(batch: UlbEligibilityBatch): string {
    return batch.status === DRAFT_STATUS
      ? DRAFT_ICON
      : (STATUS_ICON[claimStatusBadgeClass(batch.status)] ?? DRAFT_ICON);
  }

  /** Why a ULB is ineligible, for the badge's tooltip. */
  failedText(row: UlbEligibilityRow): string {
    if (row.eligible) return '';
    const labels = this.conditionLabels();
    return `Not met: ${row.failedConditions.map((key) => labels.get(key) ?? key).join(', ')}`;
  }

  isFailedCell(row: UlbEligibilityRow, columnKey: string): boolean {
    return row.failedConditions.includes(columnKey);
  }

  hasNoAllocation(row: UlbEligibilityRow): boolean {
    return row.failedConditions.includes(ULB_ELIGIBILITY_NO_ALLOCATION);
  }

  private navigate(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
