import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { FcUnspentDeclarationService } from '../../fc-unspent-declaration.service';
import { FcUnspentUlbOption } from '../../fc-unspent-declaration.models';
import { buildUlbOptionsCacheKey, FcUnspentUlbOptionsCacheService } from '../../fc-unspent-ulb-options-cache.service';

export interface UlbPickerDialogData {
  stateId: string;
  yearId: string;
  /** ulbIds already selected by other rows in the current session — disabled in the results list. */
  excludeUlbIds: string[];
  /** Backend-composed explanation of why the Devolution dependency is currently blocking something
   *  (`FcUnspentDevolutionDependency.blockingMessage`). Shown in place of the generic empty-state
   *  text whenever non-null — the same condition the parent page's own banner uses. */
  blockingMessage: string | null;
}

const ULB_PICKER_PAGE_SIZE = 20;

/**
 * Self-contained, backend-searched/paginated, multi-select ULB picker. Calls
 * `FcUnspentDeclarationService.getUlbOptions` itself (through the shared, feature-scoped
 * `FcUnspentUlbOptionsCacheService` when available) — never receives a pre-fetched options array —
 * so opening/closing this dialog is the only place that ever fetches a page of ULB options.
 *
 * Selection is explicit: checking a row (or the row itself) adds it to a running, order-preserving
 * selection that survives search/page changes and only closes the dialog when the State confirms via
 * "Add selected ULBs". The top-right close icon cancels and returns no selection.
 */
@Component({
  selector: 'app-ulb-picker-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './ulb-picker-dialog.component.html',
  styleUrl: './ulb-picker-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UlbPickerDialogComponent implements OnInit {
  private readonly service = inject(FcUnspentDeclarationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<UlbPickerDialogComponent, FcUnspentUlbOption[]>);
  /** Optional so the dialog degrades to an always-network call if ever opened without the parent
   *  page's shared injector (see `UnspentUlbTableComponent.openPicker`) — never a hard dependency. */
  private readonly cache = inject(FcUnspentUlbOptionsCacheService, { optional: true });
  private readonly amountDisplay = inject(AmountDisplayModeService);
  readonly data = inject<UlbPickerDialogData>(MAT_DIALOG_DATA);

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);

  readonly search = new FormControl('', { nonNullable: true });

  readonly options = signal<readonly FcUnspentUlbOption[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = ULB_PICKER_PAGE_SIZE;
  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isConfirming = signal(false);

  /** Order-preserving multi-selection, keyed by canonical `ulbId` — never by row index/object
   *  identity. Re-selecting a previously-deselected ULB appends it at the end, matching a `Map`'s
   *  natural delete-then-set insertion-order semantics. Persists across search/page/retry. */
  readonly selectedUlbs = signal<ReadonlyMap<string, FcUnspentUlbOption>>(new Map());
  readonly selectedCount = computed(() => this.selectedUlbs().size);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private readonly excludeSet = computed(() => new Set(this.data.excludeUlbIds));

  /** Monotonically increasing request id — guards against a stale page/search response landing
   *  after a newer one has already been requested (including a stale response served from cache). */
  private loadRequestId = 0;

  ngOnInit(): void {
    this.loadOptions();

    this.search.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(1);
        this.loadOptions();
      });
  }

  loadOptions(): void {
    const requestId = ++this.loadRequestId;
    this.isLoading.set(true);
    this.loadError.set(false);

    const normalizedSearch = this.search.value.trim().toLowerCase();
    const page = this.page();
    const key = buildUlbOptionsCacheKey({
      stateId: this.data.stateId,
      yearId: this.data.yearId,
      search: normalizedSearch,
      page,
      limit: this.limit,
    });
    const fetch = () =>
      this.service.getUlbOptions(this.data.stateId, this.data.yearId, {
        search: normalizedSearch || undefined,
        page,
        limit: this.limit,
      });

    (this.cache ? this.cache.getOrFetch(key, fetch) : fetch()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        if (requestId !== this.loadRequestId) return;
        this.options.set(result.options);
        this.total.set(result.total);
        this.isLoading.set(false);
      },
      error: () => {
        if (requestId !== this.loadRequestId) return;
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadOptions();
  }

  isExcluded(ulbId: string): boolean {
    return this.excludeSet().has(ulbId);
  }

  isSelected(ulbId: string): boolean {
    return this.selectedUlbs().has(ulbId);
  }

  /** Toggles a row's selection unless it's already present in the parent FormArray. No API call is
   *  ever triggered merely by checking/unchecking a box. */
  toggle(option: FcUnspentUlbOption): void {
    if (this.isExcluded(option.ulbId)) return;

    this.selectedUlbs.update((map) => {
      const next = new Map(map);
      if (next.has(option.ulbId)) {
        next.delete(option.ulbId);
      } else {
        next.set(option.ulbId, option);
      }
      return next;
    });
  }

  /** Clicking anywhere on a selectable row toggles it; a click that originated on the checkbox is
   *  ignored here since the checkbox's own `(change)` handler already toggled it — avoids a
   *  double-toggle that would cancel itself out. */
  onRowClick(option: FcUnspentUlbOption, event: Event): void {
    if (event.target instanceof HTMLInputElement) return;
    this.toggle(option);
  }

  confirm(): void {
    if (this.isConfirming() || this.selectedCount() === 0) return;
    this.isConfirming.set(true);
    this.dialogRef.close(Array.from(this.selectedUlbs().values()));
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
