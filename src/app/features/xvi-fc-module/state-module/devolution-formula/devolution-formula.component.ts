import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit, computed, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';
import { InrCurrencyPipe } from '../../../../core/directives/inr-currency.pipe';
import { MatButtonModule } from '@angular/material/button';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-devolution-formula',
  imports: [CommonModule, ReactiveFormsModule, InrCurrencyPipe, MatButtonModule, DynamicFormComponent],
  templateUrl: './devolution-formula.component.html',
  styleUrl: './devolution-formula.component.scss',
})
export class DevolutionFormulaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private dynamicService = inject(DynamicFormService);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  inrCurrencyOptions = { currencyTypeInUser: 10000000 as const };
  grantAmount = signal(15_62_00_00_000);
  ulbCount = signal(123);

  form = this.fb.group({});
  fields = signal<ConditionalFieldConfig[]>([]);
  visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));
  isLoading = signal(false);

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

    this.isLoading.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
      return;
    }

    const payload = this.form.getRawValue();
    console.log('Form submitted:', payload);
    this.utilityService.triggerSnackbar('Form submitted successfully!');
  }

  onCancel(): void {
    this.form.reset();
    this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
  }
}

const TEMP_QUESTIONS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'file',
    label: 'Upload devolution data',
    key: 'devolutionExcelFile',
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
    allowedFileTypes: ['xlsx', 'xls'],
  },
  {
    formFieldType: 'textarea',
    label: 'Additional notes or clarifications (optional)',
    key: 'additionalNotes',
    placeholder: 'Add any notes about the formula or data sources…',
    validations: [
      {
        name: 'maxlength',
        validator: 500,
        message: 'Maximum 500 characters allowed',
      },
    ],
  },
  {
    formFieldType: 'checkbox',
    label:
      'I hereby certify that the information provided above is true and correct to the best of my knowledge and is provided for the purpose of 16th Finance Commission grant eligibility.',
    key: 'checkboxConfirmation',
    value: false,
  },
];
