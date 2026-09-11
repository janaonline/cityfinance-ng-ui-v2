import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CanComponentDeactivate, warnBeforeUnloadWhenDirty } from '../../../../core/guards/unsaved-changes.guard';
import { FormProgressComponent, FormStatusValue } from '../../shared/form-progress/form-progress.component';

type SubmitType = 'saveAsDraft' | 'finalSubmit';

interface RequestExemptionPermissions {
  canView: boolean;
  canEdit: boolean;
  canFinalSubmit: boolean;
}

/**
 * TODO: hardcoded stand-in for the real `GET xvi-fc/state/request-exemption/:stateId/:yearId`
 * response (backend not built yet) — see cf-nest-api-v2 xvifc-payload-07092026.json's
 * `requestExemption` entry (formId 34). Swap for a real service call once that endpoint exists.
 */
const MOCK_REQUEST_EXEMPTION_FIELDS: ConditionalFieldConfig[] = [
  {
    formFieldType: 'text',
    key: 'ulb',
    label: 'ULB',
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: { variant: 'inline', labelWidth: 'lg' },
  },
  {
    formFieldType: 'select',
    multiple: true,
    key: 'reasonForExemption',
    label: 'Reason for Exemption',
    options: [
      { id: '23', label: 'Election/ duly constituted ULB exemption' },
      { id: '30', label: 'Audited Financial Statement' },
      { id: '31', label: 'Provisional Financial Statement' },
      { id: '22', label: 'State Finance Commission extension/ compliance' },
    ],
    validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
    layout: { variant: 'inline', labelWidth: 'lg' },
  },
  {
    formFieldType: 'textarea',
    key: 'supportingDetails',
    label: 'Supporting Details',
    placeholder: 'Briefly describe the grounds for this exemption.',
    validations: [
      { name: 'required', validator: null, message: 'This field is required.' },
      { name: 'minlength', validator: 3, message: 'Minimum 3 characters required.' },
      { name: 'maxlength', validator: 500, message: 'Maximum 500 characters allowed.' },
    ],
    layout: { variant: 'inline', labelWidth: 'lg' },
  },
  {
    formFieldType: 'file',
    key: 'supportingFile',
    label: 'Supporting Document',
    allowedFileTypes: ['pdf'],
    maxFileSize: 5,
    folderPathKey: 'req-exemption/supporting-doc',
    value: { originalName: '', path: '', mimeType: '', sizeKb: null, pageCount: null },
    validations: [],
    appearance: { color: 'danger', variant: 'soft' },
    layout: { variant: 'inline', labelWidth: 'lg' },
  },
  {
    formFieldType: 'checkbox',
    key: 'checkboxConfirmation',
    label:
      'I understand that this submission may contain information entered or modified by other users. I have reviewed the final submission and confirm that the information being submitted is complete and accurate to the best of my knowledge.',
    value: false,
    validations: [{ name: 'requiredTrue', validator: null, message: 'Please confirm before submitting.' }],
  },
] as ConditionalFieldConfig[];

@Component({
  selector: 'app-request-exemption',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    FormProgressComponent,
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

  public stateName = signal('Andhra Pradesh');

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly permissions = signal<RequestExemptionPermissions>({
    canView: true,
    canEdit: true,
    canFinalSubmit: true,
  });
  readonly currentFormStatus = signal<number>(0);
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus() as FormStatusValue);

  readonly canEdit = computed(() => this.permissions().canEdit);
  readonly canFinalSubmit = computed(() => this.permissions().canFinalSubmit);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

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
    this.isLoading.set(true);

    // TODO: replace with a real `RequestExemptionService.getRequestExemptionForm()` call.
    setTimeout(() => {
      this.fields.set(MOCK_REQUEST_EXEMPTION_FIELDS);
      this.createFormControls();
      this.isLoading.set(false);
    }, 500);
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
    });

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }
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

    this.confirmDialogService.confirm(dialogData, this.dialogConfig).subscribe((confirmed) => {
      if (!confirmed) return;
      if (action === 'saveAsDraft') {
        this.executeSaveDraft();
      } else {
        this.executeFinalSubmit();
      }
    });
  }

  /** For `saveAsDraft`: plain `required`/`requiredTrue` errors are skipped (empty fields are allowed in a draft). */
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
    this.isSavingDraft.set(true);

    const payload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    console.log('[Request Exemption] saveAsDraft payload:', payload);

    // TODO: replace with a real `RequestExemptionService.saveDraft()` call.
    setTimeout(() => {
      this.isSavingDraft.set(false);
      this.form.markAsPristine();
      this.utilityService.triggerSnackbar('Draft saved successfully.');
    }, 500);
  }

  private executeFinalSubmit(): void {
    this.isFinalSubmitting.set(true);

    const payload = this.visibilityService.getVisiblePayload(this.form, this.fields());
    console.log('[Request Exemption] finalSubmit payload:', payload);

    // TODO: replace with a real `RequestExemptionService.finalSubmit()` call.
    setTimeout(() => {
      this.isFinalSubmitting.set(false);
      this.form.markAsPristine();
      this.utilityService.triggerSnackbar('Exemption request submitted successfully.');
    }, 500);
  }

  onCancel(): void {
    this.confirmDialogService.confirm(undefined, this.dialogConfig).subscribe((confirmed) => {
      if (!confirmed) return;
      this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
    });
  }
}
