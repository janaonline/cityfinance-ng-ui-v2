import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { getYearRangeDuration } from '../../../../core/validators/year-range.validator';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { SUBMIT_CONFIRM_DIALOG_DEFAULTS } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { SfcStatusService } from './sfc-status.service';
import { SfcStatusPermissions } from './sfc-status.models';
import { XvifcModuleService } from '../../xvi-fc-module.service';

@Component({
  selector: 'app-sfc-status',
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent, PreLoaderComponent, MatButtonModule],
  templateUrl: './sfc-status.component.html',
  styleUrl: './sfc-status.component.scss',
})
export class SfcStatusComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private dynamicService = inject(DynamicFormService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private confirmDialogService = inject(ConfirmDialogService);
  private themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  private sfcStatusService = inject(SfcStatusService);
  private moduleService = inject(XvifcModuleService);

  readonly stateName = signal('Andhra Pradesh');

  form = this.fb.group({});
  fields = signal<ConditionalFieldConfig[]>([]);
  visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  readonly permissions = signal<SfcStatusPermissions>({
    canView: true,
    canEdit: true,
    canFinalSubmit: false,
  });
  readonly currentFormStatus = signal<number>(0);
  readonly currentFormStatusLabel = signal('');

  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

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
      this.errorMessage.set('Unable to load form: missing state or year context.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.sfcStatusService
      .getSfcStatusForm(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.permissions.set(data.permissions);
          this.currentFormStatus.set(data.currentFormStatus);
          this.currentFormStatusLabel.set(data.currentFormStatusLabel);
          this.fields.set(data.questions);
          this.createFormControls();
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load SFC status form', err);
          this.errorMessage.set('Failed to load form. Please try again.');
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

  /**
   * Validates the form and, on confirmation, submits it excluding hidden fields.
   */
  onSubmit(): void {
    // Hidden fields are excluded from form validation because their controls are disabled (control.disable).
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
      return;
    }

    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
    this.confirmDialogService
      .confirm(SUBMIT_CONFIRM_DIALOG_DEFAULTS, config)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.submitForm();
      });
  }

  private submitForm(): void {
    // Use this instead of getRawValue() - without hidden fields
    const payload = this.visibilityService.getVisiblePayload(this.form, this.fields());

    // Hidden, disabled remembered fields included too
    // const payload = this.form.getRawValue();

    console.log('Form submitted:', payload);
    this.utilityService.triggerSnackbar('Form submitted successfully!');
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
