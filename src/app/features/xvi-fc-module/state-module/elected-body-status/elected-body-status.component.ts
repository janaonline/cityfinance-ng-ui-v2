import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import {
  ConfirmDialogData,
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import {
  ApiErrorMap,
  EulbFinalSubmitPayload,
  EulbFileValue,
  EulbFormPayloadData,
  EulbPermissions,
  EulbRevalidateExcelResponse,
  EulbRowsDialogResult,
  EulbSaveDraftPayload,
  SubmitType,
} from './eulb-status.models';
import {
  buildEulbFinalSubmitPayloadData,
  buildEulbFormPayloadData,
  extractApiErrorResponse,
  getHttpStatus,
  hasEulbFileValue,
  hasPersistedValidationData,
  isValidEulbFileValue,
} from './eulb-status.utils';
import { EulbStatusService } from './eulb-status.service';
import { EulbRowsDialogComponent } from './eulb-rows-dialog/eulb-rows-dialog.component';
import {
  FORM_STATUS,
  FormActor,
  FormProgressComponent,
  FormStatusValue,
} from '../../shared/form-progress/form-progress.component';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons. */
const EULB_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
  VIEW_UPLOADED_DATA: 'view-uploaded-data',
  DOWNLOAD_ERROR_SHEET: 'download-error-sheet',
  REVALIDATE_EXCEL: 'revalidate-excel',
} as const;

/**
 * Page component for the Elected Urban Local Bodies status-confirmation form.
 * Renders a backend-driven dynamic form, handles Excel upload/validation,
 * and delegates action routing from supporting-content buttons to the appropriate handlers.
 */
@Component({
  selector: 'app-elected-body-status',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    FormProgressComponent,
  ],
  templateUrl: './elected-body-status.component.html',
  styleUrl: './elected-body-status.component.scss',
})
export class ElectedBodyStatusComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  private readonly eulbService = inject(EulbStatusService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly dialog = inject(MatDialog);

  readonly stateName = signal('');
  readonly actors = signal<FormActor[]>([]);

  /** Current numeric form status; used by the form-progress card. */
  readonly formStatus = signal<FormStatusValue>(FORM_STATUS.NO_STATUS);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly rowEditFields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isValidating = signal(false);
  readonly isDeleting = signal(false);
  readonly isDownloadingTemplate = signal(false);
  readonly isDownloadingErrorSheet = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly permissions = signal<EulbPermissions>({ canView: true, canEdit: true, canFinalSubmit: false });
  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  /** Maps field keys to their dependency relationships for reactive visibility evaluation. */
  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  /** Tracks API-injected error keys per control so they can be cleared before re-submission. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

  /** Guards the delete trigger from firing during form hydration, programmatic file restoration, or a concurrent delete. */
  private isHydratingForm = false;
  private isRestoringExcelFile = false;
  private isDeleteExcelDialogOpen = false;

  /** Last file value confirmed by the backend (GET response or validate-excel success). */
  private lastPersistedExcelFile: EulbFileValue | null = null;

  /**
   * Field errors captured from a validate-excel HTTP error that also contained persisted data.
   * Consumed and cleared in `createFormControls` so they are stamped onto the rebuilt controls.
   */
  private pendingPostReloadErrors: ApiErrorMap | null = null;

  /** Reference to the rows dialog so it can be closed programmatically on delete success. */
  private rowsDialogRef: MatDialogRef<EulbRowsDialogComponent> | null = null;

  /** State ID read from localStorage `userData`. Returns empty string if absent or unparseable. */
  private get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  /** Active year ID from the parent XVI-FC module context. */
  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadForm();
  }

  /**
   * Fetches form config and initial state from the API, then builds reactive form controls.
   * Aborts with a snackbar if `stateId` or `yearId` is missing.
   */
  private loadForm(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to load the form. State or year information is missing.',
        'snackbar-danger',
      );
      return;
    }

    this.isHydratingForm = true;
    this.isLoading.set(true);

    this.eulbService
      .getFormData(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.stateName.set(data.stateName ?? '');
          this.actors.set(data.actors ?? []);
          this.formStatus.set(data.currentFormStatus as FormStatusValue);

          const fileField = data.questions.find((q) => q.key === 'electedBodyExcelFile');
          this.lastPersistedExcelFile = isValidEulbFileValue(fileField?.value) ? fileField.value : null;

          this.fields.set(data.questions);
          this.rowEditFields.set(data.rowEditFields ?? []);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: () => {
          this.isHydratingForm = false;
          this.utilityService.triggerSnackbar('Unable to load the form. Please try again.', 'snackbar-danger');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Registers a `FormControl` for every field in `this.fields`, wires up visibility bindings,
   * disables the form when the user lacks edit permission, and starts the validation trigger.
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
      field.readonly = !hasInitialValue && field.readonly && field.formFieldType !== 'date' ? false : field.readonly;

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
   * Subscribes to `electedBodyExcelFile` and `ulbCount` value changes.
   * A new valid file upload clears stale file API errors then auto-triggers Excel validation
   * if `ulbCount` is already populated. Editing `ulbCount` clears its stale API errors.
   */
  private setupValidationTrigger(): void {
    const fileControl = this.form.get('electedBodyExcelFile') as FormControl | null;
    const ulbCountControl = this.form.get('ulbCount') as FormControl | null;

    if (fileControl) {
      fileControl.valueChanges
        .pipe(
          filter(isValidEulbFileValue),
          takeUntil(this.formSubscriptionsTeardown$),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          if (this.isRestoringExcelFile) return;
          this.clearApiErrorsForField('electedBodyExcelFile');
          if (this.hasValidUlbCount()) {
            this.triggerExcelValidation();
          }
        });
    }

    if (ulbCountControl) {
      ulbCountControl.valueChanges
        .pipe(takeUntil(this.formSubscriptionsTeardown$), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.clearApiErrorsForField('ulbCount');
        });
    }
  }

  /** Returns `true` when the `ulbCount` control holds a positive number. */
  private hasValidUlbCount(): boolean {
    const count = this.form.get('ulbCount')?.value;
    return typeof count === 'number' && count > 0;
  }

  /**
   * Calls the validate-excel API with the current file and ULB count.
   * On success (VALID or INVALID HTTP 200), reloads the form so backend-driven
   * supporting content reflects the latest validation state.
   * On HTTP error with no persisted data, applies field-level API errors directly without reloading.
   * On HTTP error that still carries saved file/summary data, stores field errors in
   * `pendingPostReloadErrors` and reloads; `createFormControls` re-stamps them onto the new controls.
   */
  private triggerExcelValidation(): void {
    if (this.isValidating()) return;

    const fileValue = this.form.get('electedBodyExcelFile')?.value;
    const ulbCount = this.form.get('ulbCount')?.value;

    if (!isValidEulbFileValue(fileValue) || typeof ulbCount !== 'number' || !ulbCount) return;

    this.isValidating.set(true);
    this.utilityService.triggerSnackbar('Excel uploaded. Verifying data…');

    this.eulbService
      .validateExcel({ stateId: this.stateId, yearId: this.yearId, ulbCount, electedBodyExcelFile: fileValue })
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
              'Excel validation completed with errors. Please review uploaded data.',
              'snackbar-danger',
            );
          }
          this.reloadForm();
        },
        error: (err: unknown) => {
          const response = extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            response?.message ?? 'Excel validation failed. Please try again.',
            'snackbar-danger',
          );
          if (hasPersistedValidationData(err)) {
            if (response?.errors) {
              this.pendingPostReloadErrors = response.errors;
            }
            this.reloadForm();
          } else if (response?.errors) {
            this.applyApiErrors(response.errors);
          }
        },
      });
  }

  /** Re-validates the already-uploaded Excel when ulbCount changes without a new file upload. */
  private revalidateUploadedExcel(): void {
    if (this.isValidating()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    const ulbCount = this.form.get('ulbCount')?.value;
    if (typeof ulbCount !== 'number' || !ulbCount) return;

    this.clearAllApiErrors();
    this.isValidating.set(true);

    this.eulbService
      .revalidateUploadedExcel(stateId, yearId, ulbCount)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isValidating.set(false)),
      )
      .subscribe({
        next: (res: EulbRevalidateExcelResponse) => {
          this.utilityService.triggerSnackbar(res.message);
          this.reloadForm();
        },
        error: (err: unknown) => {
          const response = extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            response?.message ?? 'Revalidation failed. Please try again.',
            'snackbar-danger',
          );
          if (response?.errors) {
            this.applyApiErrors(response.errors);
          }
        },
      });
  }

  /** Downloads the EULB Excel template as a blob and saves it via FileSaver. */
  downloadTemplate(): void {
    if (this.isDownloadingTemplate()) return;
    this.isDownloadingTemplate.set(true);

    this.eulbService
      .downloadTemplate(this.stateId, this.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, 'elected-bodies-template.xlsx');
          this.isDownloadingTemplate.set(false);
        },
        error: () => {
          this.utilityService.triggerSnackbar('Failed to download template.', 'snackbar-danger');
          this.isDownloadingTemplate.set(false);
        },
      });
  }

  /**
   * Opens the full-screen rows dialog for reviewing uploaded EULB data.
   * Reloads the form when the dialog closes with an updated summary so backend-driven
   * action/badge state is refreshed.
   */
  openRowsDialog(): void {
    const panelClass = [...(this.themeClass ? [this.themeClass] : []), 'eulb-rows-dialog-panel'];
    this.rowsDialogRef = this.dialog.open(EulbRowsDialogComponent, {
      panelClass,
      width: '95vw',
      maxWidth: '95vw',
      height: '95vh',
      maxHeight: '95vh',
      data: {
        stateId: this.stateId,
        yearId: this.yearId,
        rowEditFields: this.rowEditFields(),
        canEdit: this.canEdit(),
      },
    });

    this.rowsDialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: EulbRowsDialogResult | undefined) => {
        this.rowsDialogRef = null;
        if (result?.updatedSummary) {
          this.reloadForm();
        }
      });
  }

  /**
   * Routes action events emitted by `FieldSupportingContentComponent` for the
   * `electedBodyExcelFile` field to the appropriate handler method.
   * @param event - Action event containing `fieldKey` and `actionId`.
   */
  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey !== 'electedBodyExcelFile') return;
    switch (event.actionId) {
      case EULB_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE:
        this.downloadTemplate();
        return;
      case EULB_SUPPORTING_ACTION.VIEW_UPLOADED_DATA:
        this.openRowsDialog();
        return;
      case EULB_SUPPORTING_ACTION.DOWNLOAD_ERROR_SHEET:
        this.downloadErrorSheet();
        return;
      case EULB_SUPPORTING_ACTION.REVALIDATE_EXCEL:
        this.revalidateUploadedExcel();
        return;
      default:
        return;
    }
  }

  /**
   * Fetches the error sheet on demand from the backend and saves it as a blob.
   * Shows distinct snackbar messages for a 400 (no data) vs other errors.
   */
  downloadErrorSheet(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId || this.isDownloadingErrorSheet()) return;

    this.isDownloadingErrorSheet.set(true);

    this.eulbService
      .downloadErrorSheet(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, 'elected-bodies-error-sheet.xlsx');
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

  /**
   * Validates the form for the given submit type, then shows a confirm dialog
   * before delegating to `executeSaveDraft` or `executeFinalSubmit`.
   * @param action - `'saveAsDraft'` or `'finalSubmit'`.
   */
  onSubmit(action: SubmitType): void {
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
    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;

    this.confirmDialogService
      .confirm(dialogData, config)
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
   * Checks every visible field's control for errors.
   * For `saveAsDraft`, plain `required` errors (without `requiredTrue`) are ignored.
   * @param action - The submit type being validated.
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

  /** Clears previous API errors, posts the visible payload as a draft, then reloads the form on success. */
  private executeSaveDraft(): void {
    this.clearAllApiErrors();
    this.isSavingDraft.set(true);

    const visiblePayload = this.getVisibleEulbPayloadData();
    const payload: EulbSaveDraftPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      data: visiblePayload,
    };

    this.eulbService
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
    const finalSubmitData = buildEulbFinalSubmitPayloadData(visiblePayload);

    if (!finalSubmitData) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
      return;
    }

    this.isFinalSubmitting.set(true);

    const payload: EulbFinalSubmitPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      data: finalSubmitData,
    };

    this.eulbService
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

  /**
   * Extracts a structured error from an API failure, shows the message as a snackbar,
   * and stamps field-level errors onto form controls when present.
   * @param err - Raw error from the HTTP observable.
   * @param fallbackMessage - Shown if the error body carries no message.
   */
  private handleSubmitError(err: unknown, fallbackMessage: string): void {
    const response = extractApiErrorResponse(err);
    this.utilityService.triggerSnackbar(response?.message ?? fallbackMessage, 'snackbar-danger');
    if (response?.errors) {
      this.applyApiErrors(response.errors);
    }
  }

  /**
   * Stamps API-returned field errors onto both the `fields` signal (for message display)
   * and the corresponding `FormControl` (for invalid state). Skips hidden fields.
   * Records each error key in `serverErrorKeys` so it can be cleared before re-submission.
   * @param errors - Map of field key → array of API error descriptors.
   */
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

    for (const [fieldKey, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors.length) continue;

      const actualKey = fieldErrors[0]?.field ?? fieldKey;
      const fieldConfig = this.fields().find((f) => f.key === actualKey);
      const control = this.form.get(actualKey);

      if (!control || fieldConfig?.hidden) continue;

      const errorMap = fieldErrors.reduce<Record<string, true>>((acc, error) => {
        if (error.code) acc[error.code] = true;
        return acc;
      }, {});

      control.setErrors({ ...(control.errors ?? {}), ...errorMap });
      control.markAsTouched();
      control.markAsDirty();

      this.serverErrorKeys.set(actualKey, [...(this.serverErrorKeys.get(actualKey) ?? []), ...Object.keys(errorMap)]);
    }
  }

  /**
   * Removes all error keys previously injected by `applyApiErrors` from their controls,
   * then clears the `serverErrorKeys` tracker. Called before every submit attempt.
   */
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

  /** Removes API-injected error codes for a single field without disturbing other controls. */
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

  /** Tears down the current form and field state, then fetches fresh data from the API. */
  private reloadForm(): void {
    this.resetFormSubscriptions();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.loadForm();
  }

  /** Ends subscriptions that are bound to controls from the current dynamic form instance. */
  private resetFormSubscriptions(): void {
    this.formSubscriptionsTeardown$.next();
  }

  /** Builds the draft payload data from currently visible dynamic-form controls. */
  private getVisibleEulbPayloadData(): EulbFormPayloadData {
    return buildEulbFormPayloadData(this.visibilityService.getVisiblePayload(this.form, this.fields()));
  }

  /**
   * Subscribes to `electedBodyExcelFile` value changes and triggers the delete flow
   * whenever the control is cleared while a backend-persisted file exists.
   * Guards against emissions during hydration, restoration, or concurrent async operations.
   */
  private setupDeleteTrigger(): void {
    const fileControl = this.form.get('electedBodyExcelFile') as FormControl | null;
    if (!fileControl) return;

    fileControl.valueChanges
      .pipe(takeUntil(this.formSubscriptionsTeardown$), takeUntilDestroyed(this.destroyRef))
      .subscribe((currentValue: unknown) => {
        if (this.isHydratingForm || this.isRestoringExcelFile) return;
        if (!hasEulbFileValue(currentValue)) {
          this.clearApiErrorsForField('electedBodyExcelFile');
        }
        if (this.isDeleteExcelDialogOpen || this.isDeleting()) return;
        if (!this.lastPersistedExcelFile) return;
        if (hasEulbFileValue(currentValue)) return;
        if (!this.canEdit()) return;
        if (this.isLoading() || this.isValidating() || this.isSubmitting()) return;

        this.confirmAndDeleteExcel();
      });
  }

  /**
   * Shows a confirmation dialog before proceeding with Excel deletion.
   * Restores the previous file value if the user cancels.
   */
  private confirmAndDeleteExcel(): void {
    this.isDeleteExcelDialogOpen = true;

    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
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
      .confirm(dialogData, config)
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
   * Restores the last backend-persisted file value into the file control.
   * Uses the default emitEvent so Angular's AbstractControl.events fires and the file component's
   * internal fileValueSnapshot signal updates — necessary because FileComponent.bindFileValueState
   * subscribes to source.events, which is gated by emitEvent. Callers set isRestoringExcelFile
   * before this runs so valueChanges subscribers skip the delete/validation re-trigger paths.
   */
  private restoreExcelFileControl(): void {
    const fileControl = this.form.get('electedBodyExcelFile') as FormControl | null;
    if (!fileControl || !isValidEulbFileValue(this.lastPersistedExcelFile)) return;
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

  /**
   * Calls the DELETE API to remove the uploaded Excel and its row dataset.
   * On success, resets local state, closes the rows dialog if open, and reloads the form.
   * On failure, restores the file control value and shows the backend error message.
   */
  private executeDeleteExcel(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    this.isDeleting.set(true);

    this.eulbService
      .deleteUploadedExcel(stateId, yearId)
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
          this.rowsDialogRef?.close();
          this.rowsDialogRef = null;
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

  /** Shows a cancel confirmation dialog; notifies the user if the action is confirmed. */
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
}
