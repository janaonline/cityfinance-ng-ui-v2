import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';
import { MatButtonModule } from '@angular/material/button';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { SUBMIT_CONFIRM_DIALOG_DEFAULTS } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import {
  DynamicFormVisibilityService,
  ConditionalFieldConfig,
  DependencyIndex,
} from '../../dynamic-form-visibility.service';

@Component({
  selector: 'app-elected-body-status',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, DynamicFormComponent],
  templateUrl: './elected-body-status.component.html',
  styleUrl: './elected-body-status.component.scss',
})
export class ElectedBodyStatusComponent implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private utilityService = inject(UtilityService);
  private visibilityService = inject(DynamicFormVisibilityService);
  private dynamicService = inject(DynamicFormService);
  private confirmDialogService = inject(ConfirmDialogService);
  private themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  stateName = signal('Andhra Pradesh');
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
    const payload = this.form.getRawValue();
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
        this.form.reset();
        this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
      });
  }
}

const TEMP_QUESTIONS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'number',
    label: 'How many ULBs are there in Andhra Pradesh as of March 31, 2026?',
    key: 'ulbCount',
    placeholder: '',
    validations: [
      {
        name: 'required',
        validator: null,
        message: 'This field is required.',
      },
      {
        name: 'min',
        validator: 10,
        message: 'ULB count cannot be less than 10.',
      },
      {
        name: 'max',
        validator: 1000,
        message: 'ULB count cannot exceed 1000.',
      },
    ],
    layout: {
      variant: 'inline',
      labelWidth: 'lg',
    },
  },
  {
    formFieldType: 'file',
    label: 'Upload elected bodies list',
    key: 'electedBodyExcelFile',
    validations: [
      // {
      //   name: 'required',
      //   validator: null,
      //   message: 'This field is required.',
      // },
    ],
    value: {
      fileName: '',
      fileUrl: '',
      fileSize: null,
      mimeType: '',
    },
    folderPath: 'state/elected-body-status-uploads',
    maxFileSize: 20,
    allowedFileTypes: ['xlsx', 'xls'],
    supportingContent: [
      {
        type: 'template-download',
        position: 'before',
        label: 'Download the template',
        url: '/assets/templates/elected-body-template.xlsx',
        description: 'Fill in the details and re-upload as a single excel file.',
      },
      // {
      //   type: 'sample-columns',
      //   position: 'before',
      //   title: 'Expected Excel columns',
      //   columns: ['ULB Code', 'ULB Name', 'Grant Amount (₹ Cr)', 'Formula Used'],
      // },
    ],
    appearance: {
      color: 'success',
      variant: 'soft',
    },
  },
  {
    formFieldType: 'checkbox',
    label:
      'I hereby certify that the information provided above is true and correct to the best of my knowledge and is provided for the purpose of 16th Finance Commission grant eligibility.',
    key: 'checkboxConfirmation',
    value: false,
    validations: [
      {
        name: 'requiredTrue',
        validator: null,
        message: 'Please confirm before submitting.',
      },
    ],
  },
];
