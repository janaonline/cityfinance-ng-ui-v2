import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { map, startWith, switchMap } from 'rxjs';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { FcUnspentUlbOption } from '../../fc-unspent-declaration.models';

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
  option: FcUnspentUlbOption | undefined;
  allocationAmount: number | null;
  allocationPerc: number | null;
  eligible: boolean | null;
}

/**
 * Builds one editable ULB row via the shared `DynamicFormService.createContorl`, so validator and
 * readonly setup stays consistent with the rest of the page. Exported so both the parent (initial
 * hydration + auto-add-on-toggle) and this component's own "Add ULB" button share one factory.
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

  return new FormGroup<FcUnspentUlbRowForm>({
    ulbId: dynamicService.createContorl(ulbIdField, false, ulbIdField.readonly) as FormControl<string | null>,
    unspentAmount: dynamicService.createContorl(unspentAmountField, false, unspentAmountField.readonly) as FormControl<
      number | null
    >,
  });
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

  readonly rows = input.required<FormArray<FcUnspentUlbRowGroup>>();
  readonly ulbOptions = input<readonly FcUnspentUlbOption[]>([]);
  readonly canEdit = input(false);
  readonly applicableFcLabel = input.required<string>();

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

  private readonly ulbOptionsById = computed(() => new Map(this.ulbOptions().map((option) => [option.ulbId, option])));

  /** Per-row-index set of `ulbId`s already picked by *other* rows, for disabling duplicate `<option>`s. */
  readonly takenUlbIdsByRowIndex = computed(() => {
    const values = this.rowValues();
    return values.map(
      (_, rowIndex) =>
        new Set(
          values
            .filter((_, otherIndex) => otherIndex !== rowIndex)
            .map((value) => value.ulbId)
            .filter((ulbId): ulbId is string => !!ulbId),
        ),
    );
  });

  /**
   * Per-row display view-model: resolved ULB option fields plus a frontend-only preview of
   * percentage/eligibility. This is feedback for the user only — the backend calculation remains
   * authoritative, and these values are never written back into the row's editable controls.
   */
  readonly rowViewModels = computed<FcUnspentUlbRowViewModel[]>(() => {
    const optionsById = this.ulbOptionsById();
    return this.rowValues().map((value) => {
      const option = value.ulbId ? optionsById.get(value.ulbId) : undefined;
      const allocationAmount = option?.allocationAmount ?? null;
      const allocationPerc =
        allocationAmount !== null && allocationAmount > 0 && value.unspentAmount !== null && value.unspentAmount > 0
          ? (value.unspentAmount / allocationAmount) * 100
          : null;
      return {
        option,
        allocationAmount,
        allocationPerc,
        eligible: allocationPerc !== null ? allocationPerc <= 10 : null,
      };
    });
  });

  addRow(): void {
    this.rows().push(createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit()));
  }

  removeRow(index: number): void {
    this.rows().removeAt(index);
  }
}
