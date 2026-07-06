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
// import { ulbFormConfig } from './ulb-json';

const errMsg = 'An unexpected error occurred. Please try again later.';

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

    this.globalLoader.showLoader();
    console.log('Register ULB form fields: --1', this.fields);
    // this.buildFormSections(ulbFormConfig); // for local development, fallback to static config if API fails to load
    this.ulbMasterService.getRegisterSections().subscribe({
      next: (res) => {
        this.buildFormSections(res.data ?? []);
      },
      error: () => {
        this.globalLoader.stopLoader();
        this.utilityService.swalPopup('Failed!', 'Unable to load the registration form.', 'error');
      },
    });
  }

  buildFormSections(sections: FormSectionConfig[]): void {
    console.log('Register ULB form fields: --2', this.fields);
    // The API returns each field fully resolved (label, formFieldType, validations, grid, hints,
    // live ulbType options, ...); this page only adds `hideLabel` since it renders labels itself
    // (required asterisks + label hints) rather than the dynamic-form's built-in label.
    this.sections = sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => ({ ...field, hideLabel: false })),
    }));
    this.fields = this.sections.flatMap((section) => section.fields);
    console.log('Register ULB form sections:', this.sections);
    console.log('Register ULB form fields:', this.fields);
    this.form = this.formService.toFormGroup(this.fields);
    this.form.addControl(
      'state',
      new FormControl({ value: this.ownStateId ?? '', disabled: true }, Validators.required),
    );
    this.globalLoader.stopLoader();
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
