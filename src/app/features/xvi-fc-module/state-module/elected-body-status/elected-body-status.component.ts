import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import FileSaver from 'file-saver';
import { filter } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import {
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
  ApiErrorResponse,
  EulbFileValue,
  EulbFormActor,
  EulbPermissions,
  EulbRowsDialogResult,
  EulbSaveDraftPayload,
  EulbValidationSummary,
  SubmitType,
} from './eulb-status.models';
import { EulbStatusService } from './eulb-status.service';
import { EulbRowsDialogComponent } from './eulb-rows-dialog/eulb-rows-dialog.component';

const EULB_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
  VIEW_UPLOADED_DATA: 'view-uploaded-data',
  DOWNLOAD_ERROR_SHEET: 'download-error-sheet',
} as const;

@Component({
  selector: 'app-elected-body-status',
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent, PreLoaderComponent, MatButtonModule, DatePipe],
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
  readonly actors = signal<EulbFormActor[]>([]);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isValidating = signal(false);
  readonly isDownloadingTemplate = signal(false);
  readonly isDownloadingErrorSheet = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly permissions = signal<EulbPermissions>({ canView: true, canEdit: true, canFinalSubmit: false });
  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  readonly validationSummary = signal<EulbValidationSummary | null>(null);
  readonly errorExcelFile = signal<EulbFileValue | null>(null);
  readonly hasUploadedData = computed(() => {
    const s = this.validationSummary();
    return s != null && s.excelRowCount > 0;
  });

  /** Fields enriched with reactive `type: 'actions'` supporting content for rendering. */
  readonly fieldsForRenderer = computed((): ConditionalFieldConfig[] => {
    const summary = this.validationSummary();
    const hasData = this.hasUploadedData();
    const validating = this.isValidating();
    const downloadingTpl = this.isDownloadingTemplate();
    const downloadingErr = this.isDownloadingErrorSheet();

    return this.fields().map((f): ConditionalFieldConfig => {
      if (f.key !== 'electedBodyExcelFile') return f;

      const baseContent = (f.supportingContent ?? []).filter((sc) => sc.type !== 'template-download');
      const actionsItem = {
        type: 'actions' as const,
        position: 'before' as const,
        layout: 'inline' as const,
        separator: 'dot' as const,
        description: 'Fill in the details and re-upload as a single Excel file.',
        actions: [
          {
            id: EULB_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE,
            label: 'Download the template',
            icon: 'bi bi-file-earmark-arrow-down',
            tone: 'primary' as const,
            loading: downloadingTpl,
            loadingLabel: 'Downloading…',
          },
          {
            id: EULB_SUPPORTING_ACTION.VIEW_UPLOADED_DATA,
            label: 'View uploaded data',
            icon: 'bi bi-table',
            tone: 'primary' as const,
            visible: hasData,
          },
          {
            id: EULB_SUPPORTING_ACTION.DOWNLOAD_ERROR_SHEET,
            label: 'Download error sheet',
            icon: 'bi bi-file-earmark-excel',
            tone: 'danger' as const,
            visible: (summary?.errorRowCount ?? 0) > 0,
            loading: downloadingErr,
            loadingLabel: 'Downloading…',
          },
          {
            id: 'validating-indicator',
            label: 'Validating…',
            tone: 'muted' as const,
            visible: validating,
            loading: validating,
            disabled: true,
          },
        ],
        badges: summary
          ? [
              { label: `Total rows: ${summary.excelRowCount}`, tone: 'secondary' as const },
              ...(summary.validationStatus === 'VALID'
                ? [{ label: 'All valid', icon: 'bi bi-check-circle-fill', tone: 'success' as const }]
                : []),
              ...(summary.errorRowCount > 0
                ? [{ label: `${summary.errorRowCount} error(s)`, tone: 'danger' as const }]
                : []),
              ...(summary.missingDbUlbCount > 0
                ? [{ label: `${summary.missingDbUlbCount} missing ULB(s)`, tone: 'warning' as const }]
                : []),
            ]
          : [],
      };

      return { ...f, supportingContent: [...baseContent, actionsItem] };
    });
  });

  readonly visibleFieldsForRenderer = computed(() => this.visibilityService.getVisibleFields(this.fieldsForRenderer()));

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  private readonly serverErrorKeys = new Map<string, string[]>();

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

  ngOnInit(): void {
    this.loadForm();
  }

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

    this.isLoading.set(true);

    this.eulbService
      .getFormData(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.stateName.set(data.stateName ?? '');
          this.actors.set(data.actors ?? []);
          this.validationSummary.set(data.validationSummary ?? null);
          this.errorExcelFile.set(data.errorExcelFile ?? data.response?.errorExcelFile ?? null);

          this.fields.set(data.questions);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: () => {
          this.utilityService.triggerSnackbar('Unable to load the form. Please try again.', 'snackbar-danger');
          this.isLoading.set(false);
        },
      });
  }

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
    this.isLoading.set(false);
  }

  private setupValidationTrigger(): void {
    const fileControl = this.form.get('electedBodyExcelFile') as FormControl | null;
    if (!fileControl) return;

    fileControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((val) => this.isValidFileValue(val)),
      )
      .subscribe(() => {
        if (this.hasValidUlbCount()) {
          this.triggerExcelValidation();
        }
      });
  }

  private isValidFileValue(val: unknown): boolean {
    if (!val || typeof val !== 'object') return false;
    const file = val as { fileName?: string; fileUrl?: string };
    return !!(file.fileName && file.fileUrl);
  }

  private hasValidUlbCount(): boolean {
    const count = this.form.get('ulbCount')?.value;
    return typeof count === 'number' && count > 0;
  }

  private triggerExcelValidation(): void {
    if (this.isValidating()) return;

    const fileValue = this.form.get('electedBodyExcelFile')?.value as unknown as EulbFileValue | null;
    const ulbCount = this.form.get('ulbCount')?.value as unknown as number;

    if (!fileValue || !ulbCount) return;

    this.isValidating.set(true);

    this.eulbService
      .validateExcel({ stateId: this.stateId, yearId: this.yearId, ulbCount, electedBodyExcelFile: fileValue })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isValidating.set(false);
          this.validationSummary.set(res.data.summary);
          this.errorExcelFile.set(res.data.errorExcelFile ?? null);

          if (res.data.validationStatus === 'VALID') {
            this.utilityService.triggerSnackbar('Excel validated successfully.');
          } else {
            this.utilityService.triggerSnackbar(
              'Excel validation completed with errors. Please review uploaded data.',
              'snackbar-danger',
            );
          }
        },
        error: (err: unknown) => {
          this.isValidating.set(false);
          const response = this.extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            response?.message ?? 'Excel validation failed. Please try again.',
            'snackbar-danger',
          );
          if (response?.errors) {
            this.applyApiErrors(response.errors);
          }
        },
      });
  }

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

  openRowsDialog(): void {
    const config = this.themeClass ? { panelClass: this.themeClass } : {};
    const dialogRef = this.dialog.open(EulbRowsDialogComponent, {
      ...config,
      width: '90vw',
      maxWidth: '90vw',
      height: '90vh',
      data: { stateId: this.stateId, yearId: this.yearId },
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((result): result is EulbRowsDialogResult => !!result?.updatedSummary),
      )
      .subscribe((result) => {
        this.validationSummary.set(result.updatedSummary!);
      });
  }

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
      default:
        return;
    }
  }

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
          const status = (err as { status?: number })?.status;
          const message =
            status === 400
              ? 'No uploaded data found to generate error sheet.'
              : 'Failed to download error sheet. Please try again.';
          this.utilityService.triggerSnackbar(message, 'snackbar-danger');
        },
      });
  }

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

  private executeSaveDraft(): void {
    this.clearAllApiErrors();
    this.isSavingDraft.set(true);

    const visiblePayload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const payload: EulbSaveDraftPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      data: {
        ulbCount: visiblePayload['ulbCount'] as number | undefined,
        electedBodyExcelFile: visiblePayload['electedBodyExcelFile'] as EulbFileValue | undefined,
        checkboxConfirmation: visiblePayload['checkboxConfirmation'] as boolean | undefined,
      },
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

  private executeFinalSubmit(): void {
    this.clearAllApiErrors();
    this.isFinalSubmitting.set(true);

    const visiblePayload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const payload = {
      stateId: this.stateId,
      yearId: this.yearId,
      data: {
        ulbCount: visiblePayload['ulbCount'] as number,
        electedBodyExcelFile: visiblePayload['electedBodyExcelFile'] as EulbFileValue,
        checkboxConfirmation: visiblePayload['checkboxConfirmation'] as boolean,
      },
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

  private handleSubmitError(err: unknown, fallbackMessage: string): void {
    const response = this.extractApiErrorResponse(err);
    this.utilityService.triggerSnackbar(response?.message ?? fallbackMessage, 'snackbar-danger');
    if (response?.errors) {
      this.applyApiErrors(response.errors);
    }
  }

  private extractApiErrorResponse(err: unknown): ApiErrorResponse | null {
    if (!this.isObject(err)) return null;

    const httpError = err as { error?: unknown };
    if (this.isObject(httpError.error)) {
      const body = httpError.error as Record<string, unknown>;
      if (typeof body['message'] === 'string') {
        return {
          statusCode: typeof body['statusCode'] === 'number' ? body['statusCode'] : undefined,
          message: body['message'],
          errors: this.isApiErrorMap(body['errors']) ? (body['errors'] as ApiErrorMap) : undefined,
        };
      }
    }

    const plainErr = err as Record<string, unknown>;
    if (plainErr['success'] === false && typeof plainErr['message'] === 'string') {
      return {
        message: plainErr['message'],
        errors: this.isApiErrorMap(plainErr['errors']) ? (plainErr['errors'] as ApiErrorMap) : undefined,
      };
    }

    return null;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isApiErrorMap(value: unknown): value is ApiErrorMap {
    if (!this.isObject(value)) return false;
    return Object.values(value).every(
      (fieldErrors) =>
        Array.isArray(fieldErrors) &&
        fieldErrors.every((error: unknown) => this.isObject(error) && typeof error['message'] === 'string'),
    );
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

  private reloadForm(): void {
    this.form = this.fb.group({});
    this.fields.set([]);
    this.loadForm();
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
}
