import { Component, Input } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { FieldConfig } from '../../../../../shared/dynamic-form/field.interface';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { XviFcBankAccountComponent } from './xvi-fc-bank-account.component';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';
import {
  FORM_STATUS,
  XviFcBankAccountFormConfig,
  XviFcBankAccountProofFile,
  XviFcBankAccountResponse,
} from './xvi-fc-bank-account.models';

// Stubs the real dynamic-form renderer (which needs its own HttpClient/Material test scaffolding,
// already covered by input.component.spec.ts) so this file can assert on the host component's own
// wiring — same approach slb.component.spec.ts uses for the identical dependency.
@Component({ selector: 'app-dynamic-form', standalone: true, template: '' })
class StubDynamicFormComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() mode: 'edit' | 'view' = 'edit';
}

const proofPath = 'xvi-fc/bank-account/ulb-id/year-id/proof/cancelled-cheque.pdf';
const fullProofUrl = `https://jana-cityfinance-stg.s3.ap-south-1.amazonaws.com/${proofPath}`;
const signedPutUrl = `${fullProofUrl}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Signature=secret`;

const proofFile: XviFcBankAccountProofFile = {
  originalName: 'cancelled-cheque.pdf',
  mimeType: 'application/pdf',
  pages: 2,
  sizeKb: 12.25,
  s3Key: proofPath,
  sha256: 'a'.repeat(64),
  fileUrl: fullProofUrl,
};

const testFields: FieldConfig[] = [
  {
    key: 'ifscCode',
    label: 'IFSC Code',
    formFieldType: 'text',
    required: true,
    validations: [{ name: 'required', validator: null, message: 'IFSC code is required.' }],
  },
  { key: 'bankDetails.name', label: 'Bank Name', formFieldType: 'text', disabled: true },
  { key: 'bankDetails.branch', label: 'Branch', formFieldType: 'text', disabled: true },
  { key: 'bankDetails.address', label: 'Branch Address', formFieldType: 'text', disabled: true },
  { key: 'bankDetails.city', label: 'City', formFieldType: 'text', disabled: true },
  { key: 'bankDetails.state', label: 'State', formFieldType: 'text', disabled: true },
  { key: 'bankDetails.micr', label: 'MICR Code', formFieldType: 'text', disabled: true },
  {
    key: 'accountNumber',
    label: 'Account Number',
    formFieldType: 'text',
    required: true,
    digitsOnly: true,
    validations: [{ name: 'required', validator: null, message: 'Account number is required.' }],
  },
  {
    key: 'confirmAccountNumber',
    label: 'Confirm Account Number',
    formFieldType: 'text',
    required: true,
    matchesField: 'accountNumber',
    digitsOnly: true,
    validations: [{ name: 'required', validator: null, message: 'Please confirm the account number.' }],
  },
  {
    key: 'proofFile',
    label: 'Bank Proof Document',
    formFieldType: 'file',
    required: true,
    validations: [{ name: 'required', validator: null, message: 'A bank proof document is required.' }],
  },
] as FieldConfig[];

const formConfig: XviFcBankAccountFormConfig = { meta: {}, data: testFields };

const record = (overrides: Partial<XviFcBankAccountResponse> = {}): XviFcBankAccountResponse => ({
  _id: 'record-id',
  ulb: 'ulb-id',
  designYear: 'year-id',
  ifscCode: 'SBIN0123456',
  bankDetails: {
    name: 'State Bank of India',
    branch: 'Main Branch',
    address: 'MG Road',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    micr: null,
  },
  accountNumberMasked: '********9012',
  accountNumberLast4: '9012',
  proofFile,
  currentFormStatus: FORM_STATUS.IN_PROGRESS,
  currentFormStatusLabel: 'In Progress',
  ...overrides,
});

describe('XviFcBankAccountComponent', () => {
  let component: XviFcBankAccountComponent;
  let fixture: ComponentFixture<XviFcBankAccountComponent>;
  let service: jasmine.SpyObj<XviFcBankAccountService>;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem(
      'xvifc_ulb_details',
      JSON.stringify({ ulbName: 'Test ULB', stateName: 'Test State', selectedYear: 'FY-2026-27', ulbId: 'ulb-id' }),
    );
    localStorage.setItem('xvifc_selectedYearId', 'year-id');
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-id', state: 'state-id' }));

    service = jasmine.createSpyObj<XviFcBankAccountService>('XviFcBankAccountService', [
      'getFormConfig',
      'getBankAccount',
      'submitBankAccount',
      'getSignedUrls',
      'uploadProofToS3',
      'lookupIfsc',
    ]);
    service.getFormConfig.and.returnValue(of(formConfig));
    service.getBankAccount.and.returnValue(of(null));
    service.getSignedUrls.and.returnValue(of([{ url: signedPutUrl, fileUrl: fullProofUrl, path: proofPath }]));
    service.uploadProofToS3.and.returnValue(of(void 0));
    service.submitBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    const confirmDialogRef = jasmine.createSpyObj<MatDialogRef<unknown, string>>('MatDialogRef', ['afterClosed']);
    confirmDialogRef.afterClosed.and.returnValue(of('submit'));
    dialog.open.and.returnValue(confirmDialogRef);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, XviFcBankAccountComponent],
      providers: [
        { provide: XviFcBankAccountService, useValue: service },
        { provide: UtilityService, useValue: utilityService },
        { provide: MatDialog, useValue: dialog },
      ],
    })
      // The component imports MatDialogModule directly, which would otherwise shadow the
      // TestBed-level MatDialog override above — see upload-documents.component.spec.ts for the
      // same fix. Angular disallows mixing `set` with `add`/`remove` in one override, so the
      // DynamicFormComponent swap is expressed as a full `set` too.
      .overrideComponent(XviFcBankAccountComponent, {
        set: {
          imports: [StubDynamicFormComponent, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
          providers: [{ provide: MatDialog, useValue: dialog }],
        },
      })
      .compileComponents();
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(XviFcBankAccountComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }

  function hydrateValidForm(): void {
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      'bankDetails.name': record().bankDetails.name,
      'bankDetails.branch': record().bankDetails.branch,
      'bankDetails.address': record().bankDetails.address,
      'bankDetails.city': record().bankDetails.city,
      'bankDetails.state': record().bankDetails.state,
      'bankDetails.micr': record().bankDetails.micr,
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
    });
    component.selectedProof.set(proofFile);
    fixture.detectChanges();
  }

  function mockBlankValidation(valid: boolean, pages: number | null, error?: string): jasmine.Spy {
    return spyOn(component as any, 'validateProofNotBlank').and.resolveTo({ valid, pages, error });
  }

  it('fetches form config and existing record together on init', () => {
    service.getBankAccount.and.returnValue(of(record()));

    createComponent();

    expect(service.getFormConfig).toHaveBeenCalledWith('year-id');
    expect(service.getBankAccount).toHaveBeenCalledOnceWith({ yearId: 'year-id', ulbId: 'ulb-id' });
    expect(component.fields()).toEqual(testFields);
    expect(component.existingRecord()).toEqual(record());
  });

  it('does not create a proofFile form control (proof is managed by selectedProof, not the dynamic form)', () => {
    createComponent();

    // Regression: toFormGroup() previously built a control for every field including proofFile,
    // which — since nothing ever set its value — sat permanently `required`-invalid and blocked
    // form.valid forever regardless of what was actually uploaded via selectedProof.
    expect(component.form.controls['proofFile']).toBeUndefined();
  });

  it('canSubmit is not blocked by a missing proofFile form control once a proof is selected', () => {
    createComponent();
    hydrateValidForm();

    expect(component.form.valid).toBeTrue();
    expect(component.canSubmit()).toBeTrue();
  });

  it('hydrates ifscCode and bankDetails.* from an existing record, but never the account number', () => {
    service.getBankAccount.and.returnValue(of(record()));

    createComponent();

    expect(component.form.controls['ifscCode'].value).toBe('SBIN0123456');
    expect(component.form.controls['bankDetails.name'].value).toBe('State Bank of India');
    expect(component.form.controls['accountNumber'].value).toBeFalsy();
    expect(component.form.controls['confirmAccountNumber'].value).toBeFalsy();
  });

  it('keeps form editable and empty when GET returns null', () => {
    createComponent();

    expect(component.existingRecord()).toBeNull();
    expect(component.isEditable()).toBeTrue();
    expect(component.form.controls['ifscCode'].value).toBeFalsy();
  });

  it('shows masked account number only for existing record', () => {
    service.getBankAccount.and.returnValue(of(record()));

    createComponent();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('********9012');
    expect(text).not.toContain('123456789012');
  });

  it('disables submit/edit controls for non-editable currentFormStatus', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    expect(component.isEditable()).toBeFalse();
    expect(component.canSubmit()).toBeFalse();
  });

  it('excludes account-number fields from visibleFields for a locked record', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    const visibleKeys = component.visibleFields().map((f) => f.key);
    expect(visibleKeys).not.toContain('accountNumber');
    expect(visibleKeys).not.toContain('confirmAccountNumber');
    expect(visibleKeys).not.toContain('proofFile');
    expect(visibleKeys.some((key) => key.startsWith('bankDetails.'))).toBeFalse();
  });

  it('includes account-number fields in visibleFields for an editable record', () => {
    service.getBankAccount.and.returnValue(of(record({ currentFormStatus: FORM_STATUS.RETURNED_BY_STATE })));

    createComponent();

    const visibleKeys = component.visibleFields().map((f) => f.key);
    expect(visibleKeys).toContain('accountNumber');
    expect(visibleKeys).toContain('confirmAccountNumber');
  });

  it('permanently disables bankDetails.* controls regardless of editability', () => {
    service.getBankAccount.and.returnValue(of(record({ currentFormStatus: FORM_STATUS.RETURNED_BY_STATE })));

    createComponent();

    expect(component.form.controls['bankDetails.name'].disabled).toBeTrue();
    expect(component.form.controls['accountNumber'].disabled).toBeFalse();
  });

  it('shows the confirmed bank-details summary card once bankDetails.name is populated', () => {
    service.getBankAccount.and.returnValue(of(record()));

    createComponent();

    expect(component.bankDetailsSummary()).toEqual(record().bankDetails);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('State Bank of India');
    expect(text).toContain('Main Branch');
  });

  it('has no bank-details summary before the IFSC lookup resolves', () => {
    createComponent();

    expect(component.bankDetailsSummary()).toBeNull();
  });

  it('hides submit and cancel buttons for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    const cancelButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Cancel',
    );
    expect(fixture.nativeElement.querySelector('button.btn-success')).toBeNull();
    expect(cancelButton).toBeUndefined();
  });

  it('allows edit for editable statuses', () => {
    for (const status of [
      FORM_STATUS.NOT_STARTED,
      FORM_STATUS.IN_PROGRESS,
      FORM_STATUS.RETURNED_BY_STATE,
      FORM_STATUS.RETURNED_BY_MOHUA,
    ]) {
      service.getBankAccount.and.returnValue(of(record({ currentFormStatus: status })));
      createComponent();
      expect(component.isEditable()).withContext(`status ${status}`).toBeTrue();
      fixture.destroy();
    }
  });

  it('rejects invalid file type', async () => {
    createComponent();

    await component.onProofSelected({
      target: { files: [new File(['x'], 'proof.gif', { type: 'image/gif' })] },
    } as unknown as Event);

    expect(component.proofError()).toBe('Only PDF, JPG, and PNG files are allowed.');
    expect(service.getSignedUrls).not.toHaveBeenCalled();
  });

  it('rejects file over 5 MB', async () => {
    createComponent();
    const largeFile = new File([new Blob([new Uint8Array(5 * 1024 * 1024 + 1)])], 'proof.pdf', {
      type: 'application/pdf',
    });

    await component.onProofSelected({ target: { files: [largeFile] } } as unknown as Event);

    expect(component.proofError()).toBe('File size must not exceed 5 MB.');
    expect(service.getSignedUrls).not.toHaveBeenCalled();
  });

  it('uploads valid file through signed-url flow', async () => {
    createComponent();
    const validationSpy = mockBlankValidation(true, 6);
    const file = new File([new Uint8Array(2048)], 'cancelled-cheque.pdf', { type: 'application/pdf' });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(validationSpy).toHaveBeenCalledOnceWith(file);
    expect(service.getSignedUrls).toHaveBeenCalledWith([
      {
        fileName: 'cancelled-cheque.pdf',
        folder: 'xvi-fc/bank-account/ulb-id/year-id/proof',
        mimeType: 'application/pdf',
        fileSize: 2048,
        pages: 6,
        uploadId: jasmine.any(String),
        expiresIn: 300,
      },
    ]);
    expect(service.uploadProofToS3).toHaveBeenCalledWith(signedPutUrl, file);
    expect(component.selectedProof()).toEqual({
      originalName: 'cancelled-cheque.pdf',
      mimeType: 'application/pdf',
      pages: 6,
      sizeKb: 2,
      s3Key: proofPath,
      sha256: jasmine.stringMatching(/^[a-f0-9]{64}$/),
      fileUrl: fullProofUrl,
    });
  });

  it('rejects blank PDF proof before requesting a signed URL', async () => {
    createComponent();
    const blankMessage =
      'The uploaded proof document appears to be blank. Please upload a valid cancelled cheque or bank account proof.';
    mockBlankValidation(false, null, blankMessage);
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'blank.pdf', {
      type: 'application/pdf',
    });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);
    fixture.detectChanges();

    expect(component.proofError()).toBe(blankMessage);
    expect(component.selectedProof()).toBeNull();
    expect(service.getSignedUrls).not.toHaveBeenCalled();
    expect(service.uploadProofToS3).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent as string).toContain(blankMessage);
  });

  it('uploads image proof with null pages', async () => {
    const imagePath = 'xvi-fc/bank-account/ulb-id/year-id/proof/cancelled-cheque.png';
    service.getSignedUrls.and.returnValue(of([{ url: signedPutUrl, fileUrl: fullProofUrl, path: imagePath }]));
    createComponent();
    const validationSpy = mockBlankValidation(true, null);
    const file = new File([new Uint8Array(1024)], 'cancelled-cheque.png', { type: 'image/png' });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(validationSpy).toHaveBeenCalledOnceWith(file);
    expect(component.selectedProof()).toEqual(
      jasmine.objectContaining({ originalName: 'cancelled-cheque.png', mimeType: 'image/png', pages: null, s3Key: imagePath }),
    );
  });

  it('opens the proof document using the server-signed fileUrl in a new tab', () => {
    createComponent();
    const openSpy = spyOn(window, 'open');

    component.viewProof(proofFile);

    expect(openSpy).toHaveBeenCalledWith(fullProofUrl, '_blank', 'noopener,noreferrer');
  });

  it('shows an error snackbar when the proof document has no fileUrl', () => {
    createComponent();
    const openSpy = spyOn(window, 'open');

    component.viewProof({ ...proofFile, fileUrl: null });

    expect(openSpy).not.toHaveBeenCalled();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to open proof document. Please try again.',
      'snackbar-danger',
    );
  });

  it('blocks submit when proof is missing', () => {
    createComponent();
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      'bankDetails.name': record().bankDetails.name,
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
    });

    component.submit();

    expect(component.proofError()).toBe('Cancelled cheque proof is required.');
    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('blocks submit when account numbers mismatch', () => {
    createComponent();
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      'bankDetails.name': record().bankDetails.name,
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789013',
    });
    component.selectedProof.set(proofFile);

    component.submit();

    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('asks for confirmation before submitting to State DMA', async () => {
    createComponent();
    hydrateValidForm();

    await component.submit();

    expect(dialog.open).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({
        data: jasmine.objectContaining({
          title: 'Submit to State DMA?',
          buttons: [
            jasmine.objectContaining({ label: 'Cancel', result: 'cancel' }),
            jasmine.objectContaining({ label: 'Submit to State DMA', result: 'submit' }),
          ],
        }),
      }),
    );
  });

  it('does not submit when the confirmation dialog is cancelled', async () => {
    const dialogRef = jasmine.createSpyObj<MatDialogRef<unknown, string>>('MatDialogRef', ['afterClosed']);
    dialogRef.afterClosed.and.returnValue(of('cancel'));
    dialog.open.and.returnValue(dialogRef);
    createComponent();
    hydrateValidForm();

    await component.submit();

    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('submits uploaded proof metadata and bank details read off form controls', async () => {
    createComponent();
    hydrateValidForm();

    await component.submit();

    const payload = service.submitBankAccount.calls.mostRecent().args[0];
    expect(payload.ifscCode).toBe('SBIN0123456');
    expect(payload.bankDetails.name).toBe('State Bank of India');
    expect(payload.proofFile).toEqual(proofFile);
    expect(payload).not.toEqual(jasmine.objectContaining({ proof: jasmine.any(Object) }));
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Bank account form submitted successfully.');
  });

  it('locks the form after successful submit even when response status is editable', async () => {
    service.submitBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.IN_PROGRESS, currentFormStatusLabel: 'In Progress' })),
    );
    createComponent();
    hydrateValidForm();

    await component.submit();
    fixture.detectChanges();

    expect(component.isEditable()).toBeFalse();
    expect(component.form.controls['ifscCode'].disabled).toBeTrue();
  });

  it('maps backend validation errors to controls and proof', async () => {
    service.submitBankAccount.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Validation failed.',
          errors: { accountNumber: 'Invalid account number.', proofFile: 'Proof is invalid.' },
        },
      })),
    );
    createComponent();
    hydrateValidForm();

    await component.submit();

    expect(component.form.controls['accountNumber'].errors?.['api']).toBe('Invalid account number.');
    expect(component.proofError()).toBe('Proof is invalid.');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
  });
});
