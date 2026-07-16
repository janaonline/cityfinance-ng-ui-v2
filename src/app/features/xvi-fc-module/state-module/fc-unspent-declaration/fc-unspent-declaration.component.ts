import { Component, DestroyRef, OnInit, SecurityContext, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, finalize, takeUntil } from 'rxjs';
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
import { XvifcModuleService } from '../../xvi-fc-module.service';
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
import { FcUnspentDeclarationService } from './fc-unspent-declaration.service';
import { FcUnspentUlbOptionsCacheService } from './fc-unspent-ulb-options-cache.service';
import {
  ApiErrorMap,
  ApiErrorResponse,
  ApiFieldError,
  FcUnspentApplicableFc,
  FcUnspentDeclarationTemplate,
  FcUnspentDevolutionDependency,
  FcUnspentSaveData,
  FcUnspentSavePayload,
  FcUnspentUlbData,
} from './fc-unspent-declaration.models';

const DEFAULT_DEPENDENCY: FcUnspentDevolutionDependency = {
  devolutionStatus: null,
  devolutionDatasetExists: false,
  editableDueToDevolutionReturn: false,
  blockingMessage: null,
};

type SubmitType = 'saveAsDraft' | 'finalSubmit';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons. */
const FC_UNSPENT_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
} as const;

const ROW_ERROR_KEY_PATTERN = /^unspentUlbData\.(\d+)\.(ulbId|unspentAmount)$/;

const FALLBACK_DECLARATION_TEMPLATE_FILENAME = 'FC-Unspent-Declaration.docx';

/** Strips path separators and control characters from a backend-supplied filename before it is
 *  used as an anchor's `download` attribute — a normal filename passes through untouched (including
 *  its extension); only a missing/unsafe one falls back to a fixed default. */
function sanitizeDeclarationTemplateFileName(fileName: string): string {
  const cleaned = fileName
    .replace(/[/\\]/g, '')
    // eslint-disable-next-line no-control-regex -- intentionally stripping control characters
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim();
  return cleaned || FALLBACK_DECLARATION_TEMPLATE_FILENAME;
}

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
  // Component-scoped (not `providedIn: 'root'`) so the ULB-options query cache lives and dies with
  // this page — a fresh instance per visit, discarded (via its own `ngOnDestroy`) when the page is,
  // never leaking across navigations. `UnspentUlbTableComponent` passes this same injector through
  // to `MatDialog.open`, so every picker opened from this page shares the one instance.
  providers: [FcUnspentUlbOptionsCacheService],
})
export class FcUnspentDeclarationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly fcUnspentService = inject(FcUnspentDeclarationService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ulbOptionsCache = inject(FcUnspentUlbOptionsCacheService);

  readonly threshold = signal(10);
  readonly stateName = signal('');
  readonly applicableFc = signal<FcUnspentApplicableFc>('14TH_FC');
  readonly applicableFcLabel = computed(() => (this.applicableFc() === '15TH_FC' ? '15th' : '14th'));
  readonly actors = signal<FormActor[]>([]);

  /** Raw saved-row snapshot from the preview response (ulbName/censusCode/sbCode/allocationAmount),
   *  kept alongside the editable FormArray so the table can render already-saved rows without ever
   *  needing to open the ULB picker. */
  readonly savedUnspentUlbData = signal<readonly FcUnspentUlbData[]>([]);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly unspentUlbData = new FormArray<FcUnspentUlbRowGroup>([]);
  private readonly isYesBranchSignal = signal(false);
  readonly isYesBranch = computed(() => this.isYesBranchSignal());

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());
  readonly isDownloadingTemplate = signal(false);

  readonly canEdit = signal(false);
  readonly canSaveDraft = signal(false);
  readonly canFinalSubmit = signal(false);
  readonly currentFormStatus = signal<FormStatusValue>(FORM_STATUS.NOT_STARTED);
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus());

  /** Devolution-dependency info for DISPLAY only (status label + blocking-message banner) — the
   *  gates above (`canEdit`/`canSaveDraft`/`canFinalSubmit`) are already backend-computed to account
   *  for it; this page must never re-derive permission logic from `dependency` itself. */
  readonly dependency = signal<FcUnspentDevolutionDependency>(DEFAULT_DEPENDENCY);

  /** `_form` errors plus whole-array `unspentUlbData` errors (e.g. duplicate/empty) from the most
   *  recent failed save/submit — shown in a compact alert; indexed row errors go to their control instead. */
  readonly formLevelErrors = signal<readonly string[]>([]);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Tracks server-injected error codes per dynamic-field control, so they can be cleared before the next request. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  /** Emits before each form rebuild (on reload) so per-form subscriptions are torn down cleanly. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

  /** Public (not just internally used) so the template can pass it straight into the ULB picker's
   *  table input without duplicating this resolution logic. */
  get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    // Centralizes ULB-options cache invalidation here rather than scattering it across every
    // save/final-submit success handler — this method is the one place both the initial load, the
    // load-error retry, and `reloadForm()` (after save/final submit) all pass through. Cached query
    // results may no longer reflect the backend's current ULB/allocation data once the form reloads.
    this.ulbOptionsCache.clear();

    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.loadError.set(true);
      this.utilityService.triggerSnackbar(
        'Unable to load FC Unspent declaration. Please try again.',
        'snackbar-danger',
      );
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(false);

    this.fcUnspentService
      .getForm(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stateName.set(data.stateName);
          this.applicableFc.set(data.applicableFc);
          this.actors.set(data.actors);
          this.threshold.set(data.threshold);
          this.currentFormStatus.set(data.currentFormStatus);
          this.canEdit.set(data.permissions.canEdit);
          this.canSaveDraft.set(data.permissions.canSaveDraft);
          this.canFinalSubmit.set(data.permissions.canFinalSubmit);
          this.dependency.set(data.dependency);
          this.savedUnspentUlbData.set(data.unspentUlbData);
          // Defensive per-question clone — never mutate the fields array reference in place.
          this.fields.set(data.questions.map((question) => ({ ...question })));
          this.createFormControls(data.unspentUlbData);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load FC Unspent declaration', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar(
            'Unable to load FC Unspent declaration. Please try again.',
            'snackbar-danger',
          );
        },
      });
  }

  private createFormControls(savedRows: readonly FcUnspentUlbData[]): void {
    for (const field of this.fields()) {
      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

    this.form.addControl('unspentUlbData', this.unspentUlbData);
    this.hydrateUnspentUlbData(savedRows);

    const isFcUnspentControl = this.form.get('isFcUnspent');
    this.isYesBranchSignal.set(isFcUnspentControl?.value === 'yes');
    isFcUnspentControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.formSubscriptionsTeardown$))
      .subscribe((value) => {
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
      formTeardown$: this.formSubscriptionsTeardown$,
    });

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }
  }

  private hydrateUnspentUlbData(rows: readonly FcUnspentUlbData[]): void {
    for (const row of rows) {
      this.unspentUlbData.push(createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit(), row));
    }
  }

  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey === 'fcDeclaration' && event.actionId === FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE) {
      this.downloadDeclarationTemplate();
    }
  }

  /**
   * Fetches the declaration-template's private signed download URL and triggers the download via a
   * temporary anchor. Never reads `currentFormStatus` to decide whether this is allowed — the
   * backend already controls whether the action is even rendered; this only guards against a
   * missing stateId/yearId and duplicate concurrent clicks.
   */
  private downloadDeclarationTemplate(): void {
    if (this.isDownloadingTemplate()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.isDownloadingTemplate.set(true);

    this.fcUnspentService
      .getDeclarationTemplate(stateId, yearId)
      .pipe(
        finalize(() => this.isDownloadingTemplate.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (template) => this.triggerDeclarationTemplateDownload(template),
        error: (err: unknown) => {
          console.error('Failed to download the FC Unspent declaration template', err);
          const response = this.extractApiErrorResponse(err);
          this.utilityService.triggerSnackbar(
            response?.message ?? 'Failed to download the declaration template.',
            'snackbar-danger',
          );
        },
      });
  }

  /**
   * Downloads via a temporary anchor rather than `window.open` (popup-blocker risk) or FileSaver
   * (would require re-fetching the URL as a Blob). `url` is validated as the app's own signed
   * `/file/download` route before use — this UI never receives or constructs a raw S3 path, so any
   * other shape is treated as a failed download rather than navigated to.
   */
  private triggerDeclarationTemplateDownload(template: FcUnspentDeclarationTemplate): void {
    if (!template.url.trim() || !this.isSafeDeclarationTemplateUrl(template.url)) {
      this.utilityService.triggerSnackbar('Failed to download the declaration template.', 'snackbar-danger');
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = template.url;
    anchor.download = sanitizeDeclarationTemplateFileName(template.fileName);
    anchor.rel = 'noopener';
    anchor.click();
    anchor.remove();
  }

  /** True only for a same-origin URL whose path is the application's known signed-download route. */
  private isSafeDeclarationTemplateUrl(url: string): boolean {
    const sanitized = this.sanitizer.sanitize(SecurityContext.URL, url);
    if (!sanitized) return false;

    try {
      const parsed = new URL(sanitized, window.location.origin);
      return parsed.pathname.endsWith('/file/download');
    } catch {
      return false;
    }
  }

  onSubmit(action: SubmitType): void {
    const flatFieldsValid = this.isValidForSubmitType(action);
    const tableValid = this.isUnspentUlbDataValidForSubmitType(action);
    const branchValid = action !== 'finalSubmit' || this.resolveIsFcUnspentBoolean() !== null;

    if (!flatFieldsValid || !tableValid || !branchValid) {
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
        if (confirmed) this.submit(action);
      });
  }

  private submit(action: SubmitType): void {
    this.clearAllApiErrors();

    const payload = this.buildPayload();
    const submittingFlag = action === 'finalSubmit' ? this.isFinalSubmitting : this.isSavingDraft;
    const request =
      action === 'finalSubmit' ? this.fcUnspentService.finalSubmit(payload) : this.fcUnspentService.saveDraft(payload);

    submittingFlag.set(true);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        submittingFlag.set(false);
        this.utilityService.triggerSnackbar(
          action === 'finalSubmit' ? 'FC Unspent declaration submitted successfully.' : 'Draft saved successfully.',
          'snackbar-success',
        );
        // Reload real state from the backend rather than manually patching status/rows/eligibility.
        this.reloadForm();
      },
      error: (err: unknown) => {
        console.error(
          `Failed to ${action === 'finalSubmit' ? 'submit' : 'save draft for'} FC Unspent declaration`,
          err,
        );
        submittingFlag.set(false);
        this.handleSubmitError(
          err,
          action === 'finalSubmit'
            ? 'Unable to submit the declaration. Please try again.'
            : 'Unable to save the draft. Please try again.',
        );
      },
    });
  }

  /** Maps the radio control's UI value to the wire boolean; `null` for anything else (unanswered or corrupt). */
  private resolveIsFcUnspentBoolean(): boolean | null {
    const value: unknown = this.form.get('isFcUnspent')?.value;
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return null;
  }

  /**
   * Assembles the `{ stateId, yearId, data }` payload sent on save/submit — the same envelope
   * `SfcStatusDraftPayload`/`SaveDraftDevolutionPayload` use. `isFcUnspent` is converted to a real
   * boolean at this boundary (`'yes' -> true`, `'no' -> false`, unanswered -> `null`) — the backend
   * DTO is strict-boolean and rejects the radio control's own `'yes'|'no'` string. Only the fields
   * relevant to the resolved branch are included; row values are whitelisted explicitly to
   * `{ ulbId, unspentAmount }` rather than trusting `getRawValue()`'s shape wholesale, and rows with
   * an incomplete selection are dropped. Backend-owned fields — `applicableFc`, `threshold`,
   * Devolution dependency state, and each row's `ulbName`/`censusCode`/`sbCode`/`allocationAmount`/
   * `allocationPerc`/`eligibility`/`rowStatus` — must never be read from client state on submit.
   */
  private buildPayload(): FcUnspentSavePayload {
    const rawData = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const isFcUnspent = this.resolveIsFcUnspentBoolean();
    const data: FcUnspentSaveData = { isFcUnspent };

    if (isFcUnspent === false) {
      data.fcDeclaration = rawData['fcDeclaration'];
    } else if (isFcUnspent === true) {
      data.checkboxConfirmation = rawData['checkboxConfirmation'] === true;
      data.unspentUlbData = this.unspentUlbData.controls
        .filter((row) => row.controls.ulbId.value !== null && row.controls.unspentAmount.value !== null)
        .map((row) => ({
          ulbId: row.controls.ulbId.value as string,
          unspentAmount: row.controls.unspentAmount.value as number,
        }));
    }

    return {
      stateId: this.stateId,
      yearId: this.yearId,
      data,
    };
  }

  // ─── API error mapping ──────────────────────────────────────────────────────

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
    if (this.isObject(errorBody) && typeof errorBody['message'] === 'string') {
      return {
        statusCode: typeof errorBody['statusCode'] === 'number' ? errorBody['statusCode'] : undefined,
        message: errorBody['message'],
        errors: this.isApiErrorMap(errorBody['errors']) ? errorBody['errors'] : undefined,
      };
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
   * Routes each backend error key to one of three destinations:
   * - `unspentUlbData.<index>.<ulbId|unspentAmount>` → the matching row control, as `apiErrors`.
   * - `_form` or bare `unspentUlbData` (whole-array errors) → `formLevelErrors`, shown in an alert.
   * - anything else → the matching dynamic-field control + its `validations` config (SFC pattern).
   */
  private applyApiErrors(errors: ApiErrorMap): void {
    const formLevelMessages: string[] = [];

    for (const [key, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors?.length) continue;

      if (key === '_form' || key === 'unspentUlbData') {
        formLevelMessages.push(...fieldErrors.map((e) => e.message));
        continue;
      }

      const rowMatch = ROW_ERROR_KEY_PATTERN.exec(key);
      if (rowMatch) {
        this.applyRowApiError(Number(rowMatch[1]), rowMatch[2] as 'ulbId' | 'unspentAmount', fieldErrors);
        continue;
      }

      this.applyDynamicFieldApiError(key, fieldErrors);
    }

    if (formLevelMessages.length) {
      this.formLevelErrors.set(formLevelMessages);
    }
  }

  private applyRowApiError(
    rowIndex: number,
    controlKey: 'ulbId' | 'unspentAmount',
    fieldErrors: ApiFieldError[],
  ): void {
    const row = this.unspentUlbData.controls[rowIndex];
    if (!row) return;

    const control = row.controls[controlKey];
    control.setErrors({ ...(control.errors ?? {}), apiErrors: fieldErrors.map((e) => e.message) });
    control.markAsTouched();
  }

  /**
   * Maps backend field errors into the existing dynamic-form validation system (same approach as
   * `SfcStatusComponent.applyApiErrors`): the `fields` signal gets a matching `validations` entry
   * (so the field's own template rendering shows the message), and the same error code is set on
   * the control (so `hasError()` reports it). Errors are skipped for currently-hidden fields.
   */
  private applyDynamicFieldApiError(fieldKey: string, fieldErrors: ApiFieldError[]): void {
    this.fields.update((fields) =>
      fields.map((field) => {
        if (field.key !== fieldKey || field.hidden) return field;

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

    const fieldConfig = this.fields().find((f) => f.key === fieldKey);
    if (fieldConfig?.hidden) return;

    const control = this.form.get(fieldKey);
    if (!control) {
      console.warn(`[FC Unspent Declaration] API error for unknown field: ${fieldKey}`);
      return;
    }

    const errorMap = fieldErrors.reduce<Record<string, true>>((acc, error) => {
      if (error.code) acc[error.code] = true;
      return acc;
    }, {});

    control.setErrors({ ...(control.errors ?? {}), ...errorMap });
    control.markAsTouched();
    control.markAsDirty();

    this.serverErrorKeys.set(fieldKey, [...(this.serverErrorKeys.get(fieldKey) ?? []), ...Object.keys(errorMap)]);
  }

  /** Clears dynamic-field server errors, row `apiErrors`, and `formLevelErrors` before the next request. */
  private clearAllApiErrors(): void {
    for (const [fieldKey, errorCodes] of this.serverErrorKeys) {
      const control = this.form.get(fieldKey);
      if (!control?.errors) continue;
      const remaining = { ...control.errors };
      for (const code of errorCodes) delete remaining[code];
      control.setErrors(Object.keys(remaining).length ? remaining : null);
    }
    this.serverErrorKeys.clear();

    for (const row of this.unspentUlbData.controls) {
      for (const control of Object.values(row.controls)) {
        if (!control.errors?.['apiErrors']) continue;
        const remaining = { ...control.errors };
        delete remaining['apiErrors'];
        control.setErrors(Object.keys(remaining).length ? remaining : null);
      }
    }

    this.formLevelErrors.set([]);
  }

  /** Tears down the current form/rows and reloads fresh state from the backend. */
  private reloadForm(): void {
    this.formSubscriptionsTeardown$.next();
    this.form = this.fb.group({});
    this.unspentUlbData.clear();
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
