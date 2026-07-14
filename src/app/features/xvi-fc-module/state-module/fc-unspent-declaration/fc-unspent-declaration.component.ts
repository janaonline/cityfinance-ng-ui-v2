import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { UtilityService } from '../../../../core/services/utility.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import {
  FORM_STATUS,
  FormActor,
  FormProgressComponent,
  FormStatusValue,
} from '../../shared/form-progress/form-progress.component';
import {
  createFcUnspentUlbRowGroup,
  FcUnspentUlbRowGroup,
  UnspentUlbTableComponent,
} from './components/unspent-ulb-table/unspent-ulb-table.component';
import { FC_UNSPENT_DECLARATION_MOCK_RESPONSE } from './fc-unspent-declaration.mock';
import { FcUnspentApplicableFc, FcUnspentUlbData, FcUnspentUlbOption } from './fc-unspent-declaration.models';

type SubmitType = 'saveAsDraft' | 'finalSubmit';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons. */
const FC_UNSPENT_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
} as const;

@Component({
  selector: 'app-fc-unspent-declaration',
  imports: [
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    FormProgressComponent,
    UnspentUlbTableComponent,
  ],
  templateUrl: './fc-unspent-declaration.component.html',
  styleUrl: './fc-unspent-declaration.component.scss',
})
export class FcUnspentDeclarationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });

  readonly stateName = signal('');
  readonly applicableFc = signal<FcUnspentApplicableFc>('14TH_FC');
  readonly applicableFcLabel = computed(() => (this.applicableFc() === '15TH_FC' ? '15th' : '14th'));
  readonly actors = signal<FormActor[]>([]);
  readonly ulbOptions = signal<readonly FcUnspentUlbOption[]>([]);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly unspentUlbData = new FormArray<FcUnspentUlbRowGroup>([]);
  private readonly isYesBranchSignal = signal(false);
  readonly isYesBranch = computed(() => this.isYesBranchSignal());

  // Static preview: nothing to fetch over HTTP, so loading never happens and the form is always
  // editable until this page is wired to a real backend endpoint.
  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly canEdit = signal(false);
  readonly canFinalSubmit = signal(false);
  readonly currentFormStatus = signal<FormStatusValue>(FORM_STATUS.NOT_STARTED);
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus());

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  ngOnInit(): void {
    this.loadMockData();
    this.createFormControls();
  }

  /** Reads the local mock response (see fc-unspent-declaration.mock.ts) and seeds page state from it. */
  private loadMockData(): void {
    const { data } = FC_UNSPENT_DECLARATION_MOCK_RESPONSE;

    this.stateName.set(data.stateName);
    this.applicableFc.set(data.applicableFc);
    this.actors.set(data.actors);
    this.currentFormStatus.set(data.currentFormStatus);
    this.canEdit.set(data.permissions.canEdit);
    this.canFinalSubmit.set(data.permissions.canFinalSubmit);
    this.ulbOptions.set(data.ulbOptions);
    // Defensive per-question clone — never mutate the mock/static question export in place.
    this.fields.set(data.questions.map((question) => ({ ...question })));
  }

  private createFormControls(): void {
    for (const field of this.fields()) {
      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

    this.form.addControl('unspentUlbData', this.unspentUlbData);
    this.hydrateUnspentUlbData(FC_UNSPENT_DECLARATION_MOCK_RESPONSE.data.unspentUlbData);

    const isFcUnspentControl = this.form.get('isFcUnspent');
    this.isYesBranchSignal.set(isFcUnspentControl?.value === 'yes');
    isFcUnspentControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.isYesBranchSignal.set(value === 'yes');
      // Auto-add one blank row so the user always has an editable row when switching to Yes.
      // Switching to No intentionally leaves unspentUlbData untouched — rows are just not
      // rendered while hidden, mirroring the preserveHiddenValue behavior used for the other
      // conditional fields on this page.
      if (value === 'yes' && this.unspentUlbData.length === 0) {
        this.unspentUlbData.push(createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit()));
      }
    });

    this.dependencyIndex = this.visibilityService.createDependencyIndex(this.fields());

    this.visibilityService.bindVisibility({
      form: this.form,
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
    });

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }
  }

  private hydrateUnspentUlbData(rows: FcUnspentUlbData[]): void {
    for (const row of rows) {
      this.unspentUlbData.push(createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit(), row));
    }
  }

  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.actionId === FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE) {
      this.utilityService.triggerSnackbar('Template download is not yet available.', 'snackbar-warn');
    }
  }

  onSubmit(action: SubmitType): void {
    const flatFieldsValid = this.isValidForSubmitType(action);
    const tableValid = this.isUnspentUlbDataValidForSubmitType(action);

    if (!flatFieldsValid || !tableValid) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        action === 'finalSubmit'
          ? 'Please correct the errors in the form before submitting.'
          : 'Please correct the errors in the form before saving as draft.',
        'snackbar-danger',
      );
      return;
    }

    const dialogData = action === 'finalSubmit' ? SUBMIT_CONFIRM_DIALOG_DEFAULTS : SAVE_AS_DRAFT_DIALOG_DEFAULTS;
    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;

    this.confirmDialogService
      .confirm(dialogData, config)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar(
          'Form validated. This page is not yet connected to a backend service.',
          'snackbar-warn',
        );
      });
  }

  onCancel(): void {
    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
    this.confirmDialogService
      .confirm(undefined, config)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
      });
  }

  /**
   * For `finalSubmit`: every error on visible controls must be absent.
   * For `saveAsDraft`: plain `required` errors are skipped (empty fields are allowed in a
   * draft), but every other error blocks — including `requiredTrue`, which Angular reports
   * under the same `required` error key. The field's `validations` config distinguishes them.
   */
  private isValidForSubmitType(action: SubmitType): boolean {
    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (!control?.errors) continue;

      const hasRequiredTrueValidator = field.validations?.some((v) => v.name === 'requiredTrue') ?? false;

      for (const errorKey of Object.keys(control.errors)) {
        if (action === 'saveAsDraft' && errorKey === 'required' && !hasRequiredTrueValidator) continue;
        return false;
      }
    }

    return true;
  }

  /**
   * Validates the unspentUlbData FormArray, only when the Yes branch is active. Kept separate
   * from isValidForSubmitType to avoid building a generic cross-FormArray validation framework
   * for what is currently a single, page-specific repeating field.
   */
  private isUnspentUlbDataValidForSubmitType(action: SubmitType): boolean {
    if (!this.isYesBranch()) return true;

    if (action === 'finalSubmit' && this.unspentUlbData.length === 0) {
      return false;
    }

    let valid = true;

    for (const row of this.unspentUlbData.controls) {
      const ulbIdControl = row.controls.ulbId;
      const unspentAmountControl = row.controls.unspentAmount;

      if (action === 'finalSubmit') {
        if (ulbIdControl.invalid || unspentAmountControl.invalid) {
          valid = false;
          ulbIdControl.markAsTouched();
          unspentAmountControl.markAsTouched();
        }
        continue;
      }

      // saveAsDraft: skip bare `required` errors (empty rows are allowed in a draft), but never
      // skip other errors such as a non-positive entered amount.
      for (const control of [ulbIdControl, unspentAmountControl]) {
        if (!control.errors) continue;
        for (const errorKey of Object.keys(control.errors)) {
          if (errorKey === 'required') continue;
          valid = false;
          control.markAsTouched();
        }
      }
    }

    return valid;
  }
}
