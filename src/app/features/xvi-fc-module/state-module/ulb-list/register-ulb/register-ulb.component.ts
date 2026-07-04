import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalLoaderService } from '../../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { UserUtility } from '../../../../../core/util/user/user';
import { FormSectionGridComponent } from '../../../../../shared/dynamic-form/components/form-section-grid/form-section-grid.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { FieldConfig, FormSectionConfig } from '../../../../../shared/dynamic-form/field.interface';
import { UlbMasterService } from '../../ulb-list/ulb-master.service';
import { REGISTER_ULB_SECTIONS, ULB_TEMPLATE } from '../../ulb-list/ulb-template.constant';

const errMsg = 'An unexpected error occurred. Please try again later.';

/** Live-loaded ULB types render through the generic `app-select`; the field itself isn't part of
 *  ULB_TEMPLATE (that's shared with the Edit dialog, which renders its own dedicated ULB Type select). */
function buildUlbTypeField(): FieldConfig {
  return {
    key: 'ulbType',
    label: 'ULB Type',
    formFieldType: 'select',
    required: true,
    placeholder: 'Select type...',
    options: [],
    validations: [{ name: 'required', validator: null, message: 'ULB type is required.' }],
  };
}

@Component({
  selector: 'app-register-ulb',
  imports: [ReactiveFormsModule, RouterLink, FormSectionGridComponent],
  templateUrl: './register-ulb.component.html',
  styleUrl: './register-ulb.component.scss',
})
export class RegisterUlbComponent implements OnInit {
  private readonly loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  readonly isState = this.loggedInUserDetails?.role === 'STATE';
  private readonly ownStateId: string | null = this.loggedInUserDetails?.state ?? null;

  readonly yearId = this.route.snapshot.paramMap.get('yearId');

  form!: FormGroup;
  sections: FormSectionConfig[] = [];

  private fields: FieldConfig[] = [];
  private fieldsByKey = new Map<string, FieldConfig>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly formService: DynamicFormService,
    private readonly ulbMasterService: UlbMasterService,
    private readonly utilityService: UtilityService,
    readonly globalLoader: GlobalLoaderService,
  ) {}

  ngOnInit(): void {
    // ADMIN accounts have no home state to default to, so ULB creation is STATE-only for now.
    if (!this.isState) {
      this.goBack();
      return;
    }

    this.sections = this.buildSections();
    this.fields = this.sections.flatMap((section) => section.fields);
    this.fieldsByKey = new Map(this.fields.map((field) => [field.key, field]));

    this.form = this.formService.toFormGroup(this.fields);
    this.form.addControl(
      'state',
      new FormControl({ value: this.ownStateId ?? '', disabled: true }, Validators.required),
    );

    this.loadUlbTypes();
  }

  /** Resolves each REGISTER_ULB_SECTIONS field key against ULB_TEMPLATE (or `ulbType`), merging in
   *  the section's grid width and hint text, and hiding the built-in dynamic-form label — this
   *  component renders labels itself so it can show required asterisks and label hints uniformly. */
  private buildSections(): FormSectionConfig[] {
    const templateByKey = new Map(structuredClone(ULB_TEMPLATE).map((field) => [field.key, field]));
    templateByKey.set('ulbType', buildUlbTypeField());

    return REGISTER_ULB_SECTIONS.map((section) => ({
      title: section.title,
      icon: section.icon,
      fields: section.fields.map((layout) => {
        const field = templateByKey.get(layout.key);
        if (!field) throw new Error(`Unknown ULB field: ${layout.key}`);

        return {
          ...field,
          hideLabel: true,
          grid: layout.grid,
          labelHint: layout.labelHint,
          hintText: layout.hintText,
        };
      }),
    }));
  }

  private loadUlbTypes(): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.getTypes().subscribe({
      next: (res) => {
        const ulbTypeField = this.fieldsByKey.get('ulbType');
        if (ulbTypeField) ulbTypeField.options = res.data ?? [];
        this.globalLoader.stopLoader();
      },
      error: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', 'Unable to load ULB types.', 'error');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['../ulb-list'], { relativeTo: this.route });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue() as Record<string, unknown>;
    const payload = this.formService.serializeFormPayload(this.fields, rawValue);

    payload['state'] = rawValue['state'];
    payload['ulbType'] = rawValue['ulbType'];

    this.globalLoader.showLoader();
    this.ulbMasterService.create(payload).subscribe({
      next: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Success!', 'ULB has been submitted for approval.');
        this.goBack();
      },
      error: (error: { error?: { message?: string | string[] } }) => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', this.extractErrorMessage(error), 'error');
      },
    });
  }

  private extractErrorMessage(error: { error?: { message?: string | string[] } }): string {
    const message = error?.error?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || errMsg;
  }
}
