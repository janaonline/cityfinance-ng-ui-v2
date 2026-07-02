import { Location } from '@angular/common';
import { Component, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { firstValueFrom, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap, tap } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import {
  FORM_STATUS,
  FormStatusType,
  XviFcBankAccountProof,
  XviFcBankAccountResponse,
  XviFcBankDetails,
} from './xvi-fc-bank-account.models';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const EDITABLE_FORM_STATUSES = new Set<FormStatusType>([
  FORM_STATUS.NOT_STARTED,
  FORM_STATUS.IN_PROGRESS,
  FORM_STATUS.RETURNED_BY_STATE,
  FORM_STATUS.RETURNED_BY_MOHUA,
]);

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
  ulbId?: string;
  designYearId?: string;
}


interface ApiErrorBody {
  message?: string | string[];
  errors?: Record<string, string | string[]>;
}

function accountNumbersMatchValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const accountNumber = ctrl.get('accountNumber')?.value;
    const confirmAccountNumber = ctrl.get('confirmAccountNumber')?.value;
    if (!accountNumber || !confirmAccountNumber) return null;
    return accountNumber === confirmAccountNumber ? null : { accountMismatch: true };
  };
}

/** 9-18 digits only, with targeted errors matching fill-disclosure behavior. */
function accountNumberValidator(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const value = (ctrl.value as string) ?? '';
    if (!value) return null;

    const errors: ValidationErrors = {};
    if (/\s/.test(value)) errors['hasSpaces'] = true;
    if (/[a-zA-Z]/.test(value)) errors['hasAlphabets'] = true;
    if (/[^a-zA-Z0-9\s]/.test(value)) errors['hasSpecialChars'] = true;
    if (/^\d+$/.test(value)) {
      if (value.length < 9) errors['tooShort'] = true;
      if (value.length > 18) errors['tooLong'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };
}

@Component({
  selector: 'app-xvi-fc-bank-account',
  imports: [ReactiveFormsModule],
  templateUrl: './xvi-fc-bank-account.component.html',
  styleUrl: './xvi-fc-bank-account.component.scss',
})
export class XviFcBankAccountComponent {
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private readonly bankAccountService = inject(XviFcBankAccountService);
  private readonly utilityService = inject(UtilityService);

  @ViewChild('proofInput') private readonly proofInputRef!: ElementRef<HTMLInputElement>;

  readonly pageTitle = 'XVI-FC Bank Account (PFMS)';
  readonly pageDescription =
    'Confirm that your ULB has created a dedicated bank account for 16th Finance Commission grants, used for PFMS integration.';

  readonly fields = {
    ifscCode: { label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
    accountNumber: { label: 'Bank Account Number', placeholder: 'e.g. 1234567890' },
    confirmAccountNumber: { label: 'Re-enter Account Number', placeholder: 'Re-enter to confirm' },
    proof: {
      label: 'Proof of Account Existence',
      hint: 'Cancelled cheque · PDF, JPG, or PNG',
      uploadLabel: 'Click to upload cancelled cheque',
      acceptedFormatsText: 'PDF, JPG, or PNG',
      maxSizeMb: MAX_FILE_SIZE_BYTES / (1024 * 1024),
    },
  };

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly bankDetails = signal<XviFcBankDetails | null>(null);
  readonly existingRecord = signal<XviFcBankAccountResponse | null>(null);
  readonly isIfscLoading = signal(false);
  readonly isRecordLoading = signal(false);
  readonly isProofUploading = signal(false);
  readonly isSubmitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly ifscLookupError = signal<string | null>(null);
  readonly selectedProof = signal<XviFcBankAccountProof | null>(null);
  readonly proofError = signal<string | null>(null);
  readonly accountInputWarnings = signal<Record<'accountNumber' | 'confirmAccountNumber', string | null>>({
    accountNumber: null,
    confirmAccountNumber: null,
  });
  readonly submitted = signal(false);

  readonly form = new FormGroup(
    {
      ifscCode: new FormControl('', [Validators.required, Validators.pattern(IFSC_REGEX)]),
      accountNumber: new FormControl('', [Validators.required, accountNumberValidator()]),
      confirmAccountNumber: new FormControl('', [Validators.required, accountNumberValidator()]),
    },
    { validators: accountNumbersMatchValidator() },
  );

  constructor() {
    this.watchIfscCode();
    this.watchAccountNumberField(this.form.controls.accountNumber);
    this.watchAccountNumberField(this.form.controls.confirmAccountNumber);
    this.loadExistingRecord();
  }

  canSubmit(): boolean {
    return (
      this.isEditable() &&
      !this.isRecordLoading() &&
      !this.isProofUploading() &&
      !this.isSubmitting() &&
      this.form.valid &&
      !!this.bankDetails() &&
      !!this.selectedProof() &&
      !this.proofError() &&
      !!this.ulbDetails()?.designYearId
    );
  }

  isEditable(): boolean {
    const status = this.existingRecord()?.currentFormStatus;
    return status == null || EDITABLE_FORM_STATUSES.has(status);
  }


  shouldShowAccountNumberInputs(): boolean {
    return this.isEditable();
  }

  isInvalid(field: 'ifscCode' | 'accountNumber' | 'confirmAccountNumber'): boolean {
    const ctrl = this.form.get(field);
    if (!ctrl) return false;
    const fieldInvalid = ctrl.invalid && (ctrl.dirty || ctrl.touched || this.submitted());
    const matchInvalid =
      field === 'confirmAccountNumber' &&
      !!this.form.errors?.['accountMismatch'] &&
      (ctrl.dirty || ctrl.touched || this.submitted());
    return fieldInvalid || matchInvalid;
  }

  onAccountNumberInput(field: 'accountNumber' | 'confirmAccountNumber', event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '').slice(0, 18);
    this.setAccountInputWarning(field, input.value !== digitsOnly ? 'Only numbers are allowed.' : null);
    if (input.value !== digitsOnly) {
      input.value = digitsOnly;
    }
    this.form.controls[field].setValue(digitsOnly);
  }

  accountInputWarning(field: 'accountNumber' | 'confirmAccountNumber'): string | null {
    return this.accountInputWarnings()[field];
  }

  getError(field: 'ifscCode' | 'accountNumber' | 'confirmAccountNumber'): string {
    const ctrl = this.form.get(field);
    if (!ctrl) return '';

    if (ctrl.errors?.['api']) return ctrl.errors['api'];

    if (field === 'ifscCode') {
      if (ctrl.errors?.['required']) return 'IFSC Code is required.';
      if (ctrl.errors?.['pattern']) return 'Enter a valid IFSC code.';
    }

    if (field === 'accountNumber') {
      return this.getAccountNumberError(ctrl, 'Bank Account Number is required.');
    }

    if (field === 'confirmAccountNumber') {
      const fieldError = this.getAccountNumberError(ctrl, 'Re-enter Account Number is required.');
      if (fieldError) return fieldError;
      if (this.form.errors?.['accountMismatch']) return 'Account numbers do not match.';
    }

    return '';
  }

  triggerProofUpload(): void {
    if (!this.isEditable() || this.isProofUploading()) return;
    this.proofInputRef.nativeElement.value = '';
    this.proofInputRef.nativeElement.click();
  }

  async onProofSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.proofError.set(null);

    if (!file) return;

    if (!this.isEditable()) {
      this.proofError.set('This form is not editable in the current status.');
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      this.selectedProof.set(null);
      this.proofError.set('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.selectedProof.set(null);
      this.proofError.set('File size must not exceed 5 MB.');
      return;
    }

    const details = this.ulbDetails();
    if (!details?.designYearId) {
      this.selectedProof.set(null);
      this.proofError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      return;
    }

    this.isProofUploading.set(true);
    try {
      const signedUrl = await firstValueFrom(
        this.bankAccountService.getProofSignedUrl({
          ulbId: details.ulbId,
          designYearId: details.designYearId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      );

      await firstValueFrom(this.bankAccountService.uploadProofToS3(signedUrl.url, file));

      this.selectedProof.set({
        fileName: file.name,
        fileUrl: signedUrl.fileUrl,
        fileSize: file.size,
        mimeType: file.type,
      });
      this.utilityService.triggerSnackbar('Proof uploaded successfully.');
    } catch (error) {
      this.selectedProof.set(null);
      this.proofError.set('Proof upload failed. Please try again.');
      this.showApiError(error, 'Proof upload failed. Please try again.');
    } finally {
      this.isProofUploading.set(false);
    }
  }

  removeProof(): void {
    if (!this.isEditable()) return;
    this.selectedProof.set(null);
    this.proofError.set(null);
  }

  submit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (!this.isEditable()) {
      this.utilityService.triggerSnackbar('This form is not editable in the current status.', 'snackbar-danger');
      return;
    }

    const details = this.ulbDetails();
    if (!details?.designYearId) {
      this.loadError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      this.utilityService.triggerSnackbar(this.loadError()!, 'snackbar-danger');
      return;
    }

    const proof = this.selectedProof();
    if (!proof) {
      this.proofError.set('Cancelled cheque proof is required.');
    }

    if (!this.canSubmit() || !proof) return;

    const bankDetails = this.bankDetails();
    if (!bankDetails) return;

    this.isSubmitting.set(true);
    this.bankAccountService
      .submitBankAccount({
        ulbId: details.ulbId,
        designYearId: details.designYearId,
        ifscCode: this.form.controls.ifscCode.value ?? '',
        accountNumber: this.form.controls.accountNumber.value ?? '',
        confirmAccountNumber: this.form.controls.confirmAccountNumber.value ?? '',
        bankDetails,
        proof,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => {
          this.existingRecord.set(record);
          this.bankDetails.set(record.bankDetails);
          this.selectedProof.set(record.proof);
          this.form.patchValue({ accountNumber: '', confirmAccountNumber: '' }, { emitEvent: false });
          this.submitted.set(false);
          this.utilityService.triggerSnackbar('Bank account form submitted successfully.');
          this.location.back();
        },
        error: (error) => this.handleSubmitError(error),
      })
      .add(() => this.isSubmitting.set(false));
  }

  goBack(): void {
    this.location.back();
  }

  formatFileSize(bytes: number | null): string {
    if (!bytes) return 'Size unavailable';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private loadExistingRecord(): void {
    const details = this.ulbDetails();
    if (!details?.designYearId) {
      this.loadError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      return;
    }

    this.isRecordLoading.set(true);
    this.bankAccountService
      .getBankAccount({ yearId: details.designYearId, ulbId: details.ulbId })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => {
          if (!record) return;
          this.existingRecord.set(record);
          this.bankDetails.set(record.bankDetails);
          this.selectedProof.set(this.hasProof(record.proof) ? record.proof : null);
          this.form.patchValue({ ifscCode: record.ifscCode, accountNumber: '', confirmAccountNumber: '' }, { emitEvent: false });
        },
        error: (error) => {
          this.loadError.set('Unable to load bank account details. Please try again.');
          this.showApiError(error, this.loadError()!);
        },
      })
      .add(() => this.isRecordLoading.set(false));
  }

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails> & {
        _id?: string;
        ulb?: { _id?: string; id?: string };
      };
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;

      const userDataRaw = localStorage.getItem('userData');
      const userUlbId = userDataRaw ? (JSON.parse(userDataRaw) as { ulb?: string })?.ulb : undefined;

      return {
        ulbName: parsed.ulbName,
        stateName: parsed.stateName,
        selectedYear: parsed.selectedYear,
        designYearId: parsed.designYearId ?? localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) ?? undefined,
        ulbId: parsed.ulbId ?? parsed._id ?? parsed.ulb?._id ?? parsed.ulb?.id ?? userUlbId ?? undefined,
      };
    } catch {
      return null;
    }
  }

  private watchIfscCode(): void {
    const ifscControl = this.form.controls.ifscCode;

    ifscControl.valueChanges
      .pipe(
        startWith(ifscControl.value),
        map((value) => (value ?? '').trim().toUpperCase()),
        tap((value) => {
          if (ifscControl.value !== value) {
            ifscControl.setValue(value, { emitEvent: false });
          }
        }),
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((ifsc) => {
          this.bankDetails.set(null);
          this.ifscLookupError.set(null);

          if (!ifsc) return of(null);
          if (!IFSC_REGEX.test(ifsc)) return of(null);

          this.isIfscLoading.set(true);

          return this.bankAccountService.lookupIfsc(ifsc).pipe(
            map((result) => result.bankDetails),
            catchError(() => {
              this.ifscLookupError.set('No bank details found for this IFSC code.');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((bank) => {
        this.isIfscLoading.set(false);
        if (bank) {
          this.bankDetails.set(bank);
          return;
        }

        const existing = this.existingRecord();
        if (existing?.ifscCode === this.form.controls.ifscCode.value) {
          this.bankDetails.set(existing.bankDetails);
        }
      });
  }

  private watchAccountNumberField(control: FormControl<string | null>): void {
    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const digitsOnly = (value ?? '').replace(/\D/g, '').slice(0, 18);
      if (value !== digitsOnly) {
        control.setValue(digitsOnly, { emitEvent: false });
      }
    });
  }

  private setAccountInputWarning(field: 'accountNumber' | 'confirmAccountNumber', message: string | null): void {
    this.accountInputWarnings.update((warnings) => ({ ...warnings, [field]: message }));
  }

  private hasProof(proof: XviFcBankAccountProof | null | undefined): proof is XviFcBankAccountProof {
    return !!proof?.fileName && !!proof.fileUrl && !!proof.mimeType;
  }

  private handleSubmitError(error: unknown): void {
    const body = this.extractErrorBody(error);
    const errors = body?.errors ?? {};

    this.applyApiError('ifscCode', errors['ifscCode']);
    this.applyApiError('accountNumber', errors['accountNumber']);
    this.applyApiError('confirmAccountNumber', errors['confirmAccountNumber']);

    const proofMessage = errors['proof'] ?? errors['proof.fileName'] ?? errors['proof.fileUrl'] ?? errors['proof.fileSize'];
    if (proofMessage) this.proofError.set(this.formatApiMessage(proofMessage));

    this.showApiError(error, 'Unable to submit bank account form. Please try again.');
  }

  private applyApiError(field: 'ifscCode' | 'accountNumber' | 'confirmAccountNumber', message: string | string[] | undefined): void {
    if (!message) return;
    const control = this.form.controls[field];
    control.setErrors({ ...(control.errors ?? {}), api: this.formatApiMessage(message) });
    control.markAsTouched();
  }

  private showApiError(error: unknown, fallbackMessage: string): void {
    const body = this.extractErrorBody(error);
    this.utilityService.triggerSnackbar(this.formatApiMessage(body?.message) || fallbackMessage, 'snackbar-danger');
  }

  private extractErrorBody(error: unknown): ApiErrorBody | null {
    const maybe = error as { error?: ApiErrorBody; message?: string };
    return maybe?.error ?? (maybe?.message ? { message: maybe.message } : null);
  }

  private formatApiMessage(message: string | string[] | undefined): string {
    if (Array.isArray(message)) return message.join(' ');
    return message ?? '';
  }

  private getAccountNumberError(ctrl: AbstractControl, requiredMessage: string): string {
    const errors = ctrl.errors;
    if (!errors) return '';
    if (errors['api']) return errors['api'];
    if (errors['required']) return requiredMessage;
    if (errors['hasSpaces']) return 'No spaces allowed.';
    if (errors['hasAlphabets']) return 'No alphabets allowed. Digits only (0-9).';
    if (errors['hasSpecialChars']) return 'No special characters allowed. Digits only (0-9).';
    if (errors['tooShort']) return 'Minimum 9 digits required.';
    if (errors['tooLong']) return 'Maximum 18 digits allowed.';
    return '';
  }
}



