import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { ClaimLetterInstallment, ClaimLetterUlbOption } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { humanizeToken } from '../../claim-letter.utils';

export type ClaimLetterEligibilityFilter = 'ALL' | 'ELIGIBLE' | 'INELIGIBLE';

export interface ClaimLetterUlbPickerDialogData {
  stateId: string;
  yearId: string;
  installment: ClaimLetterInstallment;
  /** Already in this draft's table, so disabled even when eligible. */
  excludeUlbIds: string[];
  /** Lets this draft's own locked ULBs show as selectable; undefined in create mode. */
  claimLetterId?: string;
}

const CLAIM_LETTER_ULB_PICKER_PAGE_SIZE = 20;

/** Server-searched, paged, multi-select picker, like FC Unspent's plus server eligibility and a filter. */
@Component({
  selector: 'app-claim-letter-ulb-picker-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatButtonToggleModule, MatTooltipModule],
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

  /** Keeps selection order, and survives search, page and filter changes. */
  readonly selectedUlbs = signal<ReadonlyMap<string, ClaimLetterUlbOption>>(new Map());
  readonly selectedCount = computed(() => this.selectedUlbs().size);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());

  private readonly excludeSet = computed(() => new Set(this.data.excludeUlbIds));
  private readonly amountDisplay = inject(AmountDisplayModeService);

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  readonly humanizeToken = humanizeToken;

  /** Drops a response that arrives after a newer request was made. */
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

  /** Already in this draft's table, or ineligible. */
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

  /** Ignores clicks on the checkbox, whose own `(change)` already toggled the row. */
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
