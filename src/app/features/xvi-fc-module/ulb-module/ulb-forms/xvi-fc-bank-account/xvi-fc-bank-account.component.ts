import { Component, computed, DestroyRef, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldConfig } from '../../../../../shared/dynamic-form/field.interface';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { checkPdfHasContent } from '../../../../../shared/dynamic-form/utils/pdf-blank-check.util';
import {
  FORM_STATUS,
  FormStatusType,
  XviFcBankAccountProofFile,
  XviFcBankAccountResponse,
  XviFcBankDetails,
} from './xvi-fc-bank-account.models';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PROOF_SIGNED_URL_EXPIRES_IN_SECONDS = 300;
const BLANK_PROOF_DOCUMENT_ERROR =
  'The uploaded proof document appears to be blank. Please upload a valid cancelled cheque or bank account proof.';
const BLANK_PROOF_IMAGE_ERROR =
  'The uploaded proof image appears to be blank. Please upload a valid cancelled cheque or bank account proof.';
const UNREADABLE_PROOF_DOCUMENT_ERROR =
  'The uploaded proof document could not be validated. Please upload a valid cancelled cheque or bank account proof.';
const EDITABLE_FORM_STATUSES = new Set<FormStatusType>([
  FORM_STATUS.NOT_STARTED,
  FORM_STATUS.IN_PROGRESS,
  FORM_STATUS.RETURNED_BY_STATE,
  FORM_STATUS.RETURNED_BY_MOHUA,
]);
/** Fields never shown once the form is locked — they're always blank in that state (never
 *  hydrated from the backend, per the account-number security policy in submit()/loadFormAndRecord()). */
const HIDDEN_WHEN_LOCKED_KEYS = new Set(['accountNumber', 'confirmAccountNumber']);
/** Rendered by the bespoke proof-upload block below instead of `<app-dynamic-form>` — see plan
 *  decision: blank-page/blank-image detection has no equivalent in the shared `<app-file>` yet. */
const BESPOKE_PROOF_FIELD_KEY = 'proofFile';
/** Rendered as a single confirmed-details summary card (see bankDetailsSummary()) instead of one
 *  `<app-dynamic-form>` input per sub-field. */
const BANK_DETAILS_KEY_PREFIX = 'bankDetails.';

const LOCKED_BANNER_MESSAGE: Readonly<Partial<Record<FormStatusType, string>>> = {
  [FORM_STATUS.UNDER_REVIEW_BY_STATE]: 'This form has been submitted to State DMA and is now locked for review.',
  [FORM_STATUS.APPROVED_BY_STATE]: 'This form has been approved by your State DMA and is now locked.',
  [FORM_STATUS.AWAITING_CLAIM_LETTER]:
    'This form has been approved by your State DMA and is awaiting claim letter generation before moving to MoHUA.',
  [FORM_STATUS.UNDER_REVIEW_BY_MOHUA]: 'This form has been approved by the state and is now under review by MoHUA.',
  [FORM_STATUS.SUBMISSION_ACKNOWLEDGED_BY_MOHUA]: 'This form has been approved by MoHUA. No further changes are needed.',
};

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
  ulbId?: string;
  stateId?: string;
  designYearId?: string;
}

interface ApiErrorBody {
  message?: string | string[];
  errors?: Record<string, string | string[]>;
}

@Component({
  selector: 'app-xvi-fc-bank-account',
  imports: [DynamicFormComponent, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './xvi-fc-bank-account.component.html',
  styleUrl: './xvi-fc-bank-account.component.scss',
})
export class XviFcBankAccountComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly bankAccountService = inject(XviFcBankAccountService);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicFormService = inject(DynamicFormService);

  @ViewChild('proofInput') private readonly proofInputRef!: ElementRef<HTMLInputElement>;

  readonly pageTitle = 'XVI-FC Bank Account (PFMS)';
  readonly pageDescription =
    'Confirm that your ULB has created a dedicated bank account to receive 16th Finance Commission grants linked to PFMS.';

  readonly proofField = {
    label: 'Proof of Account Existence',
    uploadLabel: 'Click to upload cancelled cheque',
    acceptedFormatsText: 'PDF, JPG, or PNG',
    maxSizeMb: MAX_FILE_SIZE_BYTES / (1024 * 1024),
  };

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly fields = signal<FieldConfig[]>([]);
  readonly existingRecord = signal<XviFcBankAccountResponse | null>(null);
  readonly isFormLoading = signal(false);
  readonly isProofUploading = signal(false);
  readonly isSubmitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly selectedProof = signal<XviFcBankAccountProofFile | null>(null);
  readonly proofError = signal<string | null>(null);
  readonly submittedSuccessfully = signal(false);

  form: FormGroup = new FormGroup({});

  /** Fields rendered via `<app-dynamic-form>` — excludes the bespoke proof-file block and the
   *  bankDetails.* sub-fields (shown instead as a single summary card, see bankDetailsSummary()),
   *  and hides account-number/confirm-account-number once the form is locked (always blank then). */
  readonly visibleFields = computed(() => {
    const editable = this.isEditable();
    return this.fields().filter(
      (field) =>
        field.key !== BESPOKE_PROOF_FIELD_KEY &&
        !field.key.startsWith(BANK_DETAILS_KEY_PREFIX) &&
        (editable || !HIDDEN_WHEN_LOCKED_KEYS.has(field.key)),
    );
  });

  /** Read-only "confirmed bank details" card shown once the IFSC lookup (or a hydrated existing
   *  record) has populated the bankDetails.* controls — null while unresolved. */
  bankDetailsSummary(): XviFcBankDetails | null {
    const name = this.controlValue('bankDetails.name');
    if (!name) return null;
    return {
      name,
      branch: this.controlValue('bankDetails.branch') ?? '',
      address: this.controlValue('bankDetails.address') ?? '',
      city: this.controlValue('bankDetails.city') ?? '',
      state: this.controlValue('bankDetails.state') ?? undefined,
      micr: this.controlValue('bankDetails.micr') ?? null,
    };
  }

  constructor() {
    this.loadFormAndRecord();
  }

  canSubmit(): boolean {
    return (
      this.isEditable() &&
      !this.isFormLoading() &&
      !this.isProofUploading() &&
      !this.isSubmitting() &&
      this.form.valid &&
      !!this.controlValue('bankDetails.name') &&
      !!this.selectedProof() &&
      !this.proofError() &&
      !!this.ulbDetails()?.designYearId &&
      !!this.ulbDetails()?.stateId
    );
  }

  isEditable(): boolean {
    if (this.submittedSuccessfully()) return false;
    const status = this.existingRecord()?.currentFormStatus;
    return status == null || EDITABLE_FORM_STATUSES.has(status);
  }

  /** Human-readable reason the Submit button is currently disabled, or null when submittable —
   *  mirrors canSubmit()'s conditions in order so the first failing one is reported. */
  submitBlockedReason(): string | null {
    if (!this.isEditable()) return null; // Submit is hidden entirely in this case; no reason needed.
    if (this.isFormLoading()) return 'Form is still loading.';
    if (this.isProofUploading()) return 'Proof file is still uploading.';
    if (this.isSubmitting()) return 'Submitting…';
    if (!this.form.valid) return null;
    if (!this.controlValue('bankDetails.name')) return 'Enter a valid IFSC code to resolve bank details first.';
    if (!this.selectedProof()) return 'Upload a proof document.';
    if (this.proofError()) return this.proofError();
    if (!this.ulbDetails()?.designYearId || !this.ulbDetails()?.stateId) {
      return 'Selected year or state context is missing. Please reopen this form from the condition tile.';
    }
    return null;
  }

  readonly lockedBannerMessage = computed(() => {
    const status = this.existingRecord()?.currentFormStatus;
    return (status != null && LOCKED_BANNER_MESSAGE[status]) || 'This form is not editable in the current status.';
  });

  readonly isReturnedStatus = computed(() => {
    const status = this.existingRecord()?.currentFormStatus;
    return status === FORM_STATUS.RETURNED_BY_STATE || status === FORM_STATUS.RETURNED_BY_MOHUA;
  });

  // Shown when the form was just reopened (RETURNED_BY_STATE/RETURNED_BY_MOHUA) — explains why,
  // even though the form itself is editable again at that point.
  readonly returnNotice = computed(() => {
    const record = this.existingRecord();
    const status = record?.currentFormStatus;
    if (status !== FORM_STATUS.RETURNED_BY_STATE && status !== FORM_STATUS.RETURNED_BY_MOHUA) return null;
    const actor = status === FORM_STATUS.RETURNED_BY_STATE ? 'the state' : 'MoHUA';
    const note = (status === FORM_STATUS.RETURNED_BY_STATE ? record?.stateDecision?.note : record?.mohuaDecision?.note) ?? null;
    return note ? `Returned by ${actor}: ${note}` : `This form was returned by ${actor} for correction.`;
  });

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
    this.selectedProof.set(null);

    if (!this.isEditable()) {
      this.proofError.set('This form is not editable in the current status.');
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      this.proofError.set('Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.proofError.set('File size must not exceed 5 MB.');
      return;
    }

    this.isProofUploading.set(true);
    const proofValidation = await this.validateProofNotBlank(file);
    if (!proofValidation.valid) {
      this.proofError.set(proofValidation.error ?? UNREADABLE_PROOF_DOCUMENT_ERROR);
      this.isProofUploading.set(false);
      return;
    }

    const details = this.ulbDetails();
    if (!details?.ulbId || !details.designYearId) {
      this.proofError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      this.isProofUploading.set(false);
      return;
    }

    try {
      const sha256 = await this.calculateSha256(file);
      const folder = this.buildProofFolder(details.ulbId, details.designYearId);
      const [signedUrl] = await firstValueFrom(
        this.bankAccountService.getSignedUrls([
          {
            fileName: file.name,
            folder,
            mimeType: file.type,
            fileSize: file.size,
            pages: proofValidation.pages ?? 0,
            uploadId: this.generateUploadId(),
            expiresIn: PROOF_SIGNED_URL_EXPIRES_IN_SECONDS,
          },
        ]),
      );
      if (!signedUrl?.url || !signedUrl.path) {
        throw new Error('Signed URL response is missing upload details.');
      }

      await firstValueFrom(this.bankAccountService.uploadProofToS3(signedUrl.url, file));

      this.selectedProof.set({
        originalName: file.name,
        mimeType: file.type as XviFcBankAccountProofFile['mimeType'],
        pages: proofValidation.pages,
        sizeKb: Number((file.size / 1024).toFixed(2)),
        s3Key: signedUrl.path,
        sha256,
        fileUrl: signedUrl.fileUrl,
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
    this.form.markAllAsTouched();

    if (!this.isEditable()) {
      this.utilityService.triggerSnackbar('This form is not editable in the current status.', 'snackbar-danger');
      return;
    }

    const details = this.ulbDetails();
    if (!details?.designYearId || !details.stateId) {
      this.loadError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      this.utilityService.triggerSnackbar(this.loadError()!, 'snackbar-danger');
      return;
    }

    const proof = this.selectedProof();
    if (!proof) {
      this.proofError.set('Cancelled cheque proof is required.');
    }

    if (!this.canSubmit() || !proof) return;

    const bankDetails: XviFcBankDetails = {
      name: this.controlValue('bankDetails.name') ?? '',
      branch: this.controlValue('bankDetails.branch') ?? '',
      address: this.controlValue('bankDetails.address') ?? '',
      city: this.controlValue('bankDetails.city') ?? '',
      state: this.controlValue('bankDetails.state') ?? undefined,
      micr: this.controlValue('bankDetails.micr') ?? null,
    };

    this.isSubmitting.set(true);
    this.bankAccountService
      .submitBankAccount({
        ulbId: details.ulbId,
        stateId: details.stateId,
        designYearId: details.designYearId,
        ifscCode: this.controlValue('ifscCode') ?? '',
        accountNumber: this.controlValue('accountNumber') ?? '',
        confirmAccountNumber: this.controlValue('confirmAccountNumber') ?? '',
        bankDetails,
        proofFile: proof,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (record) => {
          this.existingRecord.set(record);
          this.selectedProof.set(record.proofFile);
          this.form.patchValue({ accountNumber: '', confirmAccountNumber: '' }, { emitEvent: false });
          this.submittedSuccessfully.set(true);
          this.syncFormControlsState();
          this.utilityService.triggerSnackbar('Bank account form submitted successfully.');
        },
        error: (error) => this.handleSubmitError(error),
      })
      .add(() => this.isSubmitting.set(false));
  }

  formatFileSize(sizeKb: number | null): string {
    if (sizeKb === null || sizeKb === undefined) return 'Size unavailable';
    return `${sizeKb.toFixed(2)} KB`;
  }

  viewProof(proof: XviFcBankAccountProofFile): void {
    if (!proof.fileUrl) {
      this.utilityService.triggerSnackbar('Unable to open proof document. Please try again.', 'snackbar-danger');
      return;
    }
    window.open(proof.fileUrl, '_blank', 'noopener,noreferrer');
  }

  private controlValue(key: string): string | undefined {
    return this.form.controls[key]?.value;
  }

  private loadFormAndRecord(): void {
    const details = this.ulbDetails();
    if (!details?.designYearId) {
      this.loadError.set('Selected year context is missing. Please reopen this form from the condition tile.');
      return;
    }

    this.isFormLoading.set(true);
    forkJoin({
      config: this.bankAccountService.getFormConfig(details.designYearId),
      record: this.bankAccountService.getBankAccount({ yearId: details.designYearId, ulbId: details.ulbId }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ config, record }) => {
          this.fields.set(config.data);
          // proofFile is deliberately excluded: it's managed by the bespoke selectedProof
          // signal/onProofSelected() below, not a dynamic-form control — a control for it here
          // would sit permanently unset (and permanently `required`-invalid), blocking form.valid
          // forever regardless of what's actually uploaded.
          this.form = this.dynamicFormService.toFormGroup(
            config.data.filter((field) => field.key !== BESPOKE_PROOF_FIELD_KEY),
          );

          if (record) {
            this.existingRecord.set(record);
            // A returned form's stale (possibly-rejected) proof isn't pre-filled — the ULB must
            // upload a fresh document before resubmitting.
            this.selectedProof.set(
              this.isReturnedStatus() || !this.hasProof(record.proofFile) ? null : record.proofFile,
            );
            this.form.patchValue(
              {
                ifscCode: record.ifscCode,
                'bankDetails.name': record.bankDetails.name,
                'bankDetails.branch': record.bankDetails.branch,
                'bankDetails.address': record.bankDetails.address,
                'bankDetails.city': record.bankDetails.city,
                'bankDetails.state': record.bankDetails.state,
                'bankDetails.micr': record.bankDetails.micr,
              },
              { emitEvent: false },
            );
          }
          this.syncFormControlsState();
        },
        error: (error) => {
          this.loadError.set('Unable to load bank account details. Please try again.');
          this.showApiError(error, this.loadError()!);
        },
      })
      .add(() => {
        this.isFormLoading.set(false);
        this.syncFormControlsState();
      });
  }

  /** Toggles editability for every field except those permanently backend-computed
   *  (`FieldConfig.disabled`, e.g. `bankDetails.*` — always auto-filled by the IFSC lookup, never
   *  hand-typed, regardless of the overall form's editable/locked state). */
  private syncFormControlsState(): void {
    const method = this.isEditable() ? 'enable' : 'disable';
    const permanentlyDisabledKeys = new Set(this.fields().filter((field) => field.disabled).map((field) => field.key));
    Object.keys(this.form.controls).forEach((key) => {
      if (permanentlyDisabledKeys.has(key)) return;
      this.form.controls[key][method]({ emitEvent: false });
    });
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
      const userData = userDataRaw ? (JSON.parse(userDataRaw) as { ulb?: string; state?: string }) : undefined;

      return {
        ulbName: parsed.ulbName,
        stateName: parsed.stateName,
        selectedYear: parsed.selectedYear,
        designYearId: parsed.designYearId ?? localStorage.getItem(XVIFC_LS_KEYS.selectedYearId) ?? undefined,
        ulbId: parsed.ulbId ?? parsed._id ?? parsed.ulb?._id ?? parsed.ulb?.id ?? userData?.ulb ?? undefined,
        stateId: userData?.state ?? undefined,
      };
    } catch {
      return null;
    }
  }

  private hasProof(proofFile: XviFcBankAccountProofFile | null | undefined): proofFile is XviFcBankAccountProofFile {
    return !!proofFile?.originalName && !!proofFile.s3Key && !!proofFile.mimeType && !!proofFile.sha256;
  }

  private async calculateSha256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private async validateProofNotBlank(file: File): Promise<{ valid: boolean; error?: string; pages: number | null }> {
    if (file.type === 'application/pdf') {
      return this.validatePdfProofNotBlank(file);
    }
    return this.validateImageProofNotBlank(file);
  }

  private async validatePdfProofNotBlank(file: File): Promise<{ valid: boolean; error?: string; pages: number | null }> {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const hasPdfHeader =
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46 &&
      header[4] === 0x2d;
    if (!hasPdfHeader) {
      return { valid: false, error: UNREADABLE_PROOF_DOCUMENT_ERROR, pages: null };
    }

    // Same render-based blank-check used for the Audited/Provisional financial statement
    // uploads — see checkPdfHasContent for why unexpected failures fail open instead of
    // rejecting every file.
    const result = await checkPdfHasContent(file);
    if (result.fatalError === 'password' || result.fatalError === 'invalid') {
      return { valid: false, error: UNREADABLE_PROOF_DOCUMENT_ERROR, pages: null };
    }
    if (result.pageCount === 0) {
      return { valid: false, error: UNREADABLE_PROOF_DOCUMENT_ERROR, pages: null };
    }
    if (!result.hasContent) {
      return { valid: false, error: BLANK_PROOF_DOCUMENT_ERROR, pages: null };
    }

    return { valid: true, pages: result.pageCount };
  }

  private async validateImageProofNotBlank(file: File): Promise<{ valid: boolean; error?: string; pages: number | null }> {
    try {
      const image = await this.loadImage(file);
      const maxDimension = 600;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { valid: false, error: UNREADABLE_PROOF_DOCUMENT_ERROR, pages: null };
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);

      if (this.isCanvasBlank(ctx, width, height)) {
        return { valid: false, error: BLANK_PROOF_IMAGE_ERROR, pages: null };
      }

      return { valid: true, pages: null };
    } catch {
      return { valid: false, error: UNREADABLE_PROOF_DOCUMENT_ERROR, pages: null };
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Unable to load image.'));
      };
      image.src = objectUrl;
    });
  }

  private isCanvasBlank(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
    const { data } = ctx.getImageData(0, 0, width, height);
    const totalPixels = width * height;
    let visiblePixels = 0;
    let contentPixels = 0;
    let minLuminance = 255;
    let maxLuminance = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha < 10) continue;

      const red = data[i];
      const green = data[i + 1];
      const blue = data[i + 2];
      const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
      const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

      visiblePixels++;
      minLuminance = Math.min(minLuminance, luminance);
      maxLuminance = Math.max(maxLuminance, luminance);

      if (luminance < 245 || colorSpread > 20) {
        contentPixels++;
      }
    }

    if (visiblePixels / totalPixels < 0.005) return true;

    const contentRatio = contentPixels / totalPixels;
    const contrast = maxLuminance - minLuminance;
    return contentRatio < 0.005 && contrast < 18;
  }

  private buildProofFolder(ulbId: string, designYearId: string): string {
    return `xvi-fc/bank-account/${encodeURIComponent(ulbId)}/${encodeURIComponent(designYearId)}/proof`;
  }

  private generateUploadId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private handleSubmitError(error: unknown): void {
    const body = this.extractErrorBody(error);
    const errors = body?.errors ?? {};

    this.applyApiError('ifscCode', errors['ifscCode']);
    this.applyApiError('accountNumber', errors['accountNumber']);
    this.applyApiError('confirmAccountNumber', errors['confirmAccountNumber']);

    const proofMessage =
      errors['proofFile'] ??
      errors['proofFile.originalName'] ??
      errors['proofFile.s3Key'] ??
      errors['proofFile.sizeKb'] ??
      errors['proofFile.sha256'];
    if (proofMessage) this.proofError.set(this.formatApiMessage(proofMessage));

    this.showApiError(error, 'Unable to submit bank account form. Please try again.');
  }

  private applyApiError(field: string, message: string | string[] | undefined): void {
    if (!message) return;
    const control = this.form.controls[field];
    if (!control) return;
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
}
