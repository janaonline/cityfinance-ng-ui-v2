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
import { MATERIAL_THEME_CLASS } from '../../../../../../core/theming/material-theme.providers';
import { CLAIM_LETTER_INSTALLMENT, ClaimLetterUlbOption, ClaimLetterUlbRow } from '../../claim-letter.models';
import { computeClaimDifferencePercentage, formatCrore, isClaimWithinVariance } from '../../claim-letter.utils';
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
  /** Server-known, from the picked option's/saved row's own eligibility gate re-verification —
   *  never re-derived client-side. */
  eligible: boolean | null;
  /** Server-known difference, populated only once this row has actually been saved (a picked-but-
   *  unsaved row has no such value yet) — see `liveDifferencePercentage` for the typing-time preview. */
  savedDifferencePercentage: number | null;
  /** Always-live ±10% preview, recomputed on every keystroke from the current `claimedAmount` value —
   *  a client preview only; the backend remains authoritative at save time. */
  liveDifferencePercentage: number | null;
  liveWithinVariance: boolean | null;
}

/** No backend `rowEditFields`-style metadata exists for claim-letter rows (unlike FC Unspent) — the
 *  DTO validation is just `ulbId: MongoId`, `claimedAmount: number, min(0.01)`, so this builds each
 *  row with plain Validators instead of the shared `DynamicFormService`/backend-field-config route. */
export function createClaimUlbRowGroup(
  canEdit: boolean,
  existingRow?: { ulbId: string | null; claimedAmount: number | null },
): ClaimUlbRowGroup {
  const group = new FormGroup<ClaimUlbRowForm>({
    ulbId: new FormControl<string | null>(existingRow?.ulbId ?? null, { validators: [Validators.required] }),
    claimedAmount: new FormControl<number | null>(existingRow?.claimedAmount ?? null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  if (!canEdit) group.disable({ emitEvent: false });

  return group;
}

function claimedAmountErrorText(control: AbstractControl): string | null {
  if (!control.touched || !control.errors) return null;
  if (control.errors['required']) return 'Claim amount is required.';
  if (control.errors['min']) return 'Claim amount must be greater than 0.';
  return null;
}

@Component({
  selector: 'app-claim-ulb-table',
  imports: [ReactiveFormsModule, DecimalPipe, MatButtonModule, MatTooltipModule],
  templateUrl: './claim-ulb-table.component.html',
  styleUrl: './claim-ulb-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimUlbTableComponent {
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  /** Passed through to `MatDialog.open` so the picker resolves against this component's own
   *  injector rather than the root one — kept for parity with FC Unspent's table even though the
   *  claim-letter picker has no feature-scoped cache service to resolve today. */
  private readonly injector = inject(Injector);

  readonly rows = input.required<FormArray<ClaimUlbRowGroup>>();
  /** Backend-supplied snapshot of already-saved rows (from `GET :claimLetterId/ulbs`) — already
   *  server-computed (`differencePercentage`/`eligible` re-verified at read time). Saved rows render
   *  from this directly; it must never require a ULB-options request. */
  readonly savedRows = input<readonly ClaimLetterUlbRow[]>([]);
  readonly canEdit = input(false);
  readonly stateId = input.required<string>();
  readonly yearId = input.required<string>();
  /** Forwarded to the picker so a draft's own already-locked ULBs show as selectable. `undefined` in
   *  create mode (no id yet). */
  readonly claimLetterId = input<string | undefined>(undefined);

  /** Display data for ULBs picked via the dialog this session — the only ULB-options data ever kept
   *  locally, and only for rows a user actually chose. */
  readonly pickedUlbByUlbId = signal<ReadonlyMap<string, ClaimLetterUlbOption>>(new Map());

  /** Bridges the FormArray's own `valueChanges` into a signal, including structural push/removeAt
   *  changes — a raw FormArray reference isn't itself change-detection-reactive. `getRawValue()` (not
   *  `.value`) is used for the initial snapshot so a disabled (read-only) row's value is still read. */
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
        savedDifferencePercentage: saved?.differencePercentage ?? null,
        liveDifferencePercentage: hasLiveInputs
          ? computeClaimDifferencePercentage(allocationAmount as number, value.claimedAmount as number)
          : null,
        liveWithinVariance: hasLiveInputs
          ? isClaimWithinVariance(allocationAmount as number, value.claimedAmount as number)
          : null,
      };
    });
  });

  /** Rows we can already say, with certainty, will be rejected server-side — mirrors the backend's
   *  own `buildChildren()` validation (ineligible or outside the ±10% band). Rows with not-yet-known
   *  state (`null`) are excluded here; that's `validateRows()`'s required-field concern, not this one. */
  readonly invalidRowIdentifiers = computed(() =>
    this.rowViewModels()
      .filter((row) => row.eligible === false || row.liveWithinVariance === false)
      .map((row) => row.censusCode ?? row.sbCode ?? row.ulbName ?? 'Unknown ULB'),
  );

  /** Client-computed running totals — always available from the live FormArray, independent of
   *  whether a real `financialSummary` exists yet on the backend (create mode has none). */
  readonly totalAllocation = computed(() =>
    this.rowViewModels().reduce((sum, row) => sum + (row.allocationAmount ?? 0), 0),
  );
  readonly totalClaim = computed(() => this.rowValues().reduce((sum, row) => sum + (row.claimedAmount ?? 0), 0));

  readonly formatCrore = formatCrore;
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

      // Defensive recheck — never apply a selection that duplicates a row that changed elsewhere
      // while the picker was open, and never apply the same ulbId twice from one confirmed batch.
      // Backend duplicate validation remains authoritative regardless.
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

      // The dialog closes asynchronously, off a native event inside its own template rather than
      // this component's — force a recheck so the (possibly first-ever) row actually renders.
      this.cdr.markForCheck();
    });
  }
}
