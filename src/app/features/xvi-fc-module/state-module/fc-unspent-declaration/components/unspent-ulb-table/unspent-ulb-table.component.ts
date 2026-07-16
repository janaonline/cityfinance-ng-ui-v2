import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith, switchMap } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../../../core/theming/material-theme.providers';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
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

/**
 * Builds one editable ULB row via the shared `DynamicFormService.createContorl`, so validator and
 * readonly setup stays consistent with the rest of the page. Exported so both the parent (initial
 * hydration) and this component's own picker-driven add flow share one factory.
 */
export function createFcUnspentUlbRowGroup(
  dynamicService: DynamicFormService,
  canEdit: boolean,
  existingRow?: { ulbId: string | null; unspentAmount: number | null },
): FcUnspentUlbRowGroup {
  const readonly = !canEdit;

  const ulbIdField = {
    key: 'ulbId',
    formFieldType: 'select',
    value: existingRow?.ulbId ?? null,
    readonly,
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'Please select a ULB.',
      },
    ],
  };

  const unspentAmountField = {
    key: 'unspentAmount',
    formFieldType: 'number',
    value: existingRow?.unspentAmount ?? null,
    readonly,
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'Unspent amount is required.',
      },
      {
        name: 'min',
        validator: Number.MIN_VALUE,
        message: 'Unspent amount must be greater than zero.',
      },
    ],
  };

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
  imports: [ReactiveFormsModule, DecimalPipe, MatButtonModule],
  templateUrl: './unspent-ulb-table.component.html',
  styleUrl: './unspent-ulb-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnspentUlbTableComponent {
  private readonly dynamicService = inject(DynamicFormService);
  private readonly dialog = inject(MatDialog);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });

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

  /** Opens the picker to change the ULB already selected for an existing row. */
  openPickerForRow(index: number): void {
    if (!this.canEdit()) return;
    const row = this.rows().at(index);
    if (!row) return;

    const currentUlbId = row.controls.ulbId.value;
    const excludeUlbIds = this.currentUlbIds().filter((ulbId) => ulbId !== currentUlbId);

    this.openPicker(excludeUlbIds, (option) => {
      row.controls.ulbId.setValue(option.ulbId);
      row.controls.ulbId.markAsDirty();
      row.controls.ulbId.markAsTouched();
    });
  }

  /** Opens the picker to add a brand-new row. */
  addRow(): void {
    if (!this.canEdit()) return;

    this.openPicker(this.currentUlbIds(), (option) => {
      this.rows().push(
        createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit(), {
          ulbId: option.ulbId,
          unspentAmount: null,
        }),
      );
    });
  }

  removeRow(index: number): void {
    this.rows().removeAt(index);
  }

  private openPicker(excludeUlbIds: string[], applySelection: (option: FcUnspentUlbOption) => void): void {
    const panelClass = [...(this.themeClass ? [this.themeClass] : []), 'ulb-picker-dialog-panel'];
    const data: UlbPickerDialogData = { stateId: this.stateId(), yearId: this.yearId(), excludeUlbIds };

    const dialogRef = this.dialog.open(UlbPickerDialogComponent, {
      panelClass,
      width: '65vw',
      maxWidth: '65vw',
      height: '80vh',
      maxHeight: '80vh',
      data,
    });

    dialogRef.afterClosed().subscribe((option: FcUnspentUlbOption | undefined) => {
      if (!option) return;
      // Defensive recheck — never apply a selection that duplicates a row that changed elsewhere
      // while the picker was open. Backend duplicate validation remains authoritative regardless.
      if (this.currentUlbIds().includes(option.ulbId)) return;

      this.pickedUlbByUlbId.update((map) => new Map(map).set(option.ulbId, option));
      applySelection(option);
    });
  }
}
