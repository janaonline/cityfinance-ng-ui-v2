import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ClaimLetterInstallment, ClaimLetterUlbOption } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { formatCrore, humanizeToken } from '../../claim-letter.utils';

export type ClaimLetterEligibilityFilter = 'ALL' | 'ELIGIBLE' | 'INELIGIBLE';

export interface ClaimLetterUlbPickerDialogData {
  stateId: string;
  yearId: string;
  installment: ClaimLetterInstallment;
  /** ulbIds already added to the current draft's table — disabled here even if the server reports
   *  them as eligible, since a ULB can't be selected twice in the same claim. */
  excludeUlbIds: string[];
  /** Forwarded as the `claimLetterId` query param so this draft's own already-locked ULBs show as
   *  normal/selectable rather than "locked elsewhere". `undefined` in create mode (no id yet). */
  claimLetterId?: string;
}

const CLAIM_LETTER_ULB_PICKER_PAGE_SIZE = 20;

/**
 * Self-contained, backend-searched/paginated, multi-select ULB picker — near-verbatim mirror of
 * FC Unspent's `UlbPickerDialogComponent`, with two differences the backend contract requires:
 * rows carry a real, server-computed `eligible`/`ineligibleReasonCode` (not just a same-session
 * exclusion list), and an `eligibilityFilter` toggle maps to the `ulb-options` query param.
 */
@Component({
  selector: 'app-claim-letter-ulb-picker-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatTooltipModule],
  templateUrl: './claim-letter-ulb-picker-dialog.component.html',
  styleUrl: './claim-letter-ulb-picker-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterUlbPickerDialogComponent implements OnInit {
  private readonly service = inject(ClaimLetterService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<ClaimLetterUlbPickerDialogComponent, ClaimLetterUlbOption[]>);
  readonly data = inject<ClaimLetterUlbPickerDialogData>(MAT_DIALOG_DATA);

  readonly search = new FormControl('', { nonNullable: true });

  readonly options = signal<readonly ClaimLetterUlbOption[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = CLAIM_LETTER_ULB_PICKER_PAGE_SIZE;
  readonly eligibilityFilter = signal<ClaimLetterEligibilityFilter>('ALL');
  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isConfirming = signal(false);

  /** Order-preserving multi-selection, keyed by canonical `ulbId`. Persists across search/page/filter
   *  changes and retries, same as FC Unspent's picker. */
  readonly selectedUlbs = signal<ReadonlyMap<string, ClaimLetterUlbOption>>(new Map());
  readonly selectedCount = computed(() => this.selectedUlbs().size);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private readonly excludeSet = computed(() => new Set(this.data.excludeUlbIds));

  readonly formatCrore = formatCrore;
  readonly humanizeToken = humanizeToken;

  /** Monotonically increasing request id — guards against a stale page/search/filter response
   *  landing after a newer one has already been requested. */
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

    const normalizedSearch = this.search.value.trim();
    const filter = this.eligibilityFilter();

    this.service
      .getUlbOptions(this.data.stateId, this.data.yearId, this.data.installment, {
        search: normalizedSearch || undefined,
        eligibilityFilter: filter === 'ALL' ? undefined : filter,
        claimLetterId: this.data.claimLetterId,
        page: this.page(),
        limit: this.limit,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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

  setEligibilityFilter(filter: ClaimLetterEligibilityFilter): void {
    if (this.eligibilityFilter() === filter) return;
    this.eligibilityFilter.set(filter);
    this.page.set(1);
    this.loadOptions();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadOptions();
  }

  /** True when a row can never be selected here — either already added to this draft's table
   *  (session-local) or server-ineligible for this installment. */
  isDisabled(option: ClaimLetterUlbOption): boolean {
    return this.excludeSet().has(option.ulbId) || !option.eligible;
  }

  isExcluded(ulbId: string): boolean {
    return this.excludeSet().has(ulbId);
  }

  isSelected(ulbId: string): boolean {
    return this.selectedUlbs().has(ulbId);
  }

  toggle(option: ClaimLetterUlbOption): void {
    if (this.isDisabled(option)) return;

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

  /** A click that originated on the checkbox is ignored here since the checkbox's own `(change)`
   *  handler already toggled it — avoids a double-toggle that would cancel itself out. */
  onRowClick(option: ClaimLetterUlbOption, event: Event): void {
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
