import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CanComponentDeactivate, warnBeforeUnloadWhenDirty } from '../../../../../core/guards/unsaved-changes.guard';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../../shared/breadcrumb/breadcrumb.component';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { RequestExemptionService } from '../request-exemption.service';
import {
  ApiErrorMap,
  RequestExemptionPermissions,
  RequestExemptionSaveData,
  RequestExemptionSavePayload,
} from '../request-exemption.models';

interface ApiErrorResponse {
  success?: false;
  /** NestJS's normal single string, or the plain `string[]` a `ValidationPipe`/class-validator 400
   *  sends when there's no custom `errors` map. */
  message?: string | string[];
  errors?: ApiErrorMap;
}

@Component({
  selector: 'app-request-exemption',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    XvifcBreadcrumbComponent,
  ],
  templateUrl: './request-exemption.component.html',
  styleUrl: './request-exemption.component.scss',
})
export class RequestExemptionComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private dynamicService = inject(DynamicFormService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private confirmDialogService = inject(ConfirmDialogService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  private requestExemptionService = inject(RequestExemptionService);
  private moduleService = inject(XvifcModuleService);

  public stateName = signal('');

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly isLoading = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isFinalSubmitting());
  /** The backend's own message from the most recent failed submit, shown as an inline
   *  `alert-danger` banner next to the Cancel/Submit buttons — the snackbar only ever shows a
   *  generic message, since the specific reason (e.g. which reason/ULB conflicts, per
   *  `assertNoOverlappingRequest`) can be long and deserves to stay on screen, not disappear with
   *  the snackbar's timeout. Cleared on every fresh submit attempt and on `reloadForm()`. */
  readonly submitError = signal<string | null>(null);

  readonly permissions = signal<RequestExemptionPermissions>({
    canView: true,
    canEdit: true,
    canFinalSubmit: true,
  });
  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => [
    { label: 'Exemption Status', routerLink: ['/xvifc', this.yearId, 'request-exemption'] },
    { label: 'Request Exemption' },
  ]);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Emits once before each form rebuild so per-form visibility subscriptions are torn down
   *  cleanly — this page can `reloadForm()` many times in one visit (one submit per ULB), unlike
   *  most sibling forms which reload at most once. Same idiom as `sfc-status.component.ts`. */
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

  /** Read by {@link unsavedChangesGuard} and the `beforeunload` listener. */
  hasUnsavedChanges(): boolean {
    return this.canEdit() && this.form.dirty;
  }

  private loadForm(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar('Unable to load Request Exemption form. Please try again.', 'snackbar-danger');
      return;
    }

    this.isLoading.set(true);

    this.requestExemptionService
      .getForm(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.fields.set(data.fields);
          this.stateName.set(data.stateName);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Request Exemption form', err);
          this.utilityService.triggerSnackbar('Unable to load Request Exemption form. Please try again.', 'snackbar-danger');
          this.isLoading.set(false);
        },
      });
  }

  createFormControls(): void {
    for (const field of this.fields()) {
      if (!field.key || !field.formFieldType) continue;
      this.form.addControl(field.key, this.dynamicService.createContorl(field, false, field.readonly));
    }

    // key: controller field key, value: array of fields whose visibility depends on this controller
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

  /** No draft step — the only action is submit. */
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar('Please correct the errors in the form before submitting.', 'snackbar-danger');
      return;
    }

    this.confirmDialogService.confirm(SUBMIT_CONFIRM_DIALOG_DEFAULTS, this.dialogConfig).subscribe((confirmed) => {
      if (!confirmed) return;
      this.executeSubmit();
    });
  }

  private isFormValid(): boolean {
    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (control?.errors) return false;
    }
    return true;
  }

  private buildPayload(): RequestExemptionSavePayload {
    return {
      stateId: this.stateId,
      yearId: this.yearId,
      data: this.visibilityService.getVisiblePayload(this.form, this.fields()) as RequestExemptionSaveData,
    };
  }

  private executeSubmit(): void {
    this.isFinalSubmitting.set(true);
    this.submitError.set(null);

    this.requestExemptionService
      .finalSubmit(this.buildPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isFinalSubmitting.set(false);
          this.utilityService.triggerSnackbar('Exemption request submitted successfully.');
          this.reloadForm();
        },
        error: (err: unknown) => {
          this.isFinalSubmitting.set(false);
          this.handleSubmitError(err, 'Unable to submit exemption request. Please correct the errors and try again.');
        },
      });
  }

  /** No draft/resume step, so a fresh instance of this form is always blank — reload it after a
   *  successful submit so the state can immediately file another request (e.g. for a different
   *  ULB) without a manual page refresh. Rebuilds `form` from scratch rather than `form.reset()`,
   *  matching the sibling dynamic-form components (`devolution-formula`, `sfc-status`,
   *  `elected-body-status`, `fc-unspent-declaration`) — there's no per-field-type "default value"
   *  table to reset a `field.key`-built form back to blank, so re-fetching via `getForm()` is the
   *  reliable way to get one. */
  private reloadForm(): void {
    this.formSubscriptionsTeardown$.next();
    this.form = this.fb.group({});
    this.fields.set([]);
    this.submitError.set(null);
    this.loadForm();
  }

  /**
   * The snackbar always shows `fallbackMessage` — a short, generic line. The backend's own
   * specific message (extracted from either error shape this service can throw, see
   * `extractErrorMessage`) goes into `submitError` instead, rendered as a persistent `alert-danger`
   * banner rather than a snackbar, since it can be long (e.g. naming the exact conflicting reason
   * and status per `assertNoOverlappingRequest`) and shouldn't disappear on the snackbar's timeout.
   */
  private handleSubmitError(err: unknown, fallbackMessage: string): void {
    this.submitError.set(this.extractErrorMessage(err) ?? fallbackMessage);
    this.utilityService.triggerSnackbar(fallbackMessage, 'snackbar-danger');
  }

  private extractErrorMessage(err: unknown): string | undefined {
    if (!err || typeof err !== 'object') return undefined;

    const httpBody = (err as { error?: unknown }).error;
    if (httpBody && typeof httpBody === 'object' && 'message' in httpBody) {
      return this.messageToString((httpBody as ApiErrorResponse).message);
    }

    if ('message' in (err as Record<string, unknown>)) {
      return this.messageToString((err as ApiErrorResponse).message);
    }

    return undefined;
  }

  private messageToString(message: string | string[] | undefined): string | undefined {
    if (Array.isArray(message)) return message.length ? message.join(' ') : undefined;
    return message;
  }

  /** Confirming cancel reloads the form (same blank-slate `reloadForm()` a successful submit
   *  uses), discarding whatever the user had typed and clearing any stale `submitError` banner —
   *  there's no draft to fall back to, so "cancel" means "start over," not "leave it half-filled." */
  onCancel(): void {
    this.confirmDialogService.confirm(undefined, this.dialogConfig).subscribe((confirmed) => {
      if (!confirmed) return;
      this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
      this.reloadForm();
    });
  }
}
