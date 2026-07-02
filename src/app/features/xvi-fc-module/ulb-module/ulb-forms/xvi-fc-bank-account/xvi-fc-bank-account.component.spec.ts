import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../../core/services/utility.service';
import { XviFcBankAccountComponent } from './xvi-fc-bank-account.component';
import { XviFcBankAccountService } from './xvi-fc-bank-account.service';
import { FORM_STATUS, XviFcBankAccountResponse } from './xvi-fc-bank-account.models';

const proof = {
  fileName: 'cancelled-cheque.pdf',
  fileUrl: 'https://bucket.s3.amazonaws.com/bank-account/proof/cancelled-cheque.pdf',
  fileSize: 1024,
  mimeType: 'application/pdf',
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
  proof,
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
    localStorage.setItem('userData', JSON.stringify({ ulb: 'ulb-id' }));

    service = jasmine.createSpyObj<XviFcBankAccountService>('XviFcBankAccountService', [
      'getBankAccount',
      'submitBankAccount',
      'getProofSignedUrl',
      'uploadProofToS3',
      'lookupIfsc',
    ]);
    service.getBankAccount.and.returnValue(of(null));
    service.lookupIfsc.and.returnValue(of({ ifscCode: 'UTIB0005157', bankDetails: record().bankDetails }));
    service.getProofSignedUrl.and.returnValue(of({ url: 'https://signed.example.com/upload', fileUrl: proof.fileUrl }));
    service.uploadProofToS3.and.returnValue(of(void 0));
    service.submitBankAccount.and.returnValue(of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })));

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
    component.selectedProof.set(proof);
    fixture.detectChanges();
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
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    expect(component.isEditable()).toBeFalse();
    expect(component.canSubmit()).toBeFalse();
  });

  it('hides account-number inputs for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    expect(component.shouldShowAccountNumberInputs()).toBeFalse();
    expect(fixture.nativeElement.querySelector('#account-number')).toBeNull();
    expect(fixture.nativeElement.querySelector('#confirm-account-number')).toBeNull();
  });

  it('keeps masked account number visible for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Saved account number');
    expect(text).toContain('********9012');
    expect(text).not.toContain('123456789012');
  });

  it('hides submit and cancel buttons for a submitted non-editable record', () => {
    service.getBankAccount.and.returnValue(
      of(record({ currentFormStatus: FORM_STATUS.UNDER_REVIEW_BY_STATE, currentFormStatusLabel: 'Under Review by State' })),
    );

    createComponent();

    const text = fixture.nativeElement.textContent as string;
    expect(fixture.nativeElement.querySelector('button.btn-success')).toBeNull();
    expect(text).not.toContain('Cancel');
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

    await component.onProofSelected({ target: { files: [new File(['x'], 'proof.gif', { type: 'image/gif' })] } } as unknown as Event);

    expect(component.proofError()).toBe('Only PDF, JPG, and PNG files are allowed.');
    expect(service.getProofSignedUrl).not.toHaveBeenCalled();
  });

  it('rejects file over 5 MB', async () => {
    createComponent();
    const largeFile = new File([new Blob([new Uint8Array(5 * 1024 * 1024 + 1)])], 'proof.pdf', { type: 'application/pdf' });

    await component.onProofSelected({ target: { files: [largeFile] } } as unknown as Event);

    expect(component.proofError()).toBe('File size must not exceed 5 MB.');
    expect(service.getProofSignedUrl).not.toHaveBeenCalled();
  });

  it('uploads valid file through signed-url flow', async () => {
    createComponent();
    const file = new File(['proof'], 'proof.pdf', { type: 'application/pdf' });

    await component.onProofSelected({ target: { files: [file] } } as unknown as Event);

    expect(service.getProofSignedUrl).toHaveBeenCalledWith({
      ulbId: 'ulb-id',
      designYearId: 'year-id',
      fileName: 'proof.pdf',
      fileSize: file.size,
      mimeType: 'application/pdf',
    });
    expect(service.uploadProofToS3).toHaveBeenCalledWith('https://signed.example.com/upload', file);
    expect(component.selectedProof()).toEqual({
      fileName: 'proof.pdf',
      fileUrl: proof.fileUrl,
      fileSize: file.size,
      mimeType: 'application/pdf',
    });
  });

  it('blocks submit when proof is missing', () => {
    createComponent();
    component.form.patchValue({ ifscCode: 'SBIN0123456', accountNumber: '123456789012', confirmAccountNumber: '123456789012' });
    component.bankDetails.set(record().bankDetails);

    component.submit();

    expect(component.proofError()).toBe('Cancelled cheque proof is required.');
    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('blocks submit when account numbers mismatch', () => {
    createComponent();
    component.form.patchValue({ ifscCode: 'SBIN0123456', accountNumber: '123456789012', confirmAccountNumber: '123456789013' });
    component.bankDetails.set(record().bankDetails);
    component.selectedProof.set(proof);

    component.submit();

    expect(service.submitBankAccount).not.toHaveBeenCalled();
  });

  it('submits uploaded proof metadata only and updates local safe record on success', () => {
    createComponent();
    hydrateValidForm();

    component.submit();

    const payload = service.submitBankAccount.calls.mostRecent().args[0];
    expect(payload.proof).toEqual(proof);
    expect(payload.proof).not.toEqual(jasmine.objectContaining({ filepath: jasmine.any(String) }));
    expect(component.existingRecord()?.accountNumberMasked).toBe('********9012');
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith('Bank account form submitted successfully.');
    expect(location.back).toHaveBeenCalled();
  });

  it('maps backend validation errors to controls and proof', () => {
    service.submitBankAccount.and.returnValue(
      throwError(() => ({
        error: {
          message: 'Validation failed.',
          errors: {
            accountNumber: 'Invalid account number.',
            proof: 'Proof is invalid.',
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

