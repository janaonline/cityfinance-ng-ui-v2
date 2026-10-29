import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, startWith, switchMap } from 'rxjs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { DecimalLimitDirective } from '../../../../../../core/directives/decimal-limit.directive';
import { ZeroOnStepChangeDirective } from '../../../../../../core/directives/zero-on-step-change.directive';
import { decimalPlacesValidator } from '../../../../../../core/validators/decimal-places.validator';
import { resolveThemeClass } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.component';
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
  /** Claimed-vs-allocated band from the backend. */
  readonly varianceLowerPercent = input.required<number>();
  readonly varianceUpperPercent = input.required<number>();

  /** Display data for ULBs picked this session; the only ulb-options data kept. */
  readonly pickedUlbByUlbId = signal<ReadonlyMap<string, ClaimLetterUlbOption>>(new Map());

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

    return this.rowValues().map((value) => {
      const saved = value.ulbId ? savedByUlbId.get(value.ulbId) : undefined;
      const picked = value.ulbId ? pickedByUlbId.get(value.ulbId) : undefined;

      const allocationAmount = saved?.allocationAmount ?? picked?.allocationAmount ?? null;
      const hasLiveInputs = allocationAmount !== null && allocationAmount > 0 && value.claimedAmount !== null;

      return {
        ulbName: saved?.ulbName ?? picked?.ulbName ?? null,
        censusCode: saved?.censusCode ?? picked?.censusCode ?? null,
        sbCode: saved?.sbCode ?? picked?.sbCode ?? null,
        allocationAmount,
        eligible: saved?.eligible ?? picked?.eligible ?? null,
        exemptionBadges: buildExemptionBadges(saved?.exemptionNotes ?? picked?.exemptionNotes),
        savedDifferencePercentage: saved?.differencePercentage ?? null,
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
   *  `validateRows()`'s concern. */
  readonly invalidRowIdentifiers = computed(() =>
    this.rowViewModels()
      .filter((row) => row.eligible === false || row.liveWithinVariance === false)
      .map((row) => row.censusCode ?? row.sbCode ?? row.ulbName ?? 'Unknown ULB'),
  );

  /** From the live rows, so they exist before any `financialSummary` (create mode). */
  readonly totalAllocation = computed(() =>
    this.rowViewModels().reduce((sum, row) => sum + (row.allocationAmount ?? 0), 0),
  );
  readonly totalClaim = computed(() => this.rowValues().reduce((sum, row) => sum + (row.claimedAmount ?? 0), 0));

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  /** Unit label for the read-only amount columns, which follow the global display mode. */
  readonly unitSuffix = () => this.amountDisplay.unitSuffix('inr');
  /** Info-icon tooltip on the claim-amount input: the whole-number rule and the value in words. */
  readonly wholeNumberInfoText = (value: number | null | undefined) => this.amountDisplay.wholeNumberInfoText(value);
  readonly claimedAmountErrorText = claimedAmountErrorText;

  /** Opens the picker to add one or more brand-new rows, in the order they were selected. */
  addRow(): void {
    if (!this.canEdit()) return;

    this.openPicker(this.currentUlbIds(), (options) => {
      for (const option of options) {
        this.rows().push(
          createClaimUlbRowGroup(this.canEdit(), { ulbId: option.ulbId, claimedAmount: option.allocationAmount }),
        );
      }
    });
  }

  removeRow(index: number): void {
    this.rows().removeAt(index);
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
    };

    const dialogRef = this.dialog.open(ClaimLetterUlbPickerDialogComponent, {
      panelClass,
      width: '65vw',
      maxWidth: '65vw',
      height: '80vh',
      maxHeight: '80vh',
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
