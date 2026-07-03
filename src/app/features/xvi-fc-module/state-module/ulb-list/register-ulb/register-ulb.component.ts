import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GlobalLoaderService } from '../../../../../core/services/loaders/global-loader.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { UserUtility } from '../../../../../core/util/user/user';
import { MaterialModule } from '../../../../../material.module';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { FieldConfig } from '../../../../../shared/dynamic-form/field.interface';
import { IUlbType } from '../../../../../core/models/ulb-master';
import { UlbMasterService } from '../../ulb-list/ulb-master.service';
import { ULB_TEMPLATE } from '../../ulb-list/ulb-template.constant';

const errMsg = 'An unexpected error occurred. Please try again later.';

/** Only these ULB_TEMPLATE fields appear on this page — everything else (ULB Code, SB Code, Population,
 *  etc.) is either auto-generated server-side or out of scope for this simplified registration form. */
const REGISTER_ULB_FIELD_KEYS = [
  'name',
  'district',
  'censusCode',
  'dateOfConstitution',
  'gazetteNotificationNumber',
  'gazetteNotificationFile',
] as const;

@Component({
  selector: 'app-register-ulb',
  imports: [ReactiveFormsModule, MaterialModule, RouterLink, DynamicFormComponent],
  templateUrl: './register-ulb.component.html',
  styleUrl: './register-ulb.component.scss',
})
export class RegisterUlbComponent implements OnInit {
  private readonly loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  readonly isState = this.loggedInUserDetails?.role === 'STATE';
  private readonly ownStateId: string | null = this.loggedInUserDetails?.state ?? null;

  readonly yearId = this.route.snapshot.paramMap.get('yearId');

  form!: FormGroup;
  ulbTypes: IUlbType[] = [];

  /** Cloned so `hideLabel` doesn't leak into the shared Edit dialog, which reuses ULB_TEMPLATE directly. */
  private readonly fields: FieldConfig[] = structuredClone(ULB_TEMPLATE)
    .filter((field) => (REGISTER_ULB_FIELD_KEYS as readonly string[]).includes(field.key))
    .map((field) => ({ ...field, hideLabel: true }));
  private readonly fieldsByKey = new Map(this.fields.map((field) => [field.key, field]));

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

    this.form = this.formService.toFormGroup(this.fields);
    this.form.addControl('ulbType', new FormControl('', Validators.required));
    this.form.addControl(
      'state',
      new FormControl({ value: this.ownStateId ?? '', disabled: true }, Validators.required),
    );

    this.loadUlbTypes();
  }

  fieldConfig(key: string): FieldConfig {
    const field = this.fieldsByKey.get(key);
    if (!field) throw new Error(`Unknown ULB field: ${key}`);
    return field;
  }

  private loadUlbTypes(): void {
    this.globalLoader.showLoader();
    this.ulbMasterService.getTypes().subscribe({
      next: (res) => {
        this.ulbTypes = res.data ?? [];
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
