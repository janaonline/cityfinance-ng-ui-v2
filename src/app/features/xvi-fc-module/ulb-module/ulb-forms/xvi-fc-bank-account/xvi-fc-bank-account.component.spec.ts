import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { XviFcBankAccountComponent } from './xvi-fc-bank-account.component';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';
import { FORM_STATUS, XviFcBankAccountProofFile, XviFcBankAccountResponse } from './xvi-fc-bank-account.models';

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
};

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
  let location: jasmine.SpyObj<Location>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem(
      'xvifc_ulb_details',
      JSON.stringify({ ulbName: 'Test ULB', stateName: 'Test State', selectedYear: 'FY-2026-27', ulbId: 'ulb-id' }),
    );
    localStorage.setItem('xvifc_selectedYearId', 'year-id');
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-id', state: 'state-id' }));

    service = jasmine.createSpyObj<XviFcBankAccountService>('XviFcBankAccountService', [
      'getBankAccount',
      'submitBankAccount',
      'getSignedUrls',
      'uploadProofToS3',
      'lookupIfsc',
    ]);
    service.getBankAccount.and.returnValue(of(null));
    service.lookupIfsc.and.returnValue(of({ ifscCode: 'UTIB0005157', bankDetails: record().bankDetails }));
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
    location = jasmine.createSpyObj<Location>('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, XviFcBankAccountComponent],
      providers: [
        { provide: XviFcBankAccountService, useValue: service },
        { provide: UtilityService, useValue: utilityService },
        { provide: Location, useValue: location },
      ],
    }).compileComponents();
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
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
    });
    component.bankDetails.set(record().bankDetails);
    component.selectedProof.set(proofFile);
    fixture.detectChanges();
  }

  function mockBlankValidation(valid: boolean, pages: number | null, error?: string): jasmine.Spy {
    return spyOn(component as any, 'validateProofNotBlank').and.resolveTo({ valid, pages, error });
  }

  it('loads existing record on init', () => {
    service.getBankAccount.and.returnValue(of(record()));

    createComponent();

    expect(service.getBankAccount).toHaveBeenCalledOnceWith({ yearId: 'year-id', ulbId: 'ulb-id' });
    expect(component.existingRecord()).toEqual(record());
    expect(component.form.controls.ifscCode.value).toBe('SBIN0123456');
  });

  it('keeps form editable and empty when GET returns null', () => {
    createComponent();

    expect(component.existingRecord()).toBeNull();
    expect(component.isEditable()).toBeTrue();
    expect(component.form.controls.ifscCode.value).toBe('');
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
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    expect(component.isEditable()).toBeFalse();
    expect(component.canSubmit()).toBeFalse();
  });

  it('hides account-number inputs for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    expect(component.shouldShowAccountNumberInputs()).toBeFalse();
    expect(fixture.nativeElement.querySelector('#account-number')).toBeNull();
    expect(fixture.nativeElement.querySelector('#confirm-account-number')).toBeNull();
  });

  it('keeps masked account number visible for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Saved account number');
    expect(text).toContain('********9012');
    expect(text).not.toContain('123456789012');
  });

  it('hides submit and cancel buttons for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    const cancelButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Cancel',
    );
    expect(fixture.nativeElement.querySelector('button.btn-success')).toBeNull();
    expect(cancelButton).toBeUndefined();
  });

  it('renders bottom Back button for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    const bottomBackButton = Array.from(fixture.nativeElement.querySelectorAll('button.btn-link')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Back',
    );
    expect(bottomBackButton).toBeTruthy();
  });

  it('navigates back when bottom Back button is clicked', () => {
    service.getBankAccount.and.returnValue(
      of(
        record({
          currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE,
          currentFormStatusLabel: 'Under Review by State',
        }),
      ),
    );

    createComponent();

    const bottomBackButton = Array.from(fixture.nativeElement.querySelectorAll('button.btn-link')).find(
      (button) => (button as HTMLButtonElement).textContent?.trim() === 'Back',
    ) as HTMLButtonElement;
    bottomBackButton.click();

    expect(location.back).toHaveBeenCalled();
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

  it('shows account-number inputs for an editable existing record', () => {
    service.getBankAccount.and.returnValue(of(record({ currentFormStatus: FORM_STATUS.RETURNED_BY_STATE })));

    createComponent();

    expect(component.shouldShowAccountNumberInputs()).toBeTrue();
    expect(fixture.nativeElement.querySelector('#account-number')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#confirm-account-number')).not.toBeNull();
  });
  it('shows cancel button for an editable existing record', () => {
    service.getBankAccount.and.returnValue(of(record({ currentFormStatus: FORM_STATUS.RETURNED_BY_STATE })));

    createComponent();

    expect(fixture.nativeElement.textContent as string).toContain('Cancel');
  });
  it('uses backend IFSC lookup and hydrates bank details', fakeAsync(() => {
    createComponent();

    component.form.controls.ifscCode.setValue('utib0005157');
    tick(350);

    expect(service.lookupIfsc).toHaveBeenCalledWith('UTIB0005157');
    expect(component.bankDetails()).toEqual(record().bankDetails);
  }));

  it('does not call Razorpay directly from the browser', fakeAsync(() => {
    createComponent();

    component.form.controls.ifscCode.setValue('UTIB0005157');
    tick(350);

    httpMock.expectNone((req) => req.url.includes('ifsc.razorpay.com'));
    expect(service.lookupIfsc).toHaveBeenCalledWith('UTIB0005157');
  }));

  it('shows no-bank-details message when backend IFSC lookup fails', fakeAsync(() => {
    service.lookupIfsc.and.returnValue(throwError(() => ({ status: 404 })));
    createComponent();

    component.form.controls.ifscCode.setValue('UTIB0005157');
    tick(350);

    expect(component.ifscLookupError()).toBe('No bank details found for this IFSC code.');
    expect(component.bankDetails()).toBeNull();
  }));
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
    });
    expect(component.selectedProof()?.s3Key).toBe(proofPath);
    expect(component.selectedProof()?.s3Key).not.toBe(signedPutUrl);
    expect(component.selectedProof()?.s3Key).not.toBe(fullProofUrl);
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

  it('rejects zero-page or unreadable PDF proof before requesting a signed URL', async () => {
    createComponent();
    const parseMessage =
      'The uploaded proof document could not be validated. Please upload a valid cancelled cheque or bank account proof.';
    mockBlankValidation(false, null, parseMessage);
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'broken.pdf', {
      type: 'application/pdf',
    });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(component.proofError()).toBe(parseMessage);
    expect(component.selectedProof()).toBeNull();
    expect(service.getSignedUrls).not.toHaveBeenCalled();
    expect(service.uploadProofToS3).not.toHaveBeenCalled();
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
      jasmine.objectContaining({
        originalName: 'cancelled-cheque.png',
        mimeType: 'image/png',
        pages: null,
        sizeKb: 1,
        s3Key: imagePath,
        sha256: jasmine.stringMatching(/^[a-f0-9]{64}$/),
      }),
    );
  });

  it('normalizes full S3 proof URLs to storage paths for signed viewing', () => {
    createComponent();

    expect(component.proofStoragePath({ ...proofFile, s3Key: `${fullProofUrl}?X-Amz-Signature=secret` })).toBe(
      proofPath,
    );
  });

  it('opens proof document with a signed URL in a new tab', async () => {
    createComponent();
    const openSpy = spyOn(window, 'open');
    const viewPromise = component.viewProof({ ...proofFile, s3Key: `${fullProofUrl}?X-Amz-Signature=secret` });

    const req = httpMock.expectOne((request) => request.url.endsWith('get-signed-url'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fileUrl: proofPath });
    req.flush({ success: true, message: 'OK', data: { signedUrl: signedPutUrl } });
    await viewPromise;

    expect(openSpy).toHaveBeenCalledWith(signedPutUrl, '_blank', 'noopener,noreferrer');
  });

  it('rejects blank white image proof before requesting a signed URL', async () => {
    createComponent();
    const blankMessage =
      'The uploaded proof image appears to be blank. Please upload a valid cancelled cheque or bank account proof.';
    mockBlankValidation(false, null, blankMessage);
    const file = new File([new Uint8Array(1024)], 'blank-white.png', { type: 'image/png' });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(component.proofError()).toBe(blankMessage);
    expect(component.selectedProof()).toBeNull();
    expect(service.getSignedUrls).not.toHaveBeenCalled();
    expect(service.uploadProofToS3).not.toHaveBeenCalled();
  });

  it('rejects blank transparent PNG proof before requesting a signed URL', async () => {
    createComponent();
    const blankMessage =
      'The uploaded proof image appears to be blank. Please upload a valid cancelled cheque or bank account proof.';
    mockBlankValidation(false, null, blankMessage);
    const file = new File([new Uint8Array(1024)], 'blank-transparent.png', { type: 'image/png' });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(component.proofError()).toBe(blankMessage);
    expect(component.selectedProof()).toBeNull();
    expect(service.getSignedUrls).not.toHaveBeenCalled();
    expect(service.uploadProofToS3).not.toHaveBeenCalled();
  });

  it('keeps submit blocked after a blank proof selection', async () => {
    createComponent();
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
    });
    component.bankDetails.set(record().bankDetails);
    mockBlankValidation(
      false,
      null,
      'The uploaded proof document appears to be blank. Please upload a valid cancelled cheque or bank account proof.',
    );
    const file = new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d])], 'blank.pdf', {
      type: 'application/pdf',
    });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);
    component.submit();

    expect(component.canSubmit()).toBeFalse();
    expect(service.submitBankAccount).not.toHaveBeenCalled();
    expect(service.getSignedUrls).not.toHaveBeenCalled();
    expect(service.uploadProofToS3).not.toHaveBeenCalled();
  });

  it('blocks submit when proof is missing', () => {
    createComponent();
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789012',
    });
    component.bankDetails.set(record().bankDetails);

    component.submit();

    expect(component.proofError()).toBe('Cancelled cheque proof is required.');
    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('blocks submit when account numbers mismatch', () => {
    createComponent();
    component.form.patchValue({
      ifscCode: 'SBIN0123456',
      accountNumber: '123456789012',
      confirmAccountNumber: '123456789013',
    });
    component.bankDetails.set(record().bankDetails);
    component.selectedProof.set(proofFile);

    component.submit();

    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('submits uploaded proof metadata only and updates local safe record on success', () => {
    createComponent();
    hydrateValidForm();

    component.submit();

    const payload = service.submitBankAccount.calls.mostRecent().args[0];
    expect(payload.proofFile).toEqual(proofFile);
    expect(payload.proofFile.s3Key).toBe(proofPath);
    expect(payload.proofFile.s3Key).not.toBe(signedPutUrl);
    expect(payload.proofFile.s3Key).not.toBe(fullProofUrl);
    expect(payload).not.toEqual(jasmine.objectContaining({ proof: jasmine.any(Object) }));
    expect(component.existingRecord()?.accountNumberMasked).toBe('********9012');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Bank account form submitted successfully.');
    expect(location.back).toHaveBeenCalled();
  });

  it('locks IFSC editing after successful submit even when response status is editable', () => {
    service.submitBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.IN_PROGRESS, currentFormStatusLabel: 'In Progress' })),
    );
    createComponent();
    hydrateValidForm();

    component.submit();
    fixture.detectChanges();

    expect(component.isEditable()).toBeFalse();
    expect(component.form.controls.ifscCode.disabled).toBeTrue();
    expect((fixture.nativeElement.querySelector('#ifsc-code') as HTMLInputElement).disabled).toBeTrue();
  });

  it('maps backend validation errors to controls and proof', () => {
    service.submitBankAccount.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Validation failed.',
          errors: {
            accountNumber: 'Invalid account number.',
            proofFile: 'Proof is invalid.',
          },
        },
      })),
    );
    createComponent();
    hydrateValidForm();

    component.submit();

    expect(component.form.controls.accountNumber.errors?.['api']).toBe('Invalid account number.');
    expect(component.proofError()).toBe('Proof is invalid.');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Validation failed.', 'snackbar-danger');
  });
});
