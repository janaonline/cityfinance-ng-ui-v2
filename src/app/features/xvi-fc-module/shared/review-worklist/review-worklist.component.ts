import { Component, computed, effect, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

export interface ReviewWorklistColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => string;
  /** When set, the cell renders as a pill badge with this class instead of plain text. */
  badgeClass?: (row: T) => string;
  /** When set, the column header gets a clickable mat-sort-header, sorted by this raw value. */
  sortValue?: (row: T) => string | number;
}

export interface ReviewWorklistBucket<T> {
  key: string;
  label: string;
  predicate: (row: T) => boolean;
}

/** Drives "server-driven" mode as one controlled object rather than several parallel inputs — see
 *  `ReviewWorklistComponent.serverPage`'s own doc comment. */
export interface ReviewWorklistServerPage {
  /** 0-based, matching `PageEvent.pageIndex` — pass the parent's own `page - 1`. */
  pageIndex: number;
  pageSize: number;
  /** Replaces the default `[10, 15, 25, 50]` choices — e.g. capped at a backend's own max page size
   *  so picking one can never request more than the server allows. */
  pageSizeOptions?: number[];
  /** Total row count across every page — `rows()` in this mode is only ever ≤ one page. */
  total: number;
}

const PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

/**
 * Generic cards+table review worklist, reused by every reviewer role's list page (PMU today, any
 * future role later) across every form — only the column/bucket config differs per form, never
 * this component's own code.
 */
@Component({
  selector: 'app-review-worklist',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatPaginatorModule, MatSortModule],
  templateUrl: './review-worklist.component.html',
  styleUrl: './review-worklist.component.scss',
})
export class ReviewWorklistComponent<T> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<ReviewWorklistColumn<T>[]>();
  readonly buckets = input<ReviewWorklistBucket<T>[]>([]);
  readonly reviewActionLabel = input('Review');
  readonly viewActionLabel = input('View');
  /** When omitted, every row is treated as actionable ("Review"/filled); when supplied, rows this
   *  returns false for show "View"/outlined instead — nothing further can be done on them. */
  readonly canActOn = input<((row: T) => boolean) | null>(null);
  /** When supplied, a row this returns false for renders its action button disabled — nothing to
   *  open at all (as opposed to `canActOn`, which only changes the label/style for an existing,
   *  openable row). Omitted default: every row stays clickable. */
  readonly canOpenRow = input<((row: T) => boolean) | null>(null);
  /** Heading rendered above the table, inside the same card, e.g. "SFC Status — All States". */
  readonly title = input<string | null>(null);
  /** Controlled bucket selection — pass this (and listen to `bucketSelected`) when some other
   *  control (e.g. a status dropdown) must stay in sync with the cards; omit for a page that only
   *  ever uses the cards themselves. */
  readonly activeBucketKeyInput = input<string | null>(null);
  /** When true, the table area shows a spinner instead of rows (e.g. while refetching after a
   *  filter change) — bucket cards and the paginator stay mounted throughout. */
  readonly isLoading = input(false);
  /** Sort applied until the user clicks a column header themselves — e.g. `{active: 'submittedOn',
   *  direction: 'desc'}` for "latest first" by default. Omit for no default sort (today's
   *  behavior). */
  readonly defaultSort = input<Sort | null>(null);
  /** When set, this component is "server-driven": `rows()` is already exactly one page's worth of
   *  data the parent fetched server-side (filtered/sorted/paginated on the backend), not this
   *  component's own full local dataset. In this mode `pagedRows()` returns `rows()` directly,
   *  `total()` and the paginator's index/size/options all come from this object instead of being
   *  owned internally, and sort/page interactions are re-emitted via `sortChange`/`pageChange` for
   *  the parent to refetch instead of being applied locally. Bucket cards are not supported
   *  alongside this mode — no caller uses both today. `null` (the default): today's fully
   *  local/uncontrolled behavior, unchanged. */
  readonly serverPage = input<ReviewWorklistServerPage | null>(null);

  readonly reviewClicked = output<T>();
  readonly bucketSelected = output<string>();
  /** Emitted instead of paginating locally when `serverPage` is set. */
  readonly pageChange = output<PageEvent>();
  /** Emitted instead of sorting locally when `serverPage` is set. */
  readonly sortChange = output<Sort>();

  private readonly internalBucketKey = signal<string | null>(null);
  private readonly internalPageIndex = signal(0);
  private readonly internalPageSize = signal(PAGE_SIZE);
  /** Controlled/uncontrolled, same shape as `activeBucketKey` below — `serverPage` wins when set. */
  readonly pageIndex = computed(() => this.serverPage()?.pageIndex ?? this.internalPageIndex());
  readonly pageSize = computed(() => this.serverPage()?.pageSize ?? this.internalPageSize());
  readonly pageSizeOptions = computed(() => this.serverPage()?.pageSizeOptions ?? PAGE_SIZE_OPTIONS);
  private readonly userSort = signal<Sort | null>(null);
  /** The caller's `defaultSort` applies until the user actually clicks a column header — same
   *  controlled-falls-back-to-default shape as `activeBucketKey` below. Tracked the same way
   *  regardless of mode, purely to drive the mat-sort header's active/direction display — with
   *  `serverPage` set, the actual re-sorting of data happens on the backend, not via
   *  `filteredRows()` below. */
  readonly sort = computed(() => this.userSort() ?? this.defaultSort());

  readonly displayedColumns = computed(() => [...this.columns().map((c) => c.key), 'action']);

  readonly bucketCounts = computed(() => {
    const rows = this.rows();
    const total = rows.length;
    return this.buckets().map((bucket) => {
      const count = rows.filter(bucket.predicate).length;
      return { ...bucket, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
  });

  /** The caller's `activeBucketKey` input wins when supplied (controlled mode); otherwise this
   *  component tracks its own clicks (uncontrolled mode) — same default-to-first-bucket fallback
   *  either way. */
  readonly activeBucketKey = computed(
    () => this.activeBucketKeyInput() ?? this.internalBucketKey() ?? this.buckets()[0]?.key ?? null,
  );

  private readonly bucketFilteredRows = computed(() => {
    const bucketKey = this.activeBucketKey();
    const bucket = this.buckets().find((b) => b.key === bucketKey);
    return bucket ? this.rows().filter(bucket.predicate) : this.rows();
  });

  readonly filteredRows = computed(() => {
    const sort = this.sort();
    const column = sort && sort.direction ? this.columns().find((c) => c.key === sort.active) : undefined;
    if (!column?.sortValue) return this.bucketFilteredRows();

    const direction = sort!.direction === 'asc' ? 1 : -1;
    return [...this.bucketFilteredRows()].sort((a, b) => {
      const va = column.sortValue!(a);
      const vb = column.sortValue!(b);
      return va < vb ? -direction : va > vb ? direction : 0;
    });
  });

  readonly total = computed(() => this.serverPage()?.total ?? this.filteredRows().length);

  readonly pagedRows = computed(() => {
    if (this.serverPage()) return this.rows();
    const start = this.pageIndex() * this.pageSize();
    return this.filteredRows().slice(start, start + this.pageSize());
  });

  constructor() {
    // Parent-level filters (state/form/status) changing the incoming `rows` shouldn't leave the
    // paginator stranded on a now out-of-range page. Skipped when `serverPage` is set: there,
    // `rows()` changes on *every* page navigation too (the parent hands over a new page each time),
    // not just on a filter change — resetting here would immediately snap back to page 0 after every
    // forward/back click. A `serverPage` parent resets via its own `pageIndex` instead, deliberately.
    effect(() => {
      this.rows();
      if (this.serverPage()) return;
      this.internalPageIndex.set(0);
    });
  }

  selectBucket(key: string): void {
    this.internalBucketKey.set(key);
    this.bucketSelected.emit(key);
    this.internalPageIndex.set(0);
  }

  onSortChange(sort: Sort): void {
    this.userSort.set(sort);
    this.internalPageIndex.set(0);
    if (this.serverPage()) this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.internalPageIndex.set(event.pageIndex);
    this.internalPageSize.set(event.pageSize);
    if (this.serverPage()) this.pageChange.emit(event);
  }

  actionLabelFor(row: T): string {
    const canAct = this.canActOn();
    return !canAct || canAct(row) ? this.reviewActionLabel() : this.viewActionLabel();
  }

  isActionableRow(row: T): boolean {
    const canAct = this.canActOn();
    return !canAct || canAct(row);
  }

  isOpenableRow(row: T): boolean {
    const canOpen = this.canOpenRow();
    return !canOpen || canOpen(row);
  }
}
