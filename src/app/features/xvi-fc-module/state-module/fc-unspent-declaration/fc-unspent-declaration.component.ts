import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
import {
  FORM_STATUS,
  FormActor,
  FormProgressComponent,
  FormStatusValue,
} from '../../shared/form-progress/form-progress.component';
import { FC_UNSPENT_DECLARATION_FIELDS } from './fc-unspent-declaration.questions';

type SubmitType = 'saveAsDraft' | 'finalSubmit';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons. */
const FC_UNSPENT_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
} as const;

@Component({
  selector: 'app-fc-unspent-declaration',
  imports: [ReactiveFormsModule, DynamicFormComponent, PreLoaderComponent, MatButtonModule, FormProgressComponent],
  templateUrl: './fc-unspent-declaration.component.html',
  styleUrl: './fc-unspent-declaration.component.scss',
})
export class FcUnspentDeclarationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });

  readonly stateName = signal('');
  /** FC cycle this declaration applies to. Static for now — this page is not yet API-driven. */
  readonly applicableFc = signal('14th');
  readonly actors = signal<FormActor[]>([
    {
      action: 'Created by',
      designation: 'State DMA Officer',
      by: '15thfcdesk5@gmail.com',
      date: '2026-07-13T13:06:49.890Z',
    },
    {
      action: 'Updated by',
      designation: 'State DMA Officer',
      by: '15thfcdesk5@gmail.com',
      date: '2026-07-13T13:06:52.370Z',
    },
    // {
    //   action: 'Submitted by',
    //   designation: 'State DMA Officer',
    //   by: '15thfcdesk5@gmail.com',
    //   date: '2026-07-13T13:06:52.369Z',
    // },
  ]);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>(FC_UNSPENT_DECLARATION_FIELDS);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  // Static preview: nothing to fetch, so loading never happens and the form is always editable
  // until this page is wired to a real backend endpoint.
  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());

  readonly canEdit = signal(true);
  readonly canFinalSubmit = signal(true);
  readonly currentFormStatus = signal<FormStatusValue>(FORM_STATUS.NOT_STARTED);
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus());

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();

  ngOnInit(): void {
    this.createFormControls();
  }

  private createFormControls(): void {
    for (const field of this.fields()) {
      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

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

  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.actionId === FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE) {
      this.utilityService.triggerSnackbar('Template download is not yet available.', 'snackbar-warn');
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
    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;

    this.confirmDialogService
      .confirm(dialogData, config)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar(
          'Form validated. This page is not yet connected to a backend service.',
          'snackbar-warn',
        );
      });
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
}
