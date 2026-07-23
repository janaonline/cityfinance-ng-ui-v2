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
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map, startWith, switchMap } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../../../core/theming/material-theme.providers';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import { FcUnspentUlbData, FcUnspentUlbOption } from '../../fc-unspent-declaration.models';
import { UlbPickerDialogComponent, UlbPickerDialogData } from '../ulb-picker-dialog/ulb-picker-dialog.component';

export interface FcUnspentUlbRowForm {
  ulbId: FormControl<string | null>;
  unspentAmount: FormControl<number | null>;
}

export type FcUnspentUlbRowGroup = FormGroup<FcUnspentUlbRowForm>;

interface FcUnspentUlbRowValue {
  ulbId: string | null;
  unspentAmount: number | null;
}

interface FcUnspentUlbRowViewModel {
  ulbName: string | null;
  censusCode: string | null;
  sbCode: string | null;
  allocationAmount: number | null;
  allocationPerc: number | null;
  eligible: boolean | null;
}

/** Resolves the single message to show for a control's current errors — a backend `apiErrors`
 *  entry always wins (it's the most specific/authoritative), otherwise the first validator in
 *  `field.validations` whose name matches one of the control's current Angular error keys. Driven
 *  entirely by the field config actually used to build the control, so the tooltip text can never
 *  drift from whatever validator actually fired. */
function firstControlErrorText(control: AbstractControl, field: ConditionalFieldConfig): string | null {
  const errors = control.errors;
  if (!errors) return null;

  const apiErrors = errors['apiErrors'];
  if (Array.isArray(apiErrors) && apiErrors.length > 0) return (apiErrors as string[]).join(' ');

  for (const validation of field.validations ?? []) {
    if (errors[validation.name]) return validation.message;
  }

  return null;
}

/** The backend's GET response (`rowEditFields`) is the sole source of truth for `ulbId`/
 *  `unspentAmount` field config — no client-side fallback. A missing entry means
 *  `FC_UNSPENT_ROW_EDIT_FIELDS` doesn't define one of the two mandatory row fields, which is a
 *  backend/config bug that should surface loudly here rather than be silently papered over. */
function requireRowFieldConfig(
  rowEditFields: readonly ConditionalFieldConfig[],
  key: 'ulbId' | 'unspentAmount',
): ConditionalFieldConfig {
  const field = rowEditFields.find((f) => f.key === key);
  if (!field) {
    throw new Error(`FC Unspent Declaration: rowEditFields is missing the '${key}' field config.`);
  }
  return field;
}

/**
 * Builds one editable ULB row via the shared `DynamicFormService.createContorl`, so validator and
 * readonly setup stays consistent with the rest of the page. Exported so both the parent (initial
 * hydration) and this component's own picker-driven add flow share one factory. `rowEditFields` is
 * the backend-supplied field config for `ulbId`/`unspentAmount` (DB-driven `required`/`min`/`max`/
 * etc.), looked up by `key` — every validator is built generically via `bindValidations` inside
 * `createContorl`, so a new validator added to the backend config is picked up automatically;
 * nothing here hardcodes which validator names exist.
 */
export function createFcUnspentUlbRowGroup(
  dynamicService: DynamicFormService,
  canEdit: boolean,
  rowEditFields: readonly ConditionalFieldConfig[],
  existingRow?: { ulbId: string | null; unspentAmount: number | null },
): FcUnspentUlbRowGroup {
  const readonly = !canEdit;

  const ulbIdConfig = requireRowFieldConfig(rowEditFields, 'ulbId');
  const unspentAmountConfig = requireRowFieldConfig(rowEditFields, 'unspentAmount');

  const ulbIdField = { ...ulbIdConfig, value: existingRow?.ulbId ?? null, readonly };
  const unspentAmountField = { ...unspentAmountConfig, value: existingRow?.unspentAmount ?? null, readonly };

  const group = new FormGroup<FcUnspentUlbRowForm>({
    ulbId: dynamicService.createContorl(ulbIdField, false, ulbIdField.readonly) as FormControl<string | null>,
    unspentAmount: dynamicService.createContorl(unspentAmountField, false, unspentAmountField.readonly) as FormControl<
      number | null
    >,
  });

  // Clear a server-injected `apiErrors` entry as soon as the user edits that control — mirrors
  // EulbPostUpdateEditFormFacade's clearStaleApiErrors, applied per-row here since each row is its
  // own short-lived FormGroup rather than one shared edit-session form.
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

@Component({
  selector: 'app-unspent-ulb-table',
  imports: [ReactiveFormsModule, DecimalPipe, MatButtonModule, MatTooltipModule],
  templateUrl: './unspent-ulb-table.component.html',
  styleUrl: './unspent-ulb-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnspentUlbTableComponent {
  private readonly dynamicService = inject(DynamicFormService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  /** Passed through to `MatDialog.open` so the picker resolves the same feature-scoped
   *  `FcUnspentUlbOptionsCacheService` instance provided on `FcUnspentDeclarationComponent` — by
   *  default a dialog is created against the root injector, not this component's own. */
  private readonly injector = inject(Injector);

  readonly rows = input.required<FormArray<FcUnspentUlbRowGroup>>();
  /** Backend-supplied snapshot of already-saved rows (ulbName/censusCode/sbCode/allocationAmount).
   *  Saved rows render from this directly — it must never require a ULB-options request. */
  readonly savedRows = input<readonly FcUnspentUlbData[]>([]);
  readonly canEdit = input(false);
  readonly applicableFcLabel = input.required<string>();
  /** Frontend eligibility preview threshold, sourced from the backend — never hardcoded here. */
  readonly threshold = input.required<number>();
  readonly stateId = input.required<string>();
  readonly yearId = input.required<string>();
  /** Backend-supplied field metadata for the ulbId/unspentAmount controls (DB-driven
   *  validators/messages) — passed through to `createFcUnspentUlbRowGroup` for every row this
   *  component builds itself (picker-driven add/replace flows). Required, not defaulted — this
   *  component never falls back to a hardcoded field config of its own. */
  readonly rowEditFields = input.required<readonly ConditionalFieldConfig[]>();
  /** Backend-composed explanation of why the Devolution dependency is currently blocking something
   *  (see `FcUnspentDevolutionDependency.blockingMessage`) — passed through to the ULB picker so its
   *  empty state can explain *why* no ULBs are available, instead of implying a search issue. */
  readonly blockingMessage = input<string | null>(null);

  /** Display data (name/codes/allocation) for ULBs actually picked via the dialog this session —
   *  the only ULB-options data ever cached locally, and only for rows a user chose. A fetched
   *  picker page is never retained beyond the selection the user made from it. */
  readonly pickedUlbByUlbId = signal<ReadonlyMap<string, FcUnspentUlbOption>>(new Map());

  /** Bridges the FormArray's own `valueChanges` into a signal — a raw FormArray reference isn't itself
   *  change-detection-reactive, and this also fires on structural `push`/`removeAt` changes. */
  private readonly rowValues = toSignal(
    toObservable(this.rows).pipe(
      switchMap((formArray) => formArray.valueChanges.pipe(startWith(formArray.value))),
      map((values): FcUnspentUlbRowValue[] =>
        values.map((value) => ({ ulbId: value.ulbId ?? null, unspentAmount: value.unspentAmount ?? null })),
      ),
    ),
    { initialValue: [] as FcUnspentUlbRowValue[] },
  );

  private readonly savedRowsByUlbId = computed(() => new Map(this.savedRows().map((row) => [row.ulbId, row])));

  private readonly currentUlbIds = computed(() =>
    this.rowValues()
      .map((value) => value.ulbId)
      .filter((ulbId): ulbId is string => !!ulbId),
  );

  /**
   * Per-row display view-model. Resolves ULB name/codes/allocation from the row's own saved snapshot
   * first (no picker request needed at all for an already-saved row), falling back to the locally
   * cached picker selection only for a row the user just picked/changed in this session. The
   * percentage/eligibility preview is feedback only — the backend calculation remains authoritative,
   * and these values are never written back into the row's editable controls.
   */
  readonly rowViewModels = computed<FcUnspentUlbRowViewModel[]>(() => {
    const savedByUlbId = this.savedRowsByUlbId();
    const pickedByUlbId = this.pickedUlbByUlbId();
    const threshold = this.threshold();

    return this.rowValues().map((value) => {
      const saved = value.ulbId ? savedByUlbId.get(value.ulbId) : undefined;
      const picked = value.ulbId ? pickedByUlbId.get(value.ulbId) : undefined;

      const ulbName = saved?.ulbName ?? picked?.ulbName ?? null;
      const censusCode = saved?.censusCode ?? picked?.censusCode ?? null;
      const sbCode = saved?.sbCode ?? picked?.sbCode ?? null;
      const allocationAmount = saved?.allocationAmount ?? picked?.allocationAmount ?? null;

      const allocationPerc =
        allocationAmount !== null && allocationAmount > 0 && value.unspentAmount !== null && value.unspentAmount > 0
          ? (value.unspentAmount / allocationAmount) * 100
          : null;

      return {
        ulbName,
        censusCode,
        sbCode,
        allocationAmount,
        allocationPerc,
        eligible: allocationPerc !== null ? allocationPerc <= threshold : null,
      };
    });
  });

  /** Opens the picker to add one or more brand-new rows, in the order they were selected. */
  addRow(): void {
    if (!this.canEdit()) return;

    this.openPicker(this.currentUlbIds(), (options) => {
      for (const option of options) {
        this.rows().push(
          createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit(), this.rowEditFields(), {
            ulbId: option.ulbId,
            unspentAmount: null,
          }),
        );
      }
    });
  }

  removeRow(index: number): void {
    this.rows().removeAt(index);
  }

  /**
   * Error text for the hover icon next to a row's ULB/amount cell — shown only once the control
   * has been marked touched, matching `FcUnspentDeclarationComponent.isUnspentUlbDataValidForSubmitType`,
   * which only touches a control when its current error actually blocks the attempted save/submit
   * (e.g. a bare `required` on an untouched draft row is never touched, so never shown here either).
   */
  rowFieldErrorText(row: FcUnspentUlbRowGroup, field: 'ulbId' | 'unspentAmount'): string | null {
    const control = row.controls[field];
    if (!control.touched) return null;

    return firstControlErrorText(control, requireRowFieldConfig(this.rowEditFields(), field));
  }

  /**
   * Lets an ancestor request a re-render after mutating a row control's touched/errors state from
   * outside this OnPush view's own template — e.g. `FcUnspentDeclarationComponent`'s submit-time
   * validation pass or an applied API error. `markAsTouched()`/`setErrors()` don't themselves emit
   * `valueChanges`/`statusChanges`, so nothing here would otherwise pick the mutation up.
   */
  refreshValidationDisplay(): void {
    this.cdr.markForCheck();
  }

  private openPicker(excludeUlbIds: string[], applySelections: (options: FcUnspentUlbOption[]) => void): void {
    const panelClass = [...(this.themeClass ? [this.themeClass] : []), 'ulb-picker-dialog-panel'];
    const data: UlbPickerDialogData = {
      stateId: this.stateId(),
      yearId: this.yearId(),
      excludeUlbIds,
      blockingMessage: this.blockingMessage(),
    };

    const dialogRef = this.dialog.open(UlbPickerDialogComponent, {
      panelClass,
      width: '65vw',
      maxWidth: '65vw',
      height: '80vh',
      maxHeight: '80vh',
      injector: this.injector,
      data,
    });

    dialogRef.afterClosed().subscribe((options: FcUnspentUlbOption[] | undefined) => {
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
      // this component's — Angular's OnPush auto dirty-marking only picks up signal changes that
      // were already read by a previous render pass, which never happened for the empty-table case
      // (the `@for` body, and thus `rowViewModels()`, never ran with 0 rows). Force the recheck.
      this.cdr.markForCheck();
    });
  }
}
