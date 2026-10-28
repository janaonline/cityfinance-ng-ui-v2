import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject, of, throwError } from 'rxjs';
import FileSaver from 'file-saver';
import { ConfirmDialogService } from '../../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import {
  ClaimLetterDocument,
  ClaimLetterLetterDetails,
  ClaimLetterLetterDetailsSaveResult,
  ClaimLetterParagraph,
} from '../../claim-letter.models';
import { ClaimLetterService } from '../../claim-letter.service';
import { ClaimLetterDocumentPreviewDialogComponent } from './claim-letter-document-preview-dialog.component';

const DEPARTMENT: ConditionalFieldConfig = {
  key: 'departmentName',
  formFieldType: 'text',
  label: 'Name of the department',
  placeholder: 'Name of department',
  value: 'Urban Development',
  validations: [{ name: 'maxlength', validator: 30, message: 'At most 30 characters.' }],
};
const LETTER_NO: ConditionalFieldConfig = {
  key: 'letterNo',
  formFieldType: 'text',
  label: 'Letter number',
  placeholder: 'Letter No.',
  value: '',
  validations: [],
};
const TRANSFERRED: ConditionalFieldConfig = {
  key: 'gtcTransferredInTime',
  formFieldType: 'radio',
  label: 'Was the grant transferred to ULBs within the stipulated time?',
  required: true,
  value: '',
  options: [
    { label: 'Yes', id: 'yes' },
    { label: 'No', id: 'no' },
  ],
  validations: [{ name: 'required', validator: null, message: 'This field is required.' }],
};

const p = (runs: ClaimLetterParagraph['runs'], number?: string): ClaimLetterParagraph =>
  number ? { runs, number } : { runs };

function letterDocument(): ClaimLetterDocument {
  return {
    refNo: 'CL/SS/2026-27/1-2',
    stateName: 'Sample State',
    designYearLabel: '2026-27',
    installment: 1,
    batchNumber: 2,
    asOn: '27 Oct 2026, 15:30',
    letter: {
      letterhead: p([
        { text: 'GOVERNMENT OF SAMPLE STATE', bold: true },
        { text: '\n' },
        { text: 'Urban Development', field: 'departmentName', bold: true },
      ]),
      letterNo: p([{ text: 'Letter No.: ' }, { text: '<●>', placeholder: true, field: 'letterNo' }]),
      refAndDate: p([{ text: 'CF Ref No.- CL/SS/2026-27/1-2' }]),
      addressee: p([{ text: 'To,' }]),
      subject: p([{ text: 'Subject' }]),
      referencesTitle: 'Reference:',
      references: [p([{ text: 'Operational Guidelines' }], '1.')],
      salutation: p([{ text: 'Sir/Madam,' }]),
      body: [p([{ text: 'The undersigned' }])],
      complianceHeaders: ['S. No.', 'Condition', 'Status'],
      compliance: [
        {
          key: 'A.',
          condition: [p([{ text: 'GTC' }])],
          status: [p([{ text: 'b) ' }, { text: '<Yes/No>', placeholder: true, field: 'gtcTransferredInTime' }])],
        },
      ],
      note: p([{ text: 'Note' }]),
      closing: [p([{ text: 'Requested' }], '5.')],
      signOff: p([{ text: 'Yours faithfully,' }]),
      signature: p([{ text: '<Signature>', placeholder: true }]),
    },
    annexure: { title: 'Annexure', columns: [], lists: [] },
    counts: {},
  } as unknown as ClaimLetterDocument;
}

function details(overrides: Partial<ClaimLetterLetterDetails> = {}): ClaimLetterLetterDetails {
  return {
    fields: [DEPARTMENT, LETTER_NO, TRANSFERRED],
    values: { departmentName: 'Urban Development' },
    canEdit: true,
    hasSignedFile: false,
    isComplete: false,
    missingFields: ['Was the grant transferred to ULBs within the stipulated time?'],
    letterDetailsUpdatedAt: null,
    previous: null,
    ...overrides,
  };
}

function saveResult(
  values: Record<string, unknown>,
  overrides: Partial<ClaimLetterLetterDetailsSaveResult> = {},
): ClaimLetterLetterDetailsSaveResult {
  return {
    values,
    isComplete: false,
    missingFields: [],
    hasSignedFile: false,
    letterDetailsUpdatedAt: '2026-10-27T10:00:00.000Z',
    signedFileRemoved: false,
    ...overrides,
  };
}

function apiError(status: number, body: Record<string, unknown>): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: body });
}

describe('ClaimLetterDocumentPreviewDialogComponent', () => {
  let fixture: ComponentFixture<ClaimLetterDocumentPreviewDialogComponent>;
  let component: ClaimLetterDocumentPreviewDialogComponent;
  let service: jasmine.SpyObj<ClaimLetterService>;
  let confirm: jasmine.Spy;
  let dialogRef: jasmine.SpyObj<MatDialogRef<unknown>>;

  function create(initial: ClaimLetterLetterDetails = details()): void {
    service.getLetterDetails.and.returnValue(of(initial));
    fixture = TestBed.createComponent(ClaimLetterDocumentPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function setValue(key: string, value: unknown): void {
    component.form!.get(key)!.setValue(value);
  }

  beforeEach(() => {
    service = jasmine.createSpyObj<ClaimLetterService>('ClaimLetterService', [
      'getLetterDetails',
      'saveLetterDetails',
      'getDocument',
      'getDocumentUlbs',
      'downloadDocumentDocx',
    ]);
    service.getDocument.and.returnValue(of(letterDocument()));
    service.getDocumentUlbs.and.returnValue(of({ rows: [], page: 1, limit: 20, total: 0 }));
    confirm = jasmine.createSpy('confirm').and.returnValue(of(true));
    dialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, ClaimLetterDocumentPreviewDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { claimLetterId: 'claim-1' } },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: ClaimLetterService, useValue: service },
        { provide: ConfirmDialogService, useValue: { confirm } },
      ],
    });
  });

  it('draws the letter-detail boxes inside the letter, filled with the saved values', () => {
    create();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector<HTMLInputElement>('#cl-field-departmentName')?.value).toBe('Urban Development');
    expect(el.querySelector('#cl-field-letterNo')).not.toBeNull();
    expect(el.querySelector('select#cl-field-gtcTransferredInTime')).not.toBeNull();
    expect(component.requiredSummary()).toEqual({ filled: 0, total: 1 });
    expect(component.statusText()).toBe('Changes save automatically');
  });

  it('shows the letter read-only with a message when letter details are not configured', () => {
    create(details({ fields: [], values: {} }));

    expect(component.configured()).toBeFalse();
    expect(component.letterEditor()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Letter details are not configured. Please contact the admin.',
    );
  });

  describe('autosave', () => {
    it('saves a box when it is left with a valid, changed value', () => {
      create();
      service.saveLetterDetails.and.returnValue(of(saveResult({ departmentName: 'Housing Department' })));

      setValue('departmentName', 'Housing Department ');
      component.onFieldCommitted('departmentName');

      expect(service.saveLetterDetails).toHaveBeenCalledOnceWith(
        'claim-1',
        { departmentName: 'Housing Department' },
        false,
      );
      expect(component.status()).toBe('saved');
    });

    it('does not save an unchanged or invalid value', () => {
      create();

      component.onFieldCommitted('departmentName');
      setValue('departmentName', 'x'.repeat(31));
      component.onFieldCommitted('departmentName');

      expect(service.saveLetterDetails).not.toHaveBeenCalled();
      expect(component.status()).toBe('invalid');
    });

    it('sends a cleared box as null so the server removes it', () => {
      create();
      service.saveLetterDetails.and.returnValue(of(saveResult({})));

      setValue('departmentName', '   ');
      component.onFieldCommitted('departmentName');

      expect(service.saveLetterDetails).toHaveBeenCalledOnceWith('claim-1', { departmentName: null }, false);
    });

    it('saves a cleared required box as blank instead of keeping the old value', () => {
      create(details({ values: { departmentName: 'Urban Development', gtcTransferredInTime: 'yes' } }));
      service.saveLetterDetails.and.returnValue(of(saveResult({ departmentName: 'Urban Development' })));

      setValue('gtcTransferredInTime', '');
      component.onFieldCommitted('gtcTransferredInTime');

      expect(service.saveLetterDetails).toHaveBeenCalledOnceWith('claim-1', { gtcTransferredInTime: null }, false);
      expect(component.status()).toBe('saved');
      expect(component.canDownload()).toBeFalse();
    });

    it('keeps one request in flight and batches later changes into the next one', () => {
      create();
      const first = new Subject<ClaimLetterLetterDetailsSaveResult>();
      service.saveLetterDetails.and.returnValues(
        first,
        of(saveResult({ departmentName: 'Housing', letterNo: 'UD/7', gtcTransferredInTime: 'no' })),
      );

      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');
      setValue('letterNo', 'UD/7');
      component.onFieldCommitted('letterNo');
      setValue('gtcTransferredInTime', 'no');
      component.onFieldCommitted('gtcTransferredInTime');

      expect(service.saveLetterDetails).toHaveBeenCalledTimes(1);
      expect(component.status()).toBe('saving');

      first.next(saveResult({ departmentName: 'Housing' }));
      first.complete();

      expect(service.saveLetterDetails).toHaveBeenCalledTimes(2);
      expect(service.saveLetterDetails.calls.mostRecent().args[1]).toEqual({
        letterNo: 'UD/7',
        gtcTransferredInTime: 'no',
      });
      expect(component.status()).toBe('saved');
    });

    it('puts server field errors on their boxes and resends the other keys', () => {
      create();
      const first = new Subject<ClaimLetterLetterDetailsSaveResult>();
      service.saveLetterDetails.and.returnValues(
        first,
        throwError(() =>
          apiError(400, {
            message: 'Validation failed',
            errors: { letterNo: [{ field: 'letterNo', code: 'type', message: 'Enter text.' }] },
          }),
        ),
        of(saveResult({ gtcTransferredInTime: 'yes', departmentName: 'Housing' })),
      );

      setValue('gtcTransferredInTime', 'yes');
      component.onFieldCommitted('gtcTransferredInTime');
      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');
      setValue('letterNo', 'UD/7');
      component.onFieldCommitted('letterNo');
      first.next(saveResult({ gtcTransferredInTime: 'yes' }));
      first.complete();

      expect(service.saveLetterDetails.calls.argsFor(1)[1]).toEqual({ departmentName: 'Housing', letterNo: 'UD/7' });
      expect(component.form!.get('letterNo')!.errors).toEqual({ server: 'Enter text.' });
      expect(service.saveLetterDetails.calls.argsFor(2)[1]).toEqual({ departmentName: 'Housing' });
      expect(component.status()).toBe('invalid');
    });

    it('reloads the latest details when they changed elsewhere', () => {
      create();
      service.saveLetterDetails.and.returnValue(
        throwError(() => apiError(409, { message: 'Changed elsewhere.', code: 'LETTER_DETAILS_CHANGED' })),
      );

      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');

      expect(service.getLetterDetails).toHaveBeenCalledTimes(2);
      expect(component.notice()).toBe('Changed elsewhere. The latest details have been loaded.');
      expect(component.form!.get('departmentName')!.value).toBe('Urban Development');
    });

    it('marks a failed save and resends it on Retry', () => {
      create();
      service.saveLetterDetails.and.returnValues(
        throwError(() => apiError(500, { message: 'Server error' })),
        of(saveResult({ departmentName: 'Housing' })),
      );

      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');
      expect(component.status()).toBe('failed');
      expect(component.canDownload()).toBeFalse();

      component.retry();

      expect(service.saveLetterDetails.calls.mostRecent().args[1]).toEqual({ departmentName: 'Housing' });
      expect(component.status()).toBe('saved');
    });
  });

  describe('signed letter uploaded', () => {
    it('stays read-only until Edit details is confirmed, then saves with the removal flag', () => {
      create(details({ hasSignedFile: true, isComplete: true }));
      expect(component.letterEditor()).toBeNull();
      expect((fixture.nativeElement as HTMLElement).querySelector('#cl-field-departmentName')).toBeNull();

      component.unlock();
      expect(component.letterEditor()).not.toBeNull();

      service.saveLetterDetails.and.returnValue(
        of(saveResult({ departmentName: 'Housing' }, { hasSignedFile: false, signedFileRemoved: true })),
      );
      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');

      expect(service.saveLetterDetails).toHaveBeenCalledOnceWith('claim-1', { departmentName: 'Housing' }, true);
      expect(component.hasSignedFile()).toBeFalse();
      expect(component.notice()).toContain('The uploaded signed letter was removed');
    });

    it('stays locked when Edit details is cancelled', () => {
      create(details({ hasSignedFile: true }));
      confirm.and.returnValue(of(false));

      component.unlock();

      expect(component.letterEditor()).toBeNull();
    });
  });

  describe('prefill', () => {
    const previous = {
      source: { yearLabel: '2025-26', installment: 2, batchNumber: 1 },
      values: { departmentName: 'Old Department', gtcTransferredInTime: 'yes' },
    };

    it('asks before replacing values, then saves every prefilled box in one request', () => {
      create(details({ previous }));
      service.saveLetterDetails.and.returnValue(of(saveResult(previous.values)));

      component.prefill();

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(service.saveLetterDetails).toHaveBeenCalledOnceWith('claim-1', previous.values, false);
      expect(component.notice()).toBe('Filled from Batch 1 (FY 2025-26, Installment 2).');
    });

    it('changes nothing when the replace is cancelled', () => {
      create(details({ previous }));
      confirm.and.returnValue(of(false));

      component.prefill();

      expect(component.form!.get('departmentName')!.value).toBe('Urban Development');
      expect(service.saveLetterDetails).not.toHaveBeenCalled();
    });
  });

  it('Next empty box focuses the next blank box in letter order', () => {
    create();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);

    component.focusNextEmpty();
    expect(document.activeElement?.id).toBe('cl-field-letterNo');

    component.focusNextEmpty();
    expect(document.activeElement?.id).toBe('cl-field-gtcTransferredInTime');

    el.remove();
  });

  describe('download', () => {
    it('is disabled until the required boxes are filled', () => {
      create();
      expect(component.canDownload()).toBeFalse();

      setValue('gtcTransferredInTime', 'yes');

      expect(component.canDownload()).toBeTrue();
    });

    it('waits for a pending save, then downloads the .docx', async () => {
      create();
      const save = new Subject<ClaimLetterLetterDetailsSaveResult>();
      service.saveLetterDetails.and.returnValue(save);
      service.downloadDocumentDocx.and.returnValue(of({ blob: new Blob(['x']), fileName: 'Claim.docx' }));
      const saveAs = spyOn(FileSaver, 'saveAs');

      setValue('gtcTransferredInTime', 'yes');
      component.onFieldCommitted('gtcTransferredInTime');
      const done = component.download();
      expect(service.downloadDocumentDocx).not.toHaveBeenCalled();

      save.next(saveResult({ departmentName: 'Urban Development', gtcTransferredInTime: 'yes' }, { isComplete: true }));
      save.complete();
      await done;

      expect(service.downloadDocumentDocx).toHaveBeenCalledOnceWith('claim-1');
      expect(saveAs).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('returns whether anything was saved', async () => {
      create();
      service.saveLetterDetails.and.returnValue(of(saveResult({ departmentName: 'Housing' })));
      setValue('departmentName', 'Housing');
      component.onFieldCommitted('departmentName');

      await component.close();

      expect(dialogRef.close).toHaveBeenCalledOnceWith({ saved: true });
    });

    it('asks before closing with a value that could not be saved', async () => {
      create();
      confirm.and.returnValue(of(false));
      setValue('departmentName', 'x'.repeat(31));
      component.onFieldCommitted('departmentName');

      await component.close();

      expect(confirm).toHaveBeenCalledTimes(1);
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });
});
