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

  readonly stateName = signal('Andhra Pradesh');

  form = this.fb.group({});
  fields = signal<ConditionalFieldConfig[]>([]);
  visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));
  isLoading = signal(false);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  ngOnInit(): void {
    this.getQuestions();
  }

  /**
   * Fetch questions from an API and initialize form controls based on the fetched field configurations (formJson)
   */
  getQuestions(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.fields.set(TEMP_QUESTIONS);
      this.createFormControls();
      this.isLoading.set(false);
    }, 1);
  }

  /**
   * - Create form controls based on the field configurations (formJson) and add them to the form
   * - Create a dependency index (map) to map controller fields to their dependent fields for visibility
   * - Set up subscriptions for controller fields to listen for value changes and update visibility of dependent fields based on conditions defined in formJson
   * - Show loading indicator while setting up the form and hide it once done
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

    this.isLoading.set(false);
  }

  /**
   * - Validate the form and if valid, prepare the payload by excluding hidden fields and submit the form
   * - If the form is invalid, mark all fields as touched to show validation errors and display a snackbar message
   * - Use visibilityService.getVisiblePayload() to get form values excluding hidden fields, which also preserves values of hidden fields in the form state without submitting them.
   * - Use form.getRawValue() to get all the values (including hidden ones).
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

const TEMP_QUESTIONS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'radio',
    label: 'Is the state currently in an active SFC award period?',
    key: 'isActiveSfc',
    value: 'yes',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
    ],
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'text',
    label: 'What is the active award period?',
    key: 'awardPeriod',
    placeholder: 'e.g., 2026-2031',
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'isActiveSfc', operator: 'equals', value: 'yes' }],
    },
    validations: [
      { name: 'required', validator: null, message: 'This field is required.' },
      {
        name: 'yearRange',
        validator: {
          startYearMin: 2020,
          startYearMax: 2026,
          endYearMin: 2025,
          endYearMax: 2032,
          requireEndGreaterThanStart: true,
          allowedDurations: [1, 5, 6],
          requiredIncludedYear: 2026,
        },
        message:
          'Enter a valid period in YYYY-YYYY format. The period must include 2026 and span 1, 5, or 6 years.',
      },
    ],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'number',
    key: 'awardPeriodDuration',
    label: 'Award Period Duration',
    render: false,
    includeInPayload: false,
  },
  {
    formFieldType: 'radio',
    label: 'Was the SFC constituted for an interim period?',
    key: 'sfcConstitutedForInterim',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
    ],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'awardPeriodDuration', operator: 'equals', value: 1 }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
  },
  {
    formFieldType: 'radio',
    label: 'Has the SFC award period been extended?',
    key: 'sfcAwardPeriodExtended',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
    ],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'awardPeriodDuration', operator: 'equals', value: 6 }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    supportingContent: [
      {
        type: 'info',
        position: 'after',
        title: '',
        description:
          'This award period exceeds the standard 5 years. Without an extension order, this submission will be flagged for manual review by the PMU team.',
      },
    ],
  },
  {
    formFieldType: 'file',
    label: 'Upload Extension Order',
    key: 'extensionOrder',
    allowedFileTypes: ['pdf'],
    maxFileSize: 20,
    folderPath: 'state/sfc-status/extension-order',
    value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'sfcAwardPeriodExtended', operator: 'equals', value: 'yes' }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'select',
    label: 'For this award period, which SFC is applicable?',
    key: 'whichAwardPeriod',
    options: ['8th SFC', '7th SFC', '6th SFC', '5th SFC', '4th SFC', '3rd SFC', '2nd SFC', '1st SFC'],
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'isActiveSfc', operator: 'equals', value: 'yes' }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'radio',
    label: 'What is the status of the SFC report?',
    key: 'sfcReportStatus',
    options: [
      { label: 'To be submitted', id: 'toBeSubmitted' },
      { label: 'Report submitted - ATR not yet tabled', id: 'reportSubmittedAtrNotYetTabled' },
      { label: 'Report submitted - ATR tabled', id: 'reportSubmittedAtrTabled' },
    ],
    radioLayout: 'vertical',
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'isActiveSfc', operator: 'equals', value: 'yes' }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'date',
    label: 'Expected Report Submission Date',
    key: 'reportSubmissionDate',
    visibleWhen: {
      mode: 'all',
      conditions: [
        { key: 'isActiveSfc', operator: 'equals', value: 'yes' },
        { key: 'sfcReportStatus', operator: 'equals', value: 'toBeSubmitted' },
      ],
    },
    validations: [
      { name: 'required', validator: null, message: 'This field is required.' },
      {
        name: 'minDate',
        validator: 'TODAY+0D',
        message: 'Date cannot be earlier than today.',
      },
      {
        name: 'maxDate',
        validator: '2027-03-31',
        message: 'Date cannot be beyond 31 March 2027.',
      },
    ],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'file',
    label: 'Upload SFC Report',
    key: 'sfcReport',
    allowedFileTypes: ['pdf'],
    maxFileSize: 20,
    folderPath: 'state/sfc-status/sfc-report',
    value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
    visibleWhen: {
      mode: 'all',
      conditions: [
        { key: 'isActiveSfc', operator: 'equals', value: 'yes' },
        {
          key: 'sfcReportStatus',
          operator: 'in',
          value: ['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled'],
        },
      ],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'file',
    label: 'Upload ATR',
    key: 'atrReport',
    allowedFileTypes: ['pdf'],
    maxFileSize: 20,
    folderPath: 'state/sfc-status/atr-report',
    value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
    visibleWhen: {
      mode: 'all',
      conditions: [
        { key: 'isActiveSfc', operator: 'equals', value: 'yes' },
        { key: 'sfcReportStatus', operator: 'equals', value: 'reportSubmittedAtrTabled' },
      ],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'radio',
    label: 'Has a new SFC been constituted for the next award period?',
    key: 'isNewSfcConstituted',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
      { label: 'Not applicable / current award period still active', id: 'notApplicable' },
    ],
    radioLayout: 'vertical',
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'file',
    label: 'Gazette Notification / Order for new SFC constitution',
    key: 'gazetteNotification',
    allowedFileTypes: ['pdf'],
    maxFileSize: 20,
    folderPath: 'state/sfc-status/gazette-notification',
    value: { fileName: '', fileUrl: '', fileSize: null, mimeType: '' },
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'isNewSfcConstituted', operator: 'equals', value: 'yes' }],
    },
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'textarea',
    label: 'Raise an issue / clarification for the PMU team.',
    key: 'raiseAnIssue',
    placeholder: 'Describe the issue or clarification required...',
    validations: [{ name: 'maxlength', validator: 500, message: 'Maximum 500 characters allowed.' }],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'checkbox',
    label:
      'I hereby certify that the information provided above is true and correct to the best of my knowledge and is provided for the purpose of 16th Finance Commission grant eligibility.',
    key: 'checkboxConfirmation',
    value: false,
    validations: [{ name: 'requiredTrue', validator: null, message: 'Please confirm before submitting.' }],
  },
];
