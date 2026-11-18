import {
  DestroyRef,
  Directive,
  OnChanges,
  OnInit,
  SimpleChanges,
  WritableSignal,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { IPage } from '../../../shared/adc/adc.service';
import { ADC_DEFAULT_PAGE_SIZE, ADC_PAGE_SIZE_OPTIONS } from '../../../shared/adc/adc-paging.constants';

/** Every tab's filter form has a free-text `search`; its other controls are selects. */
export type AdcTableFilterControls = { search: FormControl<string> };

/**
 * Paging, sorting, debounced search, filters and loading state shared by the ADC detail page's tabs. A subclass
 * supplies its filter form, sort columns and the API call. Filters live in the component, not the URL.
 */
@Directive()
export abstract class AdcPagedTable<
  TRow,
  TSort extends string,
  TControls extends AdcTableFilterControls & { [K in keyof TControls]: AbstractControl },
>
  implements OnInit, OnChanges
{
  protected readonly destroyRef = inject(DestroyRef);

  readonly adcId = input.required<string>();
  /** Changing it reloads the current page, keeping the filters (e.g. after the Admin changed). */
  readonly refreshKey = input(0);

  readonly pageSizeOptions = ADC_PAGE_SIZE_OPTIONS;
  readonly rows = signal<TRow[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(ADC_DEFAULT_PAGE_SIZE);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  abstract readonly filterForm: FormGroup<TControls>;
  protected abstract readonly sortColumns: readonly TSort[];
  abstract readonly sortBy: WritableSignal<TSort>;
  readonly sortDir = signal<1 | -1>(1);
  readonly matSortDirection = computed(() => (this.sortDir() === 1 ? 'asc' : 'desc'));

  private readonly filterValues = signal<Record<string, unknown>>({});
  readonly hasFilters = computed(() =>
    Object.values(this.filterValues()).some((value) => typeof value === 'string' && !!value.trim()),
  );

  protected abstract fetch(page: number, limit: number): Observable<IPage<TRow>>;
  protected abstract readonly errorMessage: string;

  ngOnInit(): void {
    this.filterValues.set(this.filterForm.getRawValue());
    this.load();

    this.filterForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterValues.set(this.filterForm.getRawValue()));
    this.filterForm.controls.search.valueChanges
      .pipe(
        map((text) => text.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.applyFilters());
    for (const [name, control] of Object.entries(this.filterForm.controls)) {
      if (name === 'search') continue;
      control.valueChanges
        .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.applyFilters());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey'] && !changes['refreshKey'].firstChange) this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.fetch(this.page(), this.pageSize())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.rows.set(result.data);
          this.total.set(result.total);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set(this.errorMessage);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.pageSize.set(event.pageSize);
    this.load();
  }

  onSortChange(sort: Sort): void {
    const column = this.sortColumns.includes(sort.active as TSort) ? (sort.active as TSort) : this.sortColumns[0];
    this.sortBy.set(column);
    this.sortDir.set(sort.direction === 'desc' ? -1 : 1);
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    // One reload, not one per control.
    this.filterForm.reset(undefined, { emitEvent: false });
    this.filterValues.set(this.filterForm.getRawValue());
    this.applyFilters();
  }

  /** The search text, trimmed, or undefined when empty. */
  protected searchText(): string | undefined {
    return this.filterForm.controls.search.value.trim() || undefined;
  }

  private applyFilters(): void {
    this.page.set(1);
    this.load();
  }
}
