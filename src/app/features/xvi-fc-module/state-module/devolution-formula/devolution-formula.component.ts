import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import FileSaver from 'file-saver';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import {
  CanComponentDeactivate,
  warnBeforeUnloadWhenDirty,
} from '../../../../core/guards/unsaved-changes.guard';
import {
  ConfirmDialogData,
  resolveThemeClass,
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import { withSupportingActionState } from '../../../../shared/dynamic-form/supporting-action-state';
import { normalizeUploadedFileMetadata } from '../../../../shared/dynamic-form/components/file/file-metadata.types';
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
import { XvifcModuleService } from '../../xvi-fc-module.service';
import {
  ApiErrorMap,
  DevolutionFileRef,
  DevolutionGrantAllocationSummary,
  DevolutionInstallmentAccess,
  DevolutionPermissions,
  DevolutionRowsDialogData,
  DevolutionRowsDialogResult,
  DevolutionValidationSummary,
  DfInstallment,
  DfRowValidationStatus,
  FinalSubmitDevolutionPayload,
  SaveDraftDevolutionPayload,
  SubmitType,
  ValidateExcelDevolutionPayload,
} from './devolution-formula.models';
import { DevolutionFormulaRowsDialogComponent } from './dialogs/rows-dialog/devolution-formula-rows-dialog.component';
import {
  buildDevolutionDraftPayloadData,
  buildDevolutionFinalSubmitPayloadData,
  extractApiErrorResponse,
  extractValidationSummaryFromError,
  getDuplicateUlbMessage,
  getHttpStatus,
  getRegisterUlbErrorMessage,
  hasDevolutionFileRef,
  hasPersistedValidationData,
  isValidDevolutionFileRef,
} from './devolution-formula.utils';
import { DevolutionFormulaService } from './devolution-formula.service';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons. */
const DF_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
  VIEW_UPLOADED_DATA: 'view-uploaded-data',
  DOWNLOAD_ERROR_SHEET: 'download-error-sheet',
  REVALIDATE_EXCEL: 'revalidate-excel',
  REGISTER_ULB: 'register-ulb',
} as const;

@Component({
  selector: 'app-devolution-formula',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    MatTooltipModule,
    FormProgressComponent,
  ],
  templateUrl: './devolution-formula.component.html',
  styleUrl: './devolution-formula.component.scss',
})
export class DevolutionFormulaComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  /** Raw theme class for the rows dialog opened directly via `MatDialog` (needs a custom
   *  panelClass array alongside its own fixed class, not `dialogConfig`'s single panelClass). */
  private readonly themeClass = resolveThemeClass();
  private readonly dfService = inject(DevolutionFormulaService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly router = inject(Router);

  readonly stateName = signal('');
  readonly actors = signal<FormActor[]>([]);
  readonly formStatus = signal<FormStatusValue>(FORM_STATUS.NO_STATUS);

  readonly installment = signal<DfInstallment>(1);

  readonly permissions = signal<DevolutionPermissions>({ canView: true, canEdit: true, canFinalSubmit: false });
  readonly validationSummary = signal<DevolutionValidationSummary | null>(null);
  readonly grantAllocationSummary = signal<DevolutionGrantAllocationSummary | null>(null);
  readonly rowEditFields = signal<ConditionalFieldConfig[]>([]);
  readonly installmentAccess = signal<DevolutionInstallmentAccess | null>(null);

  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isValidating = signal(false);
  readonly isDeleting = signal(false);
  readonly isDownloadingTemplate = signal(false);
  readonly isDownloadingErrorSheet = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  /** Backend-driven lock state for installment 2; missing access metadata defaults to locked. */
  readonly isInstallment2Locked = computed(() => this.installmentAccess()?.installment2?.locked ?? true);

  readonly installment2LockReason = computed(
    () =>
      this.installmentAccess()?.installment2?.lockReason ??
      'Installment 2 is locked until at least one Installment 1 claim batch is acknowledged by MoHUA.',
  );

  readonly canSelectInstallment2 = computed(
    () => this.installmentAccess()?.installment2?.canSelect === true && !this.isInstallment2Locked(),
  );

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  /**
   * `visibleFields()` with the excelFile download actions' `loading`/`loadingLabel` overridden
   * from this component's own `isDownloading*` signals, so the supporting-content button shows a
   * spinner while its request is in flight. Bound in the template in place of `visibleFields()`.
   */
  readonly effectiveVisibleFields = computed<ConditionalFieldConfig[]>(() =>
    this.visibleFields().map((field) =>
      field.key === 'excelFile'
        ? withSupportingActionState(field, [
            {
              actionId: DF_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE,
              loading: this.isDownloadingTemplate(),
              loadingLabel: 'Downloading template…',
            },
            {
              actionId: DF_SUPPORTING_ACTION.DOWNLOAD_ERROR_SHEET,
              loading: this.isDownloadingErrorSheet(),
              loadingLabel: 'Downloading error sheet…',
            },
          ])
        : field,
    ),
  );

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Tracks error codes injected per field by the most recent failed API response. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  /** Emits once before each form rebuild so per-form subscriptions are torn down cleanly. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

  /** Guards the delete/validate triggers from firing during form hydration or file restoration. */
  private isHydratingForm = false;
  private isRestoringExcelFile = false;
  private isDeleteExcelDialogOpen = false;

  /** Last file value confirmed by the backend (GET response or validate-excel success). */
  private lastPersistedExcelFile: DevolutionFileRef | null = null;

  /**
   * Field errors from a validate-excel HTTP error that also carried persisted data.
   * Consumed and cleared in `createFormControls` so they are re-stamped onto the rebuilt controls.
   */
  private pendingPostReloadErrors: ApiErrorMap | null = null;

  private get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  constructor() {
    warnBeforeUnloadWhenDirty(() => this.hasUnsavedChanges());
  }

  ngOnInit(): void {
    this.loadForm();
  }

  /** Read by {@link unsavedChangesGuard} and the `beforeunload` listener. A disabled (read-only)
   *  form is never dirty, so this is automatically `false` when `canEdit` is `false`. */
  hasUnsavedChanges(): boolean {
    return this.canEdit() && this.form.dirty;
  }

  /**
   * Switches the active installment, tears down stale form state, and reloads the GET form.
   * No-op when the requested installment is already active or a load is in progress.
   */
  switchInstallment(installment: DfInstallment): void {
    if (this.isLoading() || this.installment() === installment) return;
    if (installment === 2 && this.isInstallment2Locked()) return;
    this.resetFormSubscriptions();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.validationSummary.set(null);
    this.grantAllocationSummary.set(null);
    this.serverErrorKeys.clear();
    this.pendingPostReloadErrors = null;
    this.lastPersistedExcelFile = null;
    this.isSavingDraft.set(false);
    this.isFinalSubmitting.set(false);
    this.isValidating.set(false);
    this.isDeleting.set(false);
    this.installment.set(installment);
    this.loadForm();
  }

  private loadForm(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to load ULB-wise Allocation form. Please try again.',
        'snackbar-danger',
      );
      return;
    }

    this.isHydratingForm = true;
    this.isLoading.set(true);

    this.dfService
      .getForm(stateId, yearId, this.installment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.stateName.set(data.stateName ?? '');
          this.actors.set(data.actors ?? []);
          this.formStatus.set(data.currentFormStatus as FormStatusValue);
          this.validationSummary.set(data.validationSummary ?? null);
          this.grantAllocationSummary.set(data.grantAllocationSummary ?? null);

          const fileField = data.questions.find((q) => q.key === 'excelFile');
          this.lastPersistedExcelFile = normalizeUploadedFileMetadata(fileField?.value);

          this.fields.set(data.questions);
          this.rowEditFields.set(data.rowEditFields ?? []);
          this.installmentAccess.set(data.installmentAccess ?? null);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: () => {
          this.isHydratingForm = false;
          this.utilityService.triggerSnackbar(
            'Unable to load ULB-wise Allocation form. Please try again.',
            'snackbar-danger',
          );
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Registers a FormControl for every field in `this.fields`, wires visibility bindings,
   * disables the form when the user lacks edit permission, then sets up auto-validate and
   * delete triggers for the Excel file control.
   * Exits early with a snackbar on invalid field config.
   */
  createFormControls(): void {
    this.isLoading.set(true);

    for (const field of this.fields()) {
      if (!field.key || !field.formFieldType) {
        this.utilityService.triggerSnackbar('Invalid field configuration.', 'snackbar-danger');
        this.isLoading.set(false);
        return;
      }

      const hasInitialValue = field.value !== null && field.value !== undefined && field.value !== '';
      if (!field.disabled) {
        field.readonly = !hasInitialValue && field.readonly && field.formFieldType !== 'date' ? false : field.readonly;
      }

      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

    this.dependencyIndex = this.visibilityService.createDependencyIndex(this.fields());

    this.visibilityService.bindVisibility({
      form: this.form,
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
      formTeardown$: this.formSubscriptionsTeardown$,
    });

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }

    this.setupValidationTrigger();
    this.setupDeleteTrigger();
    this.isHydratingForm = false;
    this.isLoading.set(false);

    if (this.pendingPostReloadErrors) {
      const errors = this.pendingPostReloadErrors;
      this.pendingPostReloadErrors = null;
      this.applyApiErrors(errors);
    }
  }

  /**
   * Subscribes to `excelFile` value changes and auto-triggers Excel validation
   * whenever a new valid file is uploaded (not during hydration or file restore).
   */
  private setupValidationTrigger(): void {
    const fileControl = this.form.get('excelFile') as FormControl | null;
    if (!fileControl) return;

    fileControl.valueChanges
      .pipe(
        filter(isValidDevolutionFileRef),
        takeUntil(this.formSubscriptionsTeardown$),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.isRestoringExcelFile) return;
        this.clearApiErrorsForField('excelFile');
        this.triggerExcelValidation();
      });
  }

  /**
   * Calls validate-excel API with the current file value.
   * On HTTP 200 (VALID or INVALID), reloads the form.
   * On HTTP error with persisted data (allocation mismatch), stores errors and reloads.
   * On HTTP error without persisted data, injects errors directly.
   */
  private triggerExcelValidation(): void {
    if (this.isValidating()) return;

    const fileValue = this.form.get('excelFile')?.value;
    if (!isValidDevolutionFileRef(fileValue)) return;

    this.isValidating.set(true);
    this.utilityService.triggerSnackbar('Excel uploaded. Verifying data…');

    const payload: ValidateExcelDevolutionPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      excelFile: fileValue,
    };

    this.dfService
      .validateExcel(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isValidating.set(false)),
      )
      .subscribe({
        next: (res) => {
          this.lastPersistedExcelFile = fileValue;
          if (res.data.validationStatus === 'VALID') {
            this.utilityService.triggerSnackbar('Excel validated successfully.');
          } else {
            this.utilityService.triggerSnackbar(
              getDuplicateUlbMessage(res.data.rowErrors) ??
                'Excel validation completed with errors. Please review uploaded data.',
              'snackbar-danger',
            );
          }
          this.reloadForm();
        },
        error: (err: unknown) => {
          const response = extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            getRegisterUlbErrorMessage(response?.errors) ??
              response?.message ??
              'Excel validation failed. Please try again.',
            'snackbar-danger',
          );

          // Capture allocation-mismatch validationSummary from the 400 error body.
          const summary = extractValidationSummaryFromError(err);
          if (summary) {
            this.validationSummary.set(summary);
          }

          const persisted = hasPersistedValidationData(err);
          if (persisted) {
            if (response?.errors) {
              this.applyApiErrors(response.errors);
              this.pendingPostReloadErrors = response.errors;
            }
            this.reloadForm();
          } else if (response?.errors) {
            this.applyApiErrors(response.errors);
          }
        },
      });
  }

  /**
   * Subscribes to `excelFile` value changes and triggers the delete flow
   * when the control is cleared while a backend-persisted file exists.
   */
  private setupDeleteTrigger(): void {
    const fileControl = this.form.get('excelFile') as FormControl | null;
    if (!fileControl) return;

    fileControl.valueChanges
      .pipe(takeUntil(this.formSubscriptionsTeardown$), takeUntilDestroyed(this.destroyRef))
      .subscribe((currentValue: unknown) => {
        if (this.isHydratingForm || this.isRestoringExcelFile) return;
        if (!hasDevolutionFileRef(currentValue)) {
          this.clearApiErrorsForField('excelFile');
        }
        if (this.isDeleteExcelDialogOpen || this.isDeleting()) return;
        if (!this.lastPersistedExcelFile) return;
        if (hasDevolutionFileRef(currentValue)) return;
        if (!this.canEdit()) return;
        if (this.isLoading() || this.isValidating() || this.isSubmitting()) return;

        this.confirmAndDeleteExcel();
      });
  }

  /** Shows a confirmation dialog before proceeding with Excel deletion. Restores the file on cancel. */
  private confirmAndDeleteExcel(): void {
    this.isDeleteExcelDialogOpen = true;

    const dialogData: ConfirmDialogData = {
      title: 'Remove uploaded Excel?',
      message:
        'Removing the uploaded Excel will also remove the uploaded row data and validation results. You can upload a new Excel file anytime. Continue?',
      confirmText: 'Yes, remove',
      cancelText: 'No, keep it',
      confirmButtonColor: 'warn',
      icon: 'bi-trash-fill',
    };

    this.confirmDialogService
      .confirm(dialogData, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          this.isDeleteExcelDialogOpen = false;
          this.restoreExcelFileControl();
          return;
        }
        this.executeDeleteExcel();
      });
  }

  /**
   * Restores the last backend-persisted file value into the `excelFile` control.
   * Sets `isRestoringExcelFile` to suppress the validate/delete triggers during the patch.
   */
  private restoreExcelFileControl(): void {
    const fileControl = this.form.get('excelFile') as FormControl | null;
    if (!fileControl || !isValidDevolutionFileRef(this.lastPersistedExcelFile)) return;

    this.isRestoringExcelFile = true;
    try {
      fileControl.setValue(this.lastPersistedExcelFile);
      fileControl.markAsPristine();
      fileControl.markAsUntouched();
      fileControl.updateValueAndValidity({ emitEvent: false });
    } finally {
      this.isRestoringExcelFile = false;
    }
  }

  /** Calls the DELETE API to remove the uploaded Excel. Restores the control value on failure. */
  private executeDeleteExcel(): void {
    this.isDeleting.set(true);

    this.dfService
      .deleteUploadedExcel(this.stateId, this.yearId, this.installment())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isDeleting.set(false);
          this.isDeleteExcelDialogOpen = false;
        }),
      )
      .subscribe({
        next: () => {
          this.lastPersistedExcelFile = null;
          this.utilityService.triggerSnackbar('Uploaded Excel removed successfully.');
          this.reloadForm();
        },
        error: (err: unknown) => {
          const response = extractApiErrorResponse(err);
          const status = getHttpStatus(err);
          const message =
            status === 400 || status === 403
              ? (response?.message ?? 'Failed to remove uploaded Excel. Please try again.')
              : 'Failed to remove uploaded Excel. Please try again.';
          this.utilityService.triggerSnackbar(message, 'snackbar-danger');
          this.restoreExcelFileControl();
        },
      });
  }

  /**
   * Routes action events from `FieldSupportingContentComponent` for the `excelFile` field
   * to the appropriate handler.
   */
  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey !== 'excelFile') return;
    switch (event.actionId) {
      case DF_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE:
        this.downloadTemplate();
        return;
      case DF_SUPPORTING_ACTION.VIEW_UPLOADED_DATA:
        // If the last known validation had row errors, land the user directly on the Invalid
        // filter instead of "All" — still fully user-initiated, no dialog opens without a click.
        this.openRowsDialog(this.validationSummary()?.errorRowCount ? 'INVALID' : undefined);
        return;
      case DF_SUPPORTING_ACTION.DOWNLOAD_ERROR_SHEET:
        this.downloadErrorSheet();
        return;
      case DF_SUPPORTING_ACTION.REVALIDATE_EXCEL:
        this.revalidateExcel();
        return;
      case DF_SUPPORTING_ACTION.REGISTER_ULB:
        this.router.navigate(['/xvifc', this.yearId, 'register-ulb']);
        return;
      default:
        return;
    }
  }

  /**
   * Opens the uploaded rows viewer dialog. Reloads form if any rows were saved.
   * @param initialFilter Pre-sets the dialog's validation-status filter (e.g. 'INVALID' to jump
   * straight to a failed validation's affected rows) instead of the default "All" filter.
   */
  openRowsDialog(initialFilter?: DfRowValidationStatus): void {
    const data: DevolutionRowsDialogData = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      canEdit: this.canEdit(),
      rowEditFields: this.rowEditFields(),
      initialValidationStatusFilter: initialFilter,
    };
    const panelClasses = this.themeClass ? [this.themeClass, 'df-rows-dialog-panel'] : ['df-rows-dialog-panel'];
    const ref = this.dialog.open(DevolutionFormulaRowsDialogComponent, {
      data,
      panelClass: panelClasses,
      width: '95vw',
      maxWidth: '95vw',
      height: '95vh',
      maxHeight: '95vh',
      autoFocus: false,
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: DevolutionRowsDialogResult | undefined) => {
        if (result?.updatedSummary) {
          this.reloadForm();
        }
      });
  }

  /** Downloads the ULB-wise Allocation Excel template as a blob. */
  downloadTemplate(): void {
    if (this.isDownloadingTemplate()) return;
    this.isDownloadingTemplate.set(true);

    this.dfService
      .downloadTemplate(this.stateId, this.yearId, this.installment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, 'ulb-wise-allocation-template.xlsx');
          this.isDownloadingTemplate.set(false);
        },
        error: () => {
          this.utilityService.triggerSnackbar('Failed to download template.', 'snackbar-danger');
          this.isDownloadingTemplate.set(false);
        },
      });
  }

  /** Downloads the error sheet for rows that failed validation. */
  downloadErrorSheet(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId || this.isDownloadingErrorSheet()) return;

    this.isDownloadingErrorSheet.set(true);

    this.dfService
      .downloadErrorSheet(stateId, yearId, this.installment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, 'ulb-wise-allocation-error-sheet.xlsx');
          this.isDownloadingErrorSheet.set(false);
          this.utilityService.triggerSnackbar('Error sheet downloaded successfully.');
        },
        error: (err: unknown) => {
          this.isDownloadingErrorSheet.set(false);
          const status = getHttpStatus(err);
          const message =
            status === 400
              ? 'No uploaded data found to generate error sheet.'
              : 'Failed to download error sheet. Please try again.';
          this.utilityService.triggerSnackbar(message, 'snackbar-danger');
        },
      });
  }

  /** Re-validates the already-uploaded Excel against the backend dataset. */
  private revalidateExcel(): void {
    if (this.isValidating()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.clearAllApiErrors();
    this.isValidating.set(true);

    this.dfService
      .revalidateExcel(stateId, yearId, this.installment())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isValidating.set(false)),
      )
      .subscribe({
        next: (res) => {
          const status = res.data.validationSummary?.validationStatus;
          if (status === 'VALID') {
            this.utilityService.triggerSnackbar('Excel revalidated successfully.');
          } else {
            // See triggerExcelValidation: prefer the specific duplicate-ULB message over firing
            // it as a second, stacking snackbar call.
            this.utilityService.triggerSnackbar(
              getDuplicateUlbMessage(res.data.rowErrors) ??
                'Revalidation completed with errors. Please review uploaded data.',
              'snackbar-danger',
            );
          }
          this.reloadForm();
        },
        error: (err: unknown) => {
          const response = extractApiErrorResponse(err);
          // See triggerExcelValidation: prefer the specific new-ULB message over the generic
          // backend message rather than firing both as separate snackbar calls.
          this.utilityService.triggerSnackbar(
            getRegisterUlbErrorMessage(response?.errors) ??
              response?.message ??
              'Revalidation failed. Please try again.',
            'snackbar-danger',
          );
          if (response?.errors) {
            this.applyApiErrors(response.errors);
          }
        },
      });
  }

  /**
   * Validates the form for the given submit type, then shows a confirm dialog
   * before delegating to `executeSaveDraft` or `executeFinalSubmit`.
   */
  onSubmit(action: SubmitType): void {
    if (action === 'finalSubmit' && this.installment() === 2 && this.isInstallment2Locked()) {
      // Reuse the same reason already shown as the tab's tooltip/help text, instead of a
      // separate, less specific hardcoded string.
      this.utilityService.triggerSnackbar(this.installment2LockReason(), 'snackbar-danger');
      return;
    }
    if (!this.isValidForSubmitType(action)) {
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

    this.confirmDialogService
      .confirm(dialogData, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          this.utilityService.triggerSnackbar(
            action === 'saveAsDraft' ? 'Draft save cancelled.' : 'Form submission cancelled.',
            'snackbar-danger',
          );
          return;
        }
        if (action === 'saveAsDraft') {
          this.executeSaveDraft();
        } else {
          this.executeFinalSubmit();
        }
      });
  }

  /**
   * For `finalSubmit`: every error on visible controls must be absent.
   * For `saveAsDraft`: plain `required` errors are skipped (empty fields are allowed) —
   * this currently includes `requiredTrue` too (see TODO below).
   */
  private isValidForSubmitType(action: SubmitType): boolean {
    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (!control?.errors) continue;

      // TODO: requiredTrue (declaration/confirmation checkboxes) is temporarily not mandatory for
      // saveAsDraft either — uncomment both lines below to restore the original "still blocks drafts" behavior.
      // const hasRequiredTrueValidator = field.validations?.some((v) => v.name === 'requiredTrue') ?? false;

      for (const errorKey of Object.keys(control.errors)) {
        if (action === 'saveAsDraft' && errorKey === 'required' /* && !hasRequiredTrueValidator */) continue;
        return false;
      }
    }
    return true;
  }

  /** Clears previous API errors, posts the visible payload as a draft, then reloads on success. */
  private executeSaveDraft(): void {
    this.clearAllApiErrors();
    this.isSavingDraft.set(true);

    const visiblePayload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const payload: SaveDraftDevolutionPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      data: buildDevolutionDraftPayloadData(visiblePayload),
    };

    this.dfService
      .saveDraft(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSavingDraft.set(false);
          this.utilityService.triggerSnackbar('Draft saved successfully.');
          this.reloadForm();
        },
        error: (err: unknown) => {
          this.isSavingDraft.set(false);
          this.handleSubmitError(err, 'Unable to save draft. Please correct the errors and try again.');
        },
      });
  }

  /** Clears previous API errors, posts the visible payload as a final submission, then reloads on success. */
  private executeFinalSubmit(): void {
    this.clearAllApiErrors();

    const visiblePayload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const finalSubmitData = buildDevolutionFinalSubmitPayloadData(visiblePayload);

    if (!finalSubmitData) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
      return;
    }

    this.isFinalSubmitting.set(true);

    const payload: FinalSubmitDevolutionPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      data: finalSubmitData,
    };

    this.dfService
      .finalSubmit(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFinalSubmitting.set(false);
          this.utilityService.triggerSnackbar('Form submitted successfully.');
          this.reloadForm();
        },
        error: (err: unknown) => {
          this.isFinalSubmitting.set(false);
          this.handleSubmitError(err, 'Unable to submit form. Please correct the errors and try again.');
        },
      });
  }

  private handleSubmitError(err: unknown, fallbackMessage: string): void {
    const response = extractApiErrorResponse(err);
    this.utilityService.triggerSnackbar(response?.message ?? fallbackMessage, 'snackbar-danger');
    if (response?.errors) {
      this.applyApiErrors(response.errors);
    }
  }

  /** Shows a cancel confirmation dialog (default "Discard changes?" text). */
  onCancel(): void {
    this.confirmDialogService
      .confirm(undefined, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar('Changes discarded.', 'snackbar-danger');
      });
  }

  private applyApiErrors(errors: ApiErrorMap): void {
    this.fields.update((fields) =>
      fields.map((field) => {
        const fieldErrors = errors[field.key ?? ''];
        if (!fieldErrors?.length || field.hidden) return field;

        const validations = [...(field.validations ?? [])];
        for (const error of fieldErrors) {
          if (!error.code) continue;
          const existingIdx = validations.findIndex((v) => v.name === error.code);
          if (existingIdx >= 0) {
            validations[existingIdx] = { ...validations[existingIdx], message: error.message };
          } else {
            validations.push({ name: error.code, validator: null, message: error.message });
          }
        }

        return { ...field, validations };
      }),
    );

    // Messages for error keys that have no matching visible form control (e.g. `installment`).
    const unmatchedMessages: string[] = [];

    for (const [fieldKey, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors.length) continue;

      const actualKey = fieldErrors[0]?.field ?? fieldKey;
      const fieldConfig = this.fields().find((f) => f.key === actualKey);

      // Hidden fields are skipped silently; they should not show errors to the user.
      if (fieldConfig?.hidden) continue;

      const control = this.form.get(actualKey);

      if (!control) {
        // No form control for this key (e.g. `installment`, unknown field key).
        // Surface the messages so the user knows something went wrong.
        for (const err of fieldErrors) {
          unmatchedMessages.push(err.message);
        }
        continue;
      }

      const errorMap = fieldErrors.reduce<Record<string, true>>((acc, error) => {
        if (error.code) acc[error.code] = true;
        return acc;
      }, {});

      control.setErrors({ ...(control.errors ?? {}), ...errorMap });
      control.markAsTouched();
      control.markAsDirty();

      this.serverErrorKeys.set(actualKey, [...(this.serverErrorKeys.get(actualKey) ?? []), ...Object.keys(errorMap)]);
    }

    if (unmatchedMessages.length > 0) {
      this.utilityService.triggerSnackbar(unmatchedMessages[0], 'snackbar-danger');
    }
  }

  private clearAllApiErrors(): void {
    for (const [fieldKey, errorCodes] of this.serverErrorKeys) {
      const control = this.form.get(fieldKey);
      if (!control?.errors) continue;
      const remaining = { ...control.errors };
      for (const code of errorCodes) {
        delete remaining[code];
      }
      control.setErrors(Object.keys(remaining).length ? remaining : null);
    }
    this.serverErrorKeys.clear();
  }

  private clearApiErrorsForField(fieldKey: string): void {
    const errorCodes = this.serverErrorKeys.get(fieldKey);
    if (!errorCodes?.length) return;
    const control = this.form.get(fieldKey);
    if (control?.errors) {
      const remaining = { ...control.errors };
      for (const code of errorCodes) {
        delete remaining[code];
      }
      control.setErrors(Object.keys(remaining).length ? remaining : null);
    }
    this.serverErrorKeys.delete(fieldKey);
  }

  private resetFormSubscriptions(): void {
    this.formSubscriptionsTeardown$.next();
  }

  private reloadForm(): void {
    this.resetFormSubscriptions();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.loadForm();
  }
}
