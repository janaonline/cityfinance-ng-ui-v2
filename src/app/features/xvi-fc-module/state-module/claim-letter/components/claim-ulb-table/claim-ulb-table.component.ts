import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Injector,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, startWith, switchMap } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { DecimalLimitDirective } from '../../../../../../core/directives/decimal-limit.directive';
import { ZeroOnStepChangeDirective } from '../../../../../../core/directives/zero-on-step-change.directive';
import { decimalPlacesValidator } from '../../../../../../core/validators/decimal-places.validator';
import {
  resolveThemeClass,
  themedDialogConfig,
} from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { InfoIconComponent } from '../../../../../../shared/components/info-icon/info-icon.component';
import { CLAIM_LETTER_INSTALLMENT, ClaimLetterUlbOption, ClaimLetterUlbRow } from '../../claim-letter.models';
import {
  ClaimLetterExemptionBadge,
  buildExemptionBadges,
  computeClaimDifferencePercentage,
  isClaimWithinVariance,
} from '../../claim-letter.utils';
import {
  ClaimLetterUlbPickerDialogComponent,
  ClaimLetterUlbPickerDialogData,
} from '../ulb-picker-dialog/claim-letter-ulb-picker-dialog.component';

export interface ClaimUlbRowForm {
  ulbId: FormControl<string | null>;
  claimedAmount: FormControl<number | null>;
}

export type ClaimUlbRowGroup = FormGroup<ClaimUlbRowForm>;

/** Rows per table page; a batch can hold hundreds of ULBs. */
const CLAIM_ULB_TABLE_PAGE_SIZE = 50;

/** One collator for every comparison; `localeCompare` with options builds one per call. */
const ULB_NAME_COLLATOR = new Intl.Collator(undefined, { sensitivity: 'base' });

/** A-Z by ULB name, unnamed rows last. */
function compareUlbNames(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return ULB_NAME_COLLATOR.compare(a, b);
}

/** Name, Census Code and SB Code of one row: what the A-Z order and the search read. */
type ClaimUlbRowSearchFields = readonly [string | null, string | null, string | null];

function sameSearchFields(a: readonly ClaimUlbRowSearchFields[], b: readonly ClaimUlbRowSearchFields[]): boolean {
  return a.length === b.length && a.every((row, i) => row[0] === b[i][0] && row[1] === b[i][1] && row[2] === b[i][2]);
}

/** Why the last save refused a row, by field. Kept off the controls, whose set errors a re-render
 *  drops (see the detail page). */
export interface ClaimRowRejection {
  ulbId?: string;
  /** Shown only while the amount is still the one that was sent. */
  claimedAmount?: { message: string; sentAmount: number | null };
}

interface ClaimUlbRowValue {
  ulbId: string | null;
  claimedAmount: number | null;
}

interface ClaimUlbRowViewModel {
  ulbName: string | null;
  censusCode: string | null;
  sbCode: string | null;
  allocationAmount: number | null;
  /** From the saved row or picked option; never re-derived here. */
  eligible: boolean | null;
  exemptionBadges: ClaimLetterExemptionBadge[];
  /** Saved rows only; `liveDifferencePercentage` is the typing-time preview. */
  savedDifferencePercentage: number | null;
  /** Recomputed on every keystroke; the backend decides at save. */
  liveDifferencePercentage: number | null;
  liveWithinVariance: boolean | null;
}

/** Plain validators: claim-letter rows have no backend field config (unlike FC Unspent's). */
export function createClaimUlbRowGroup(
  canEdit: boolean,
  existingRow?: { ulbId: string | null; claimedAmount: number | null },
): ClaimUlbRowGroup {
  const group = new FormGroup<ClaimUlbRowForm>({
    ulbId: new FormControl<string | null>(existingRow?.ulbId ?? null, { validators: [Validators.required] }),
    claimedAmount: new FormControl<number | null>(existingRow?.claimedAmount ?? null, {
      validators: [Validators.required, Validators.min(1), decimalPlacesValidator(0)],
    }),
  });

  if (!canEdit) group.disable({ emitEvent: false });

  // A server apiErrors entry clears as soon as the user edits that control.
  for (const control of Object.values(group.controls)) {
    control.valueChanges.subscribe(() => {
      if (!control.errors?.['apiErrors']) return;
      const remaining = { ...control.errors };
      delete remaining['apiErrors'];
      control.setErrors(Object.keys(remaining).length > 0 ? remaining : null);
    });
  }

  return group;
}

/** A backend `apiErrors` entry wins over the local messages. */
function claimedAmountErrorText(control: AbstractControl): string | null {
  if (!control.touched || !control.errors) return null;
  const apiErrors = control.errors['apiErrors'];
  if (Array.isArray(apiErrors) && apiErrors.length > 0) return (apiErrors as string[]).join(' ');
  if (control.errors['required']) return 'Claim amount is required.';
  if (control.errors['decimal']) return 'Claim amount must be a whole number (no decimals).';
  if (control.errors['min']) return 'Claim amount must be at least ₹1.';
  return null;
}

@Component({
  selector: 'app-claim-ulb-table',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatButtonModule,
    MatTooltipModule,
    InfoIconComponent,
    DecimalLimitDirective,
    ZeroOnStepChangeDirective,
  ],
  templateUrl: './claim-ulb-table.component.html',
  styleUrl: './claim-ulb-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimUlbTableComponent {
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly dialogConfig = themedDialogConfig();
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  private readonly themeClass = resolveThemeClass();
  /** Gives the picker this component's injector; kept like FC Unspent's table, though nothing needs it yet. */
  private readonly injector = inject(Injector);

  readonly rows = input.required<FormArray<ClaimUlbRowGroup>>();
  /** Saved rows from `GET :claimLetterId/ulbs`; they render without a ulb-options request. */
  readonly savedRows = input<readonly ClaimLetterUlbRow[]>([]);
  readonly canEdit = input(false);
  readonly stateId = input.required<string>();
  readonly yearId = input.required<string>();
  /** Forwarded to the picker so a draft's own already-locked ULBs show as selectable. `undefined` in
   *  create mode (no id yet). */
  readonly claimLetterId = input<string | undefined>(undefined);
  /** formjson 26 switch from the backend. Off: each claim is its allocation, so the claim and
   *  difference columns are hidden and the `claimedAmount` controls are ignored. */
  readonly claimAmountEditable = input(false);
  /** Claimed-vs-allocated band from the backend; used only while `claimAmountEditable` is on. */
  readonly varianceLowerPercent = input.required<number>();
  readonly varianceUpperPercent = input.required<number>();
  /** The last batch slot; passed to the picker, which then notes the ULBs still in no batch. */
  readonly isFinalBatch = input(false);
  /** Rows the last save refused, by ULB id: a refused ULB shows "Not accepted", a refused amount its
   *  message. */
  readonly rejectedRows = input<ReadonlyMap<string, ClaimRowRejection>>(new Map());
  /** A save is in flight: the rows it sent must not change under it, so adding and removing wait.
   *  Separate from `canEdit`, which also decides whether the row controls are disabled. */
  readonly locked = input(false);
  /** ULB ids taken out by the user (Remove or Remove all), so the page can forget their refusals. */
  readonly ulbsRemoved = output<string[]>();

  /** Data for ULBs re-picked since `savedRows` last changed. Takes priority over saved data and can be reset because rows are rebuilt from `savedRows`. */
  readonly pickedUlbByUlbId = linkedSignal<readonly ClaimLetterUlbRow[], ReadonlyMap<string, ClaimLetterUlbOption>>({
    source: this.savedRows,
    computation: () => new Map(),
  });

  /** `rows` as a signal, structural changes included; the first value uses `getRawValue()` so
   *  disabled (read-only) rows are read too. */
  private readonly rowValues = toSignal(
    toObservable(this.rows).pipe(
      switchMap((formArray) => formArray.valueChanges.pipe(startWith(formArray.getRawValue()))),
      map((values): ClaimUlbRowValue[] =>
        values.map((value) => ({ ulbId: value.ulbId ?? null, claimedAmount: value.claimedAmount ?? null })),
      ),
    ),
    { initialValue: [] as ClaimUlbRowValue[] },
  );

  private readonly savedRowsByUlbId = computed(() => new Map(this.savedRows().map((row) => [row.ulbId, row])));

  readonly currentUlbIds = computed(() =>
    this.rowValues()
      .map((value) => value.ulbId)
      .filter((ulbId): ulbId is string => !!ulbId),
  );

  readonly rowViewModels = computed<ClaimUlbRowViewModel[]>(() => {
    const savedByUlbId = this.savedRowsByUlbId();
    const pickedByUlbId = this.pickedUlbByUlbId();
    const claimAmountEditable = this.claimAmountEditable();

    return this.rowValues().map((value) => {
      const saved = value.ulbId ? savedByUlbId.get(value.ulbId) : undefined;
      const picked = value.ulbId ? pickedByUlbId.get(value.ulbId) : undefined;

      const allocationAmount = picked?.allocationAmount ?? saved?.allocationAmount ?? null;
      const hasLiveInputs =
        claimAmountEditable && allocationAmount !== null && allocationAmount > 0 && value.claimedAmount !== null;

      return {
        ulbName: picked?.ulbName ?? saved?.ulbName ?? null,
        censusCode: picked?.censusCode ?? saved?.censusCode ?? null,
        sbCode: picked?.sbCode ?? saved?.sbCode ?? null,
        allocationAmount,
        eligible: picked?.eligible ?? saved?.eligible ?? null,
        exemptionBadges: buildExemptionBadges(picked?.exemptionNotes ?? saved?.exemptionNotes),
        savedDifferencePercentage: claimAmountEditable ? (saved?.differencePercentage ?? null) : null,
        liveDifferencePercentage: hasLiveInputs
          ? computeClaimDifferencePercentage(allocationAmount as number, value.claimedAmount as number)
          : null,
        liveWithinVariance: hasLiveInputs
          ? isClaimWithinVariance(
              allocationAmount as number,
              value.claimedAmount as number,
              this.varianceLowerPercent(),
              this.varianceUpperPercent(),
            )
          : null,
      };
    });
  });

  /** Rows the backend will surely reject (ineligible, or outside the band); incomplete rows are
   *  `validateRows()`'s concern. `liveWithinVariance` is null while the switch is off. */
  readonly invalidRowIdentifiers = computed(() =>
    this.rowViewModels()
      .filter((row) => row.eligible === false || row.liveWithinVariance === false)
      .map((row) => row.censusCode ?? row.sbCode ?? row.ulbName ?? 'Unknown ULB'),
  );

  /** Rows known to be ineligible from saved or picked data; the page offers to remove them. */
  readonly ineligibleUlbIds = computed(() => {
    const viewModels = this.rowViewModels();
    return this.rowValues().flatMap((value, i) =>
      value.ulbId && viewModels[i].eligible === false ? [value.ulbId] : [],
    );
  });

  /** Matches ULB name, Census Code or SB Code. */
  readonly tableSearch = signal('');
  /** Equal across claim-amount edits, so a keystroke neither re-sorts nor re-searches the rows. */
  private readonly rowSearchFields = computed(
    () => this.rowViewModels().map((vm): ClaimUlbRowSearchFields => [vm.ulbName, vm.censusCode, vm.sbCode]),
    { equal: sameSearchFields },
  );
  /** Row indexes A-Z by ULB name. The FormArray keeps the picked order, so the payload is unaffected. */
  private readonly sortedIndexes = computed(() => {
    const fields = this.rowSearchFields();
    return fields.map((_, i) => i).sort((a, b) => compareUlbNames(fields[a][0], fields[b][0]) || a - b);
  });
  /** Row indexes in display order: the search over the A-Z order. */
  readonly displayIndexes = computed(() => {
    const term = this.tableSearch().trim().toLowerCase();
    if (!term) return this.sortedIndexes();
    const fields = this.rowSearchFields();
    return this.sortedIndexes().filter((i) => fields[i].some((v) => !!v && v.toLowerCase().includes(term)));
  });
  /** Back to page 1 on a new search. */
  readonly tablePage = linkedSignal({ source: this.tableSearch, computation: () => 1 });
  readonly tablePageCount = computed(() =>
    Math.max(1, Math.ceil(this.displayIndexes().length / CLAIM_ULB_TABLE_PAGE_SIZE)),
  );
  /** Clamped, so removing the last row of the last page shows the page before it. */
  readonly currentTablePage = computed(() => Math.min(this.tablePage(), this.tablePageCount()));
  readonly visibleRows = computed(() => {
    const start = (this.currentTablePage() - 1) * CLAIM_ULB_TABLE_PAGE_SIZE;
    const controls = this.rows().controls;
    const viewModels = this.rowViewModels();
    return this.displayIndexes()
      .slice(start, start + CLAIM_ULB_TABLE_PAGE_SIZE)
      .map((index, i) => ({ index, position: start + i + 1, row: controls[index], vm: viewModels[index] }));
  });
  /** "Showing 1-50 of 640"; the total is the search's matches. */
  readonly rangeLabel = computed(() => {
    const total = this.displayIndexes().length;
    if (total === 0) return 'Showing 0 of 0';
    const start = (this.currentTablePage() - 1) * CLAIM_ULB_TABLE_PAGE_SIZE;
    return `Showing ${start + 1}-${Math.min(start + CLAIM_ULB_TABLE_PAGE_SIZE, total)} of ${total}`;
  });
  /** The footer total covers every row, which is not obvious while a search or paging hides some. */
  readonly isPartialView = computed(() => !!this.tableSearch().trim() || this.tablePageCount() > 1);

  /** From the live rows, so they exist before any `financialSummary` (create mode). */
  readonly totalAllocation = computed(() =>
    this.rowViewModels().reduce((sum, row) => sum + (row.allocationAmount ?? 0), 0),
  );
  /** The allocation total while the switch is off, since that is what the server stores. */
  readonly totalClaim = computed(() =>
    this.claimAmountEditable()
      ? this.rowValues().reduce((sum, row) => sum + (row.claimedAmount ?? 0), 0)
      : this.totalAllocation(),
  );

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  /** Unit label for the read-only amount columns, which follow the global display mode. */
  readonly unitSuffix = () => this.amountDisplay.unitSuffix('inr');
  /** Info-icon tooltip on the claim-amount input: the whole-number rule and the value in words. */
  readonly wholeNumberInfoText = (value: number | null | undefined) => this.amountDisplay.wholeNumberInfoText(value);
  /** The control's own message, else the last save's refusal while the amount is still the one sent. */
  amountErrorText(control: FormControl<number | null>, rejection: ClaimRowRejection | undefined): string | null {
    const own = claimedAmountErrorText(control);
    if (own) return own;
    const refused = rejection?.claimedAmount;
    return refused && control.value === refused.sentAmount ? refused.message : null;
  }

  /** Opens the picker to add one or more brand-new rows, in the order they were selected. */
  addRow(): void {
    if (!this.canEdit() || this.locked()) return;

    this.openPicker(this.currentUlbIds(), (options) => {
      const rows = this.rows();
      // One valueChanges for the whole pick, not one per row: a pick can hold hundreds.
      for (const option of options) {
        rows.push(
          createClaimUlbRowGroup(this.canEdit(), { ulbId: option.ulbId, claimedAmount: option.allocationAmount }),
          { emitEvent: false },
        );
      }
      rows.updateValueAndValidity();
    });
  }

  removeRow(index: number): void {
    if (this.locked()) return;
    const ulbId = this.rows().at(index).controls.ulbId.value;
    this.rows().removeAt(index);
    if (ulbId) this.ulbsRemoved.emit([ulbId]);
  }

  /** Confirms, then empties the table; nothing is saved until the page saves. */
  removeAll(): void {
    const count = this.rows().length;
    if (!this.canEdit() || this.locked() || count === 0) return;

    this.confirmDialogService
      .confirm(
        {
          title: 'Remove all ULBs?',
          message: `All ${count} ${count === 1 ? 'ULB' : 'ULBs'} will be removed from the table. Nothing is saved until you save.`,
          confirmText: 'Remove all',
          cancelText: 'Cancel',
          confirmButtonColor: 'warn',
          icon: 'bi-trash',
        },
        this.dialogConfig,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed || this.locked()) return;
        const ulbIds = this.currentUlbIds();
        this.rows().clear();
        this.tableSearch.set('');
        this.ulbsRemoved.emit(ulbIds);
        this.cdr.markForCheck();
      });
  }

  onTableSearch(event: Event): void {
    this.tableSearch.set((event.target as HTMLInputElement).value);
  }

  goToTablePage(page: number): void {
    if (page < 1 || page > this.tablePageCount()) return;
    this.tablePage.set(page);
  }

  /** Lets an ancestor request a re-render after mutating a row control's touched/errors state from
   *  outside this OnPush view's own template (e.g. a submit-time validation pass). */
  refreshValidationDisplay(): void {
    this.cdr.markForCheck();
  }

  private openPicker(excludeUlbIds: string[], applySelections: (options: ClaimLetterUlbOption[]) => void): void {
    const panelClass = [...(this.themeClass ? [this.themeClass] : []), 'claim-letter-ulb-picker-dialog-panel'];
    const data: ClaimLetterUlbPickerDialogData = {
      stateId: this.stateId(),
      yearId: this.yearId(),
      installment: CLAIM_LETTER_INSTALLMENT,
      excludeUlbIds,
      claimLetterId: this.claimLetterId(),
      isFinalBatch: this.isFinalBatch(),
    };

    const dialogRef = this.dialog.open(ClaimLetterUlbPickerDialogComponent, {
      panelClass,
      width: '90vw',
      maxWidth: '1100px',
      height: '85vh',
      maxHeight: '850px',
      injector: this.injector,
      data,
    });

    dialogRef.afterClosed().subscribe((options: ClaimLetterUlbOption[] | undefined) => {
      if (!options || options.length === 0) return;

      // Skip ULBs added while the picker was open and repeats within one selection.
      const currentIds = new Set(this.currentUlbIds());
      const seen = new Set<string>();
      const uniqueNewOptions = options.filter((option) => {
        if (currentIds.has(option.ulbId) || seen.has(option.ulbId)) return false;
        seen.add(option.ulbId);
        return true;
      });
      if (uniqueNewOptions.length === 0) return;

      this.pickedUlbByUlbId.update((map) => {
        const next = new Map(map);
        for (const option of uniqueNewOptions) next.set(option.ulbId, option);
        return next;
      });

      applySelections(uniqueNewOptions);

      // The dialog closes outside this OnPush view's events, so the new rows need a recheck.
      this.cdr.markForCheck();
    });
  }
}
