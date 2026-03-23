import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';

@Component({
  selector: 'app-sfc-status',
  imports: [CommonModule, ReactiveFormsModule, DynamicFormComponent, PreLoaderComponent],
  templateUrl: './sfc-status.component.html',
  styleUrl: './sfc-status.component.scss',
})
export class SfcStatusComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private dynamicService = inject(DynamicFormService);
  private visibilityService = inject(DynamicFormVisibilityService);

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
      field.readonly = !field.value && field.readonly ? false : field.readonly;

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

    // Use this instead of getRawValue() - without hidden fields
    const payload = this.visibilityService.getVisiblePayload(this.form, this.fields());

    // Hidden, disabled remembered fields included too
    // const payload = this.form.getRawValue();

    console.log('Form submitted:', payload);
    this.utilityService.triggerSnackbar('Form submitted successfully!');
  }

  onCancel(): void {
    this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
  }
}

const TEMP_QUESTIONS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'text',
    label: 'State Name',
    key: 'stateName',
    value: 'Andhra Pradesh',
    readonly: true,
  },
  {
    formFieldType: 'file',
    label: 'Action Taken Report',
    key: 'actionTakenReport',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
    value: {
      fileName: '',
      fileUrl: '',
      fileSize: null,
      mimeType: '',
    },
    folderPath: '',
    maxFileSize: 5,
    // fileViewType: 'button',
    allowedFileTypes: ['pdf'],
  },
  {
    formFieldType: 'radio',
    label: 'SFC Active',
    key: 'sfcActive',
    value: 'yes',
    options: [
      { label: 'Yes', id: 'yes' },
      { label: 'No', id: 'no' },
    ],
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'textarea',
    label: 'SFC Term',
    key: 'sfcTerm',
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'sfcActive', operator: 'equals', value: 'yes' }],
    },
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Status of SFC Report',
    key: 'sfcReportStatus',
    visibleWhen: {
      mode: 'all',
      conditions: [{ key: 'sfcActive', operator: 'equals', value: 'yes' }],
    },
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Applicable SFC for Grant Calculation',
    key: 'applicableSfcGrantCalculation',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
    ],
  },
  {
    formFieldType: 'text',
    label: 'Applicable SFC Report Submission Date',
    key: 'applicableSfcReportSubmissionDate',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
      {
        name: 'pattern',
        validator: /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/,
        message: 'Date must be in DD-MM-YYYY format (e.g., 19-01-2024)',
      },
    ],
  },
];
