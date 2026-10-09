import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, Subject, catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { formatCrore, StateStatus } from '../overview/overview.models';
import { findRouteParam } from '../route-params.util';
import { MohuaStateDetailService } from './mohua-state-detail.service';
import { MohuaStateUlbsService } from './mohua-state-ulbs.service';
import { StateDetailData, StateUlbRow, UlbSortField } from './state-detail.models';
import { CountUpDirective, RevealDirective } from './state-detail.directives';
import { IconMotion, StatItem, Tone } from './state-detail.types';

const PAGE_SIZE = 15;
const ULB_COLUMNS = ['name', 'census', 'allocation', 'electedBody', 'audited', 'unaudited', 'pfms', 'slb', 'dur'];
const SEARCH_DEBOUNCE_MS = 300;
const LOAD_ERROR = 'Could not load this state. Please try again.';
const ULBS_ERROR = 'Could not load the ULBs. Please try again.';
const COMING_SOON = 'Coming soon';

/** Route segments (after review-state-submissions/:stateId) of the read-only form screens, keyed by the API's form keys. */
const CONDITION_VIEW_ROUTE: Record<string, string[]> = {
  SFC_STATUS: ['sfc-status'],
  ELECTED_BODIES: ['elected-body'],
  DEVOLUTION: ['devolution-formula', '1'],
  FC_UNSPENT: ['fc-unspent'],
  GTC: ['gtc', '1'],
};

const STAGE_LABEL: Record<StateStatus, string> = {
  review: 'Under Review by MoHUA',
  progress: 'In Progress',
  notStarted: 'Not Started',
};

const STAGE_TONE: Record<StateStatus, Tone> = { review: 'orange', progress: 'teal', notStarted: 'grey' };

/** Icons keyed by the API's form keys. */
const CONDITION_ICON: Record<string, string> = {
  SFC_STATUS: 'bi-bank',
  ELECTED_BODIES: 'bi-people',
  DEVOLUTION: 'bi-diagram-3',
  FC_UNSPENT: 'bi-wallet2',
  GTC: 'bi-file-earmark-check',
};

const ULB_FORM_ICON: Record<string, string> = {
  AUDITED: 'bi-file-earmark-text',
  UNAUDITED: 'bi-clipboard-check',
  PFMS: 'bi-bank',
  SLB: 'bi-speedometer2',
  DUR: 'bi-file-earmark-bar-graph',
};

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
    MatSortModule,
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
  private readonly service = inject(MohuaStateDetailService);
  private readonly ulbsService = inject(MohuaStateUlbsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Parent (MoHUA module) route — links are built from it, so they never depend on how many URL segments this route has. */
  readonly mohuaRoute = this.route.parent;

  readonly data = signal<StateDetailData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly stateName = computed(() => this.data()?.state.name ?? '');
  readonly stageLabel = computed(() => STAGE_LABEL[this.data()?.state.status ?? 'notStarted']);
  readonly stageTone = computed(() => STAGE_TONE[this.data()?.state.status ?? 'notStarted']);

  /** Claim figures are not available yet; the cards stay in place and say so. */
  readonly stats = computed<StatItem[]>(() => {
    const data = this.data();
    if (!data) return [];
    const soon = (label: string, icon: string, tone: Tone, motion: IconMotion): StatItem => ({
      value: COMING_SOON,
      label,
      note: '',
      icon,
      tone,
      motion,
    });
    return [
      {
        value: formatCrore(data.allocation),
        label: 'Annual Allocation',
        note: '',
        icon: 'bi-bank',
        tone: 'teal',
        motion: 'grow',
      },
      {
        value: formatCrore(null),
        label: 'Eligible Amount',
        note: '',
        icon: 'bi-check-circle',
        tone: 'teal',
        motion: 'pop',
      },
      soon('Under Review by MoHUA', 'bi-hourglass-split', 'orange', 'flip'),
      soon('Returned by MoHUA', 'bi-arrow-return-left', 'bad', 'back'),
      soon('Approved by MoHUA', 'bi-shield-check', 'good', 'pop'),
      soon('Recommended to DoE', 'bi-send', 'good', 'fly'),
    ];
  });

  /** Each condition form with its icon and, when MoHUA may open it, the link to its read-only screen. */
  readonly conditions = computed(() => {
    const data = this.data();
    if (!data) return [];
    return data.forms.map((form) => ({
      ...form,
      icon: CONDITION_ICON[form.key] ?? 'bi-file-earmark',
      viewLink:
        form.canView && CONDITION_VIEW_ROUTE[form.key]
          ? ['review-state-submissions', data.state.id, ...CONDITION_VIEW_ROUTE[form.key]]
          : null,
    }));
  });

  readonly ulbForms = computed(() => {
    const forms = this.data()?.ulbForms;
    if (!forms) return [];
    return forms.items.map((form) => ({
      ...form,
      icon: ULB_FORM_ICON[form.key] ?? 'bi-file-earmark',
      percent: forms.totalUlbs ? Math.round((form.completed / forms.totalUlbs) * 100) : 0,
    }));
  });

  // ── ULB-wise progress (server-side search, sort and pages) ───────────────────
  readonly ulbs = signal<StateUlbRow[]>([]);
  readonly ulbTotal = signal(0);
  readonly ulbsLoading = signal(true);
  readonly ulbsError = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly page = signal(1);
  readonly sortActive = signal<UlbSortField>('ulbName');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly pageSize = PAGE_SIZE;
  readonly ulbColumns = ULB_COLUMNS;
  /** The five form columns of the ULB table; `def` is also the key of the row's `forms`. */
  readonly formColumns: { def: 'audited' | 'unaudited' | 'pfms' | 'slb' | 'dur'; label: string }[] = [
    { def: 'audited', label: 'Audited' },
    { def: 'unaudited', label: 'Provisional' },
    { def: 'pfms', label: 'PFMS' },
    { def: 'slb', label: 'SLB' },
    { def: 'dur', label: 'DUR' },
  ];

  /** Every change to search, sort or page asks the API again; switchMap drops a request a newer one overtakes. */
  private readonly ulbRequest$ = new Subject<void>();
  private readonly searchInput$ = new Subject<string>();
  private ulbIds: { stateId: string; yearId: string } | null = null;

  readonly formatCrore = formatCrore;

  constructor() {
    this.ulbIds = this.resolveIds();

    this.ulbRequest$
      .pipe(
        tap(() => {
          this.ulbsLoading.set(true);
          this.ulbsError.set(null);
        }),
        switchMap(() =>
          this.ulbsService
            .getUlbs(this.ulbIds!.stateId, this.ulbIds!.yearId, {
              page: this.page(),
              limit: PAGE_SIZE,
              search: this.searchTerm(),
              sortBy: this.sortActive(),
              sortDir: this.sortDirection(),
            })
            .pipe(
              catchError((err: unknown) => {
                this.ulbsError.set(err instanceof HttpErrorResponse ? (err.error?.message ?? ULBS_ERROR) : ULBS_ERROR);
                this.ulbsLoading.set(false);
                return EMPTY;
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        this.ulbs.set(result.items);
        this.ulbTotal.set(result.pagination.total);
        this.page.set(result.pagination.page);
        this.ulbsLoading.set(false);
      });

    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.page.set(1);
        this.ulbRequest$.next();
      });

    this.load();
    this.loadUlbs();
  }

  load(): void {
    const ids = this.ulbIds;
    if (!ids) {
      this.loading.set(false);
      this.error.set('Select a financial year to view this state.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.service
      .getDetail(ids.stateId, ids.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(err instanceof HttpErrorResponse ? (err.error?.message ?? LOAD_ERROR) : LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  loadUlbs(): void {
    if (this.ulbIds) this.ulbRequest$.next();
    else {
      this.ulbsLoading.set(false);
      this.ulbsError.set('Select a financial year to view this state.');
    }
  }

  onSearch(event: Event): void {
    this.searchInput$.next((event.target as HTMLInputElement).value);
  }

  /** Clearing a sort (third click) falls back to the default: ULB name ascending. */
  onSort(sort: Sort): void {
    const active: UlbSortField = sort.active === 'allocation' && sort.direction ? 'allocation' : 'ulbName';
    this.sortActive.set(active);
    this.sortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
    this.page.set(1);
    this.ulbRequest$.next();
  }

  onPage(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.ulbRequest$.next();
  }

  private resolveIds(): { stateId: string; yearId: string } | null {
    const stateId = findRouteParam(this.route.snapshot, 'stateId');
    const yearId = findRouteParam(this.route.snapshot, 'yearId') || this.readStoredYearId();
    return stateId && yearId ? { stateId, yearId } : null;
  }

  private readStoredYearId(): string {
    try {
      return localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) ?? '';
    } catch {
      return '';
    }
  }
}
