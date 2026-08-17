import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { UtilityService } from '../../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { environment } from '../../../../../../environments/environment';
import { SlbService } from './slb.service';
import {
  ApiErrorMap,
  ApiErrorResponse,
  SlbDraftPayload,
  SlbFinalSubmitPayload,
  SlbPermissions,
  SubmitType,
} from './slb.models';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { PageErrorStateComponent } from '../../../shared/page-error-state/page-error-state.component';

export interface SlbIndicatorGroup {
  section: string;
  fields: ConditionalFieldConfig[];
}

/**
 * The backend's SLB field config carries a `meta.section` grouping key that isn't part of the
 * shared `FieldConfig` interface. Widening that shared interface previously caused spurious
 * whole-program compile errors elsewhere (see slb `actualTarget` changelog) — so this narrow,
 * locally-scoped type is used only for reading `meta` off an already-fetched field instead.
 */
type FieldWithMeta = ConditionalFieldConfig & { meta?: Record<string, unknown> };

@Component({
  selector: 'app-slb',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    PageErrorStateComponent,
  ],
  templateUrl: './slb.component.html',
  styleUrl: './slb.component.scss',
})
export class SlbComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private dynamicService = inject(DynamicFormService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private confirmDialogService = inject(ConfirmDialogService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  private slbService = inject(SlbService);
  private moduleService = inject(XvifcModuleService);
  public ulbName = signal('');
  /** Target FY label (e.g. "2026-27") — heads the Target Indicator column. */
  readonly yearLabel = signal('');
  /** Prior FY label (e.g. "2025-26") — heads the Actual Indicator column; actuals are always
   *  reported for the completed year before the target being set. */
  readonly actualYearLabel = signal<string | null>(null);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  /** The 28 SLB indicator questions, rendered as table rows. */
  readonly indicatorFields = computed(() => this.visibleFields().filter((f) => f.formFieldType === 'actualTarget'));
  /** Indicator fields bucketed by `meta.section` (Water Supply, Sewerage Management, Solid Waste Management, Storm Water Drainage),
   *  preserving indicator order within each section and section order of first appearance. */
  readonly groupedIndicatorFields = computed<SlbIndicatorGroup[]>(() => {
    const groups: SlbIndicatorGroup[] = [];
    const bySection = new Map<string, SlbIndicatorGroup>();

    for (const field of this.indicatorFields()) {
      const section = ((field as FieldWithMeta).meta?.['section'] as string | undefined) ?? '';
      let group = bySection.get(section);
      if (!group) {
        group = { section, fields: [] };
        bySection.set(section, group);
        groups.push(group);
      }
      group.fields.push(field);
    }

    return groups;
  });
  /** Self-declaration fields (name, designation, supporting document, confirmation) — rendered via the generic form renderer. */
  readonly declarationFields = computed(() => this.visibleFields().filter((f) => f.formFieldType !== 'actualTarget'));
  /** Text inputs (name, designation) within the declaration — laid out two-per-row. */
  readonly declarationTextFields = computed(() => this.declarationFields().filter((f) => f.formFieldType === 'text'));
  /** Non-text declaration fields (supporting document, confirmation checkbox) — laid out full-width. */
  readonly declarationOtherFields = computed(() => this.declarationFields().filter((f) => f.formFieldType !== 'text'));

  readonly isLoading = signal(false);
  readonly hasLoadError = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly permissions = signal<SlbPermissions>({
    canView: true,
    canEdit: true,
    canFinalSubmit: false,
  });
  readonly currentFormStatusLabel = signal('');

  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  /** Dev/staging-only helper: shows the "Fill test data" button so QA can exercise the form without manual data entry. */
  readonly isProduction = environment.isProduction;

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Tracks error codes injected per field by the most recent failed API response. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  /** Emits once before each form rebuild so per-form subscriptions are torn down cleanly. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

  private get ulbId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { ulb?: string }).ulb ?? '') : '';
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
    const ulbId = this.ulbId;
    const yearId = this.yearId;

    if (!ulbId || !yearId) {
      this.hasLoadError.set(true);
      return;
    }

    this.isLoading.set(true);
    this.hasLoadError.set(false);

    this.slbService
      .getSlbForm(ulbId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.currentFormStatusLabel.set(data.currentFormStatusLabel);
          this.fields.set(data.questions);
          this.ulbName.set(data.ulbName);
          this.yearLabel.set(data.designYear);
          this.actualYearLabel.set(data.actualYearLabel);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load SLB form', err);
          this.hasLoadError.set(true);
          this.isLoading.set(false);
        },
      });
  }

  retryLoadForm(): void {
    this.loadForm();
  }

  /**
   * - Create form controls based on the field configurations and add them to the form
   * - Create a dependency index to map controller fields to their dependent fields for visibility
   * - Set up subscriptions for controller fields to update visibility of dependent fields
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

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }

    this.isLoading.set(false);
  }

  /** Checks a named validation error on an indicator's `actual`/`target` sub-control, only after it's been touched. */
  hasIndicatorError(key: string, sub: 'actual' | 'target', name: string): boolean {
    const control = this.form.get(`${key}.${sub}`);
    return !!control?.hasError(name) && (control.touched || control.dirty);
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
   * For `saveAsDraft`: every required-style error is skipped (empty fields — including an
   * unchecked self-declaration checkbox — are allowed in a draft); every other error still
   * blocks. Angular reports `requiredTrue` under the same `required` error key as plain
   * `required`, so both are skipped identically here — a draft is work in progress, not a
   * certification.
   *
   * `actualTarget` fields store their `required` validator on the nested `actual`/`target`
   * sub-controls rather than the parent group (see `createActualTargetGroup`), so the group's
   * own `.errors` is always null — they must be checked sub-control by sub-control instead.
   */
  private isValidForSubmitType(action: SubmitType): boolean {
    const hasBlockingError = (control: AbstractControl | null): boolean => {
      if (!control?.errors) return false;
      return Object.keys(control.errors).some((errorKey) => !(action === 'saveAsDraft' && errorKey === 'required'));
    };

    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;

      if (field.formFieldType === 'actualTarget') {
        if (
          hasBlockingError(this.form.get(`${field.key}.actual`)) ||
          hasBlockingError(this.form.get(`${field.key}.target`))
        ) {
          return false;
        }
        continue;
      }

      if (hasBlockingError(this.form.get(field.key))) return false;
    }

    return true;
  }

  private executeSaveDraft(): void {
    this.clearAllApiErrors();
    this.isSavingDraft.set(true);

    const payload: SlbDraftPayload = {
      ulbId: this.ulbId,
      yearId: this.yearId,
      data: this.visibilityService.getVisiblePayload(this.form, this.fields()),
    };

    this.slbService
      .saveSlbDraft(payload)
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

    const payload: SlbFinalSubmitPayload = {
      ulbId: this.ulbId,
      yearId: this.yearId,
      data: this.visibilityService.getVisiblePayload(this.form, this.fields()),
    };

    this.slbService
      .finalSubmitSlb(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFinalSubmitting.set(false);
          this.utilityService.triggerSnackbar('SLB form submitted to State DMA successfully.');
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
   *    matching the backend error `code` with the backend error `message`.
   * 2. Set the corresponding Angular error key (using `error.code`) on the matching form
   *    control so `hasError()` returns `true` for that validation name.
   */
  private applyApiErrors(errors: ApiErrorMap): void {
    this.fields.update((fields) =>
      fields.map((field) => {
        const fieldErrors = errors[field.key ?? ''];
        if (!fieldErrors?.length) return field;
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
        console.warn(`[SLB] API error for unknown field: ${actualKey}`);
        continue;
      }

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

  /**
   * Dev/staging-only helper: fills every visible field with a plausible value so the form can be
   * saved/submitted without manual data entry. The supporting-document value is a fake reference
   * (no real upload happens) purely so the "required" validation passes during testing.
   */
  fillTestData(): void {
    for (const field of this.visibleFields()) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (!control) continue;

      switch (field.formFieldType) {
        case 'actualTarget': {
          // Actual/target must satisfy actualLessThanOrEqualToTarget (see comparison.validator.ts),
          // so pick two distinct points within range rather than the same midpoint for both.
          const min = Number(field.validations?.find((v) => v.name === 'min')?.validator ?? 0);
          const max = Number(field.validations?.find((v) => v.name === 'max')?.validator ?? 100);
          const actualValue = Math.round(min + (max - min) * 0.4);
          const targetValue = Math.min(max, Math.max(actualValue + 1, Math.round(min + (max - min) * 0.6)));
          control.setValue({ actual: actualValue, target: targetValue });
          break;
        }
        case 'text':
          control.setValue(field.key === 'declarantDesignation' ? 'Municipal Engineer' : 'Test Declarant');
          break;
        case 'file':
          control.setValue({
            fileName: 'test-supporting-document.pdf',
            fileUrl: 'slb/supporting-document/test-supporting-document.pdf',
            fileSize: 10240,
            pageCount: 1,
          });
          break;
        case 'checkbox':
          control.setValue(true);
          break;
      }

      control.markAsDirty();
      control.markAsTouched();
    }

    this.utilityService.triggerSnackbar('Test data filled. Supporting document is a fake reference for testing only.');
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
