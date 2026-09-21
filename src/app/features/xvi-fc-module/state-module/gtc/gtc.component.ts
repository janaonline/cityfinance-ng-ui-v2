import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getYearRangeDuration } from '../../../../core/validators/year-range.validator';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { FieldSupportingActionEvent } from '../../../../shared/dynamic-form/field.interface';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  CanComponentDeactivate,
  warnBeforeUnloadWhenDirty,
} from '../../../../core/guards/unsaved-changes.guard';
import { GtcService } from './gtc.service';
import {
  ApiErrorMap,
  ApiErrorResponse,
  GtcDraftPayload,
  GtcFinalSubmitPayload,
  GtcInstallment,
  GtcInstallmentAccess,
  GtcPermissions,
  SubmitType,
} from './gtc.models';
import { FormActor, FormProgressComponent, FormStatusValue } from '../../shared/form-progress/form-progress.component';
import { XvifcModuleService } from '../../xvi-fc-module.service';

/** Action id emitted by the download-template supporting-content button. Not tied to one field
 *  key - the backend attaches it to whichever field carries a configured template for the
 *  current design year/installment. */
const GTC_ACTION_DOWNLOAD_TEMPLATE = 'download-template';

@Component({
  selector: 'app-gtc',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    MatTooltipModule,
    FormProgressComponent,
  ],
  templateUrl: './gtc.component.html',
  styleUrl: './gtc.component.scss',
})
export class GtcComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private dynamicService = inject(DynamicFormService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private confirmDialogService = inject(ConfirmDialogService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  private gtcService = inject(GtcService);
  private moduleService = inject(XvifcModuleService);
  public stateName = signal('');
  public actors = signal<FormActor[]>([]);

  readonly installment = signal<GtcInstallment>(1);
  readonly installmentAccess = signal<GtcInstallmentAccess | null>(null);

  /** Backend-driven lock state for installment 2; missing access metadata defaults to locked. */
  readonly isInstallment2Locked = computed(() => this.installmentAccess()?.installment2?.locked ?? true);

  readonly installment2LockReason = computed(
    () => this.installmentAccess()?.installment2?.lockReason ?? 'Installment 2 is not yet available.',
  );

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isDownloadingTemplate = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly permissions = signal<GtcPermissions>({
    canView: true,
    canEdit: true,
    canFinalSubmit: false,
  });
  readonly currentFormStatus = signal<number>(0);
  readonly currentFormStatusLabel = signal('');
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus() as FormStatusValue);

  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Tracks error codes injected per field by the most recent failed API response. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  /** Emits once before each form rebuild so per-form subscriptions are torn down cleanly. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

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

  /** Switches the active installment, tears down stale form state, and reloads the GET form.
   *  No-op when the requested installment is already active or a load is in progress. */
  switchInstallment(installment: GtcInstallment): void {
    if (this.isLoading() || this.installment() === installment) return;
    if (installment === 2 && this.isInstallment2Locked()) return;
    this.resetFormSubscriptions();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.serverErrorKeys.clear();
    this.installment.set(installment);
    this.loadForm();
  }

  private loadForm(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar('Unable to load GTC form. Please try again.', 'snackbar-danger');
      return;
    }

    this.isLoading.set(true);

    this.gtcService
      .getGtcForm(stateId, yearId, this.installment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.currentFormStatus.set(data.currentFormStatus);
          this.currentFormStatusLabel.set(data.currentFormStatusLabel);
          this.fields.set(data.questions);
          this.stateName.set(data.stateName);
          this.actors.set(data.actors);
          this.installmentAccess.set(data.installmentAccess ?? null);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load GTC form', err);
          this.utilityService.triggerSnackbar('Unable to load GTC form. Please try again.', 'snackbar-danger');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * - Create form controls based on the field configurations and add them to the form
   * - Create a dependency index to map controller fields to their dependent fields for visibility
   * - Set up subscriptions for controller fields to update visibility of dependent fields
   * - Derive awardPeriodDuration from awardPeriod so visibility rules can react to it
   * - Disable all controls when canEdit is false
   */
  createFormControls(): void {
    this.isLoading.set(true);

    for (const field of this.fields()) {
      if (!field.key || !field.formFieldType) {
        this.utilityService.triggerSnackbar('Invalid field configuration.', 'snackbar-danger');
        this.isLoading.set(false);
        return;
      }

      // If field is readonly but has no value, make it editable to allow user input
      const hasInitialValue = field.value !== null && field.value !== undefined && field.value !== '';
      field.readonly = !hasInitialValue && field.readonly && field.formFieldType !== 'date' ? false : field.readonly;

      // Create form control with validations and readonly state
      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

    // key: controller field key, value: array of fields whose visibility depends on this controller
    this.dependencyIndex = this.visibilityService.createDependencyIndex(this.fields());

    // Set up visibility bindings for dependent fields based on controller field value changes
    // preserveHiddenValue: true = save the values of hidden fields, if they become visible again, the previous values are retained
    this.visibilityService.bindVisibility({
      form: this.form,
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
      formTeardown$: this.formSubscriptionsTeardown$,
    });

    // Derive awardPeriodDuration from awardPeriod so visibility rules can react to it.
    const awardPeriodControl = this.form.get('awardPeriod');
    const durationControl = this.form.get('awardPeriodDuration') as FormControl<number | null> | null;
    if (awardPeriodControl && durationControl) {
      awardPeriodControl.valueChanges
        .pipe(
          startWith(awardPeriodControl.value),
          map((v) => getYearRangeDuration(v)),
          distinctUntilChanged(),
          takeUntilDestroyed(this.destroyRef),
          takeUntil(this.formSubscriptionsTeardown$),
        )
        .subscribe((duration) => {
          durationControl.setValue(duration, { emitEvent: true });
        });
    }

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }

    this.isLoading.set(false);
  }

  /** Routes supporting-content action button clicks. GTC currently only has the
   *  download-template action, so no field-key filtering is needed. */
  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.actionId === GTC_ACTION_DOWNLOAD_TEMPLATE) {
      this.downloadTemplate();
    }
  }

  /** Fetches the signed template URL and opens it in a new tab - the backend serves a
   *  time-limited signed URL, not a blob, so there's nothing to save client-side. */
  downloadTemplate(): void {
    if (this.isDownloadingTemplate()) return;
    this.isDownloadingTemplate.set(true);

    this.gtcService
      .getGtcTemplate(this.stateId, this.yearId, this.installment())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (template) => {
          window.open(template.url, '_blank', 'noopener,noreferrer');
          this.isDownloadingTemplate.set(false);
        },
        error: (err: unknown) => {
          const response = this.extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            response?.message ?? 'Failed to download template.',
            'snackbar-danger',
          );
          this.isDownloadingTemplate.set(false);
        },
      });
  }

  onSubmit(action: SubmitType): void {
    if (action === 'finalSubmit' && this.installment() === 2 && this.isInstallment2Locked()) {
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
   * Determines whether the form passes validation for the given submit action.
   *
   * For `finalSubmit`: every error on visible controls must be absent.
   * For `saveAsDraft`: plain `required` errors are skipped (empty fields are allowed in a
   * draft).
   */
  private isValidForSubmitType(action: SubmitType): boolean {
    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (!control?.errors) continue;

      for (const errorKey of Object.keys(control.errors)) {
        if (action === 'saveAsDraft' && errorKey === 'required') continue;
        return false;
      }
    }

    return true;
  }

  private executeSaveDraft(): void {
    this.clearAllApiErrors();
    this.isSavingDraft.set(true);

    const payload: GtcDraftPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      data: this.visibilityService.getVisiblePayload(this.form, this.fields()),
    };

    this.gtcService
      .saveGtcDraft(payload)
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

    const payload: GtcFinalSubmitPayload = {
      stateId: this.stateId,
      yearId: this.yearId,
      installment: this.installment(),
      data: this.visibilityService.getVisiblePayload(this.form, this.fields()),
    };

    this.gtcService
      .finalSubmitGtc(payload)
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

  /**
   * Extracts a structured error response from two possible error shapes:
   * 1. `HttpErrorResponse` (HTTP 4xx): body is in `err.error` with `{ statusCode, message, errors }`.
   * 2. Service map throw (2xx with success:false): `err` itself is `{ success, message, errors }`.
   */
  private extractApiErrorResponse(err: unknown): ApiErrorResponse | null {
    if (!this.isObject(err)) return null;

    // HTTP 4xx - Angular puts the parsed body in err.error
    const errorBody = err['error'];
    if (this.isObject(errorBody)) {
      if (typeof errorBody['message'] === 'string') {
        return {
          statusCode: typeof errorBody['statusCode'] === 'number' ? errorBody['statusCode'] : undefined,
          message: errorBody['message'],
          errors: this.isApiErrorMap(errorBody['errors']) ? errorBody['errors'] : undefined,
        };
      }
    }

    // 2xx with success:false - service map threw the response object directly
    if (err['success'] === false && typeof err['message'] === 'string') {
      return {
        message: err['message'],
        errors: this.isApiErrorMap(err['errors']) ? err['errors'] : undefined,
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

  /**
   * Maps backend field errors into the existing dynamic-form validation system.
   *
   * Two steps:
   * 1. Update the `fields` signal so each field's `validations` array contains an entry
   *    matching the backend error `code` with the backend error `message`. This lets the
   *    sub-component's existing `hasError(key, name)` + `{{ validation.message }}` flow
   *    render the error without any API-specific template code.
   * 2. Set the corresponding Angular error key (using `error.code`) on the matching form
   *    control so `hasError()` returns `true` for that validation name.
   */
  private applyApiErrors(errors: ApiErrorMap): void {
    this.fields.update((fields) =>
      fields.map((field) => {
        const fieldErrors = errors[field.key ?? ''];
        if (!fieldErrors?.length) return field;

        // Don't inject validation entries for fields that are currently hidden.
        if (field.hidden) return field;

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

      if (!control) {
        console.warn(`[GTC] API error for unknown field: ${actualKey}`);
        continue;
      }

      // Don't apply errors to fields that are currently hidden.
      if (fieldConfig?.hidden) continue;

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

  /** Remove server-injected error keys from controls before the next API call. */
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

  private resetFormSubscriptions(): void {
    this.formSubscriptionsTeardown$.next();
  }

  /** Reset the form group and reload fresh data from the API. */
  private reloadForm(): void {
    this.resetFormSubscriptions();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.loadForm();
  }

  onCancel(): void {
    this.confirmDialogService
      .confirm(undefined, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
      });
  }
}
