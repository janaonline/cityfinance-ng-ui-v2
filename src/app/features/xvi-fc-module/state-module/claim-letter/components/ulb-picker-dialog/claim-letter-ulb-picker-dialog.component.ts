import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { CLAIM_LETTER_MAX_ULBS, ClaimLetterInstallment, ClaimLetterUlbOption } from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { humanizeToken } from '../../claim-letter.utils';

export type ClaimLetterEligibilityFilter = 'ALL' | 'ELIGIBLE' | 'INELIGIBLE' | 'IN_OTHER_BATCH';

export interface ClaimLetterUlbPickerDialogData {
  stateId: string;
  yearId: string;
  installment: ClaimLetterInstallment;
  /** Already in this draft's table, so disabled even when eligible. */
  excludeUlbIds: string[];
  /** Lets this draft's own locked ULBs show as selectable; undefined in create mode. */
  claimLetterId?: string;
  /** The last batch slot: the picker notes the ULBs still in no batch, which block its submit. */
  isFinalBatch?: boolean;
}

const CLAIM_LETTER_ULB_PICKER_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 150;

const EMPTY_SEARCH_MESSAGE = 'No ULBs found for the current search.';
const EMPTY_FILTER_MESSAGES: Record<ClaimLetterEligibilityFilter, string> = {
  ALL: 'No ULBs found.',
  ELIGIBLE: 'No eligible ULBs.',
  INELIGIBLE: 'No ineligible ULBs.',
  IN_OTHER_BATCH: 'No ULBs are in another batch.',
};

/** Same rules as the backend's `eligibilityFilter`. */
function matchesFilter(option: ClaimLetterUlbOption, filter: ClaimLetterEligibilityFilter): boolean {
  if (filter === 'ELIGIBLE') return option.eligible;
  if (filter === 'INELIGIBLE') return !option.eligible && !option.claimedInBatch;
  if (filter === 'IN_OTHER_BATCH') return option.claimedInBatch !== null;
  return true;
}

const ulbsAre = (n: number) => (n === 1 ? 'ULB is' : 'ULBs are');

/** Same rule as the backend's search: a case-insensitive substring of name, Census Code or SB Code. */
function matchesSearch(option: ClaimLetterUlbOption, lowerTerm: string): boolean {
  return [option.ulbName, option.censusCode, option.sbCode].some((v) => !!v && v.toLowerCase().includes(lowerTerm));
}

/** Multi-select picker over every ULB of the State, loaded in one call (at most `CLAIM_LETTER_MAX_ULBS`)
 *  and then searched, filtered, paged and selected locally, so "select all" counts are exact. */
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
  private readonly amountDisplay = inject(AmountDisplayModeService);
  readonly data = inject<ClaimLetterUlbPickerDialogData>(MAT_DIALOG_DATA);

  readonly search = new FormControl('', { nonNullable: true });
  /** Trimmed and debounced, so typing does not refilter on every key. */
  readonly searchTerm = toSignal(
    this.search.valueChanges.pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      map((value) => value.trim()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );
  readonly eligibilityFilter = signal<ClaimLetterEligibilityFilter>('ALL');

  /** Every ULB, in the backend's order: eligible, ineligible, in another batch, each A-Z. */
  readonly allOptions = signal<readonly ClaimLetterUlbOption[]>([]);
  /** The State has more ULBs than one load returns. */
  readonly loadedOfTotal = signal<{ loaded: number; total: number } | null>(null);
  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isConfirming = signal(false);

  readonly filtered = computed(() => {
    const lowerTerm = this.searchTerm().toLowerCase();
    const filter = this.eligibilityFilter();
    return this.allOptions().filter((o) => matchesFilter(o, filter) && (!lowerTerm || matchesSearch(o, lowerTerm)));
  });
  readonly emptyMessage = computed(() =>
    this.searchTerm() ? EMPTY_SEARCH_MESSAGE : EMPTY_FILTER_MESSAGES[this.eligibilityFilter()],
  );

  readonly limit = CLAIM_LETTER_ULB_PICKER_PAGE_SIZE;
  /** Back to page 1 whenever the search or filter changes. */
  readonly page = linkedSignal({
    source: () => [this.searchTerm(), this.eligibilityFilter()],
    computation: () => 1,
  });
  readonly total = computed(() => this.filtered().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly pageRows = computed(() => this.filtered().slice((this.page() - 1) * this.limit, this.page() * this.limit));

  /** Keeps selection order, and survives search, page and filter changes. */
  readonly selectedUlbs = signal<ReadonlyMap<string, ClaimLetterUlbOption>>(new Map());
  readonly selectedCount = computed(() => this.selectedUlbs().size);
  readonly selectedTotalAmount = computed(() => {
    let sum = 0;
    for (const option of this.selectedUlbs().values()) sum += option.allocationAmount ?? 0;
    return sum;
  });
  /** Eligible today only through an exemption MoHUA has not decided yet; Submit asks about these. */
  readonly selectedUnderReviewCount = computed(() => {
    let count = 0;
    for (const option of this.selectedUlbs().values()) {
      if (option.exemptionNotes?.some((n) => n.status === 'UNDER_REVIEW')) count++;
    }
    return count;
  });

  private readonly excludeSet = new Set(this.data.excludeUlbIds);
  readonly selectableInView = computed(() => this.filtered().filter((o) => this.isSelectable(o)));
  readonly selectableOnPage = computed(() => this.pageRows().filter((o) => this.isSelectable(o)));

  /** The header checkbox: how many of this page's selectable rows are ticked. */
  readonly pageSelection = computed<'none' | 'some' | 'all'>(() => {
    const rows = this.selectableOnPage();
    const selected = this.selectedUlbs();
    const ticked = rows.filter((o) => selected.has(o.ulbId)).length;
    if (ticked === 0) return 'none';
    return ticked === rows.length ? 'all' : 'some';
  });
  /** The bar under the toolbar: offers every selectable row in view once the page is ticked, then
   *  confirms it. Hidden when the view fits on this page. */
  readonly selectAllBar = computed<'offer' | 'done' | null>(() => {
    const inView = this.selectableInView();
    if (this.pageSelection() !== 'all' || inView.length <= this.selectableOnPage().length) return null;
    const selected = this.selectedUlbs();
    return inView.every((o) => selected.has(o.ulbId)) ? 'done' : 'offer';
  });

  /** Final batch only: the ULBs still in no batch, which keep it from being submitted. ULBs ticked
   *  here count as added, since confirming adds them. */
  readonly finalBatchNote = computed<string | null>(() => {
    if (!this.data.isFinalBatch) return null;
    const selected = this.selectedUlbs();
    let eligibleNotAdded = 0;
    let ineligibleInNoBatch = 0;
    for (const option of this.allOptions()) {
      if (this.isExcluded(option.ulbId) || selected.has(option.ulbId)) continue;
      if (option.eligible) eligibleNotAdded++;
      else if (!option.claimedInBatch) ineligibleInNoBatch++;
    }
    const parts: string[] = [];
    if (eligibleNotAdded) parts.push(`${eligibleNotAdded} eligible ${ulbsAre(eligibleNotAdded)} not yet added`);
    if (ineligibleInNoBatch)
      parts.push(`${ineligibleInNoBatch} ineligible ${ulbsAre(ineligibleInNoBatch)} in no batch`);
    if (!parts.length) return null;
    return `This is the final batch. It can be submitted only when every ULB is in a batch: ${parts.join(', and ')}.`;
  });

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatTotal = (value: number | null | undefined) => this.amountDisplay.format(value, 'auto');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  readonly humanizeToken = humanizeToken;

  /** Last row ticked or unticked; a shift-click applies the same change to every row in between on
   *  this page. A new page, search or filter drops it, so a range never reaches rows not in view. */
  private readonly anchorUlbId = linkedSignal<unknown, string | null>({
    source: () => [this.page(), this.searchTerm(), this.eligibilityFilter()],
    computation: () => null,
  });

  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions(): void {
    this.isLoading.set(true);
    this.loadError.set(false);

    this.service
      .getUlbOptions(this.data.stateId, this.data.yearId, this.data.installment, {
        claimLetterId: this.data.claimLetterId,
        page: 1,
        limit: CLAIM_LETTER_MAX_ULBS,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.allOptions.set(result.options);
          this.loadedOfTotal.set(
            result.total > result.options.length ? { loaded: result.options.length, total: result.total } : null,
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.loadError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  setEligibilityFilter(filter: ClaimLetterEligibilityFilter): void {
    this.eligibilityFilter.set(filter);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
  }

  /** Eligible and not already in this draft's table. */
  isSelectable(option: ClaimLetterUlbOption): boolean {
    return option.eligible && !this.excludeSet.has(option.ulbId);
  }

  isDisabled(option: ClaimLetterUlbOption): boolean {
    return !this.isSelectable(option);
  }

  isExcluded(ulbId: string): boolean {
    return this.excludeSet.has(ulbId);
  }

  isSelected(ulbId: string): boolean {
    return this.selectedUlbs().has(ulbId);
  }

  claimedBadgeText(option: ClaimLetterUlbOption): string {
    return `In ${this.claimedBatchName(option)}`;
  }

  claimedTooltip(option: ClaimLetterUlbOption): string {
    const batchNumber = option.claimedInBatch?.batchNumber;
    return batchNumber ? `Already in Claim Batch #${batchNumber}` : 'Already in another claim batch';
  }

  checkboxLabel(option: ClaimLetterUlbOption): string {
    if (option.claimedInBatch) return `${option.ulbName} is already in ${this.claimedBatchName(option)}`;
    return this.isDisabled(option) ? `${option.ulbName} cannot be selected` : `Select ${option.ulbName}`;
  }

  /** "Batch #1", or "another batch" when the backend could not read it. */
  private claimedBatchName(option: ClaimLetterUlbOption): string {
    const batchNumber = option.claimedInBatch?.batchNumber;
    return batchNumber ? `Batch #${batchNumber}` : 'another batch';
  }

  /** With `range`, every selectable row between the anchor and this one (on this page) takes this
   *  row's new state; otherwise only this row flips. */
  toggle(option: ClaimLetterUlbOption, range = false): void {
    if (!this.isSelectable(option)) return;
    const select = !this.isSelected(option.ulbId);

    let targets = [option];
    const anchor = this.anchorUlbId();
    if (range && anchor) {
      const rows = this.pageRows();
      const from = rows.findIndex((o) => o.ulbId === anchor);
      const to = rows.findIndex((o) => o.ulbId === option.ulbId);
      if (from !== -1 && to !== -1) {
        targets = rows.slice(Math.min(from, to), Math.max(from, to) + 1).filter((o) => this.isSelectable(o));
      }
    }

    this.setSelected(targets, select);
    this.anchorUlbId.set(option.ulbId);
  }

  /** Keeps a shift-click from selecting the page text between the anchor and this row; a plain
   *  drag still selects text, so names and codes can be copied. */
  onRowMouseDown(event: MouseEvent): void {
    if (event.shiftKey) event.preventDefault();
  }

  onCheckboxClick(option: ClaimLetterUlbOption, event: MouseEvent): void {
    this.toggle(option, event.shiftKey);
  }

  /** Ignores clicks on the checkbox, whose own click handler already toggled the row. */
  onRowClick(option: ClaimLetterUlbOption, event: MouseEvent): void {
    if (event.target instanceof HTMLInputElement) return;
    this.toggle(option, event.shiftKey);
  }

  /** Header checkbox: ticks this page's selectable rows, or unticks them when all are ticked. */
  togglePage(): void {
    this.setSelected(this.selectableOnPage(), this.pageSelection() !== 'all');
  }

  /** Every selectable row matching the current search and filter, across all pages. */
  selectAllInView(): void {
    this.setSelected(this.selectableInView(), true);
  }

  /** The bar's "Clear these N": unticks only the rows matching the current search and filter, so
   *  picks made under another search stay. */
  clearInView(): void {
    this.setSelected(this.selectableInView(), false);
    this.anchorUlbId.set(null);
  }

  /** The footer's "Clear all". */
  clearSelection(): void {
    this.selectedUlbs.set(new Map());
    this.anchorUlbId.set(null);
  }

  confirm(): void {
    if (this.isConfirming() || this.selectedCount() === 0) return;
    this.isConfirming.set(true);
    this.dialogRef.close(Array.from(this.selectedUlbs().values()));
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  /** One signal write for the whole set, so ticking hundreds of rows recomputes once. */
  private setSelected(options: readonly ClaimLetterUlbOption[], select: boolean): void {
    this.selectedUlbs.update((current) => {
      const next = new Map(current);
      for (const option of options) {
        if (select) next.set(option.ulbId, option);
        else next.delete(option.ulbId);
      }
      return next;
    });
  }
}
