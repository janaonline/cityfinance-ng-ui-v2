import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from './field.interface';
import { UploadedFileMetadata } from './components/file/file-metadata.types';
import { DynamicFormService } from './dynamic-form.service';

describe('DynamicFormService', () => {
  let service: DynamicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    });
    service = TestBed.inject(DynamicFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createContorl — actualTarget', () => {
    const field = {
      key: 'ind1',
      label: 'Per capita supply of water',
      formFieldType: 'actualTarget',
      validations: [
        { name: 'required', validator: null, message: 'Required.' },
        { name: 'min', validator: 0, message: 'Cannot be negative.' },
        { name: 'max', validator: 1000, message: 'Cannot exceed 1000.' },
      ],
    } as unknown as FieldConfig;

    it('builds a nested FormGroup with actual/target sub-controls', () => {
      const control = service.createContorl(field);

      expect(control instanceof FormGroup).toBeTrue();
      expect((control as FormGroup).get('actual')).toBeTruthy();
      expect((control as FormGroup).get('target')).toBeTruthy();
    });

    it('seeds initial values from field.value and serializes back to { actual, target }', () => {
      const control = service.createContorl({ ...field, value: { actual: 120, target: 150 } } as FieldConfig);

      expect(control.value).toEqual({ actual: 120, target: 150 });
    });

    it('applies the shared validations array to both sub-controls independently', () => {
      const control = service.createContorl(field) as FormGroup;

      control.get('actual')?.setValue(-5);
      control.get('target')?.setValue(5000);

      expect(control.get('actual')?.hasError('min')).toBeTrue();
      expect(control.get('actual')?.hasError('max')).toBeFalse();
      expect(control.get('target')?.hasError('max')).toBeTrue();
      expect(control.get('target')?.hasError('min')).toBeFalse();
    });

    it('marks both sub-controls required when empty', () => {
      const control = service.createContorl(field) as FormGroup;

      expect(control.get('actual')?.hasError('required')).toBeTrue();
      expect(control.get('target')?.hasError('required')).toBeTrue();
    });

    it('disables both sub-controls when readonly', () => {
      const control = service.createContorl(field, false, true) as FormGroup;

      expect(control.get('actual')?.disabled).toBeTrue();
      expect(control.get('target')?.disabled).toBeTrue();
    });

    it('does not attach the actualLessThanOrEqualToTarget group validator when the rule is absent from validations', () => {
      const control = service.createContorl(field, false) as FormGroup;

      control.get('actual')?.setValue(150);
      control.get('target')?.setValue(100);

      expect(control.get('target')?.hasError('actualLessThanOrEqualToTarget')).toBeFalse();
    });

    it('attaches the actualLessThanOrEqualToTarget group validator when declared in validations', () => {
      const fieldWithRule = {
        ...field,
        validations: [
          ...field.validations!,
          { name: 'actualLessThanOrEqualToTarget', validator: null, message: 'Actual must be less than or equal to target.' },
        ],
      } as FieldConfig;
      const control = service.createContorl(fieldWithRule, false) as FormGroup;

      control.get('actual')?.setValue(150);
      control.get('target')?.setValue(100);

      expect(control.get('target')?.hasError('actualLessThanOrEqualToTarget')).toBeTrue();

      control.get('actual')?.setValue(80);
      expect(control.get('target')?.hasError('actualLessThanOrEqualToTarget')).toBeFalse();
    });
  });

  it('normalizes an empty standalone file value to null so required validation starts invalid', () => {
    const control = service.createContorl({
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
      validations: [{ name: 'required', validator: null, message: 'Required' }],
      value: {
        fileName: '',
        fileUrl: '',
        fileSize: null,
        mimeType: '',
      },
    } as FieldConfig);

    control.addValidators(Validators.required);
    control.updateValueAndValidity();

    expect(control.value).toBeNull();
    expect(control.invalid).toBeTrue();
  });

  it('normalizes a pre-canonical persisted file value into the canonical shape for patch/edit mode', () => {
    const control = service.createContorl({
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
      value: {
        fileName: 'minutes.pdf',
        fileUrl: '/objects/minutes.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      },
    } as FieldConfig);

    expect(control.value).toEqual({
      originalName: 'minutes.pdf',
      path: '/objects/minutes.pdf',
      mimeType: 'application/pdf',
      sizeKb: 1,
      pageCount: null,
    });
    expect(control.valid).toBeTrue();
  });

  it('preserves a canonical persisted file value and drops the obsolete extension key', () => {
    const control = service.createContorl({
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
      value: {
        originalName: 'minutes.pdf',
        path: '/objects/minutes.pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        sizeKb: 128,
        pageCount: 4,
      },
    } as FieldConfig);

    expect(control.value).toEqual({
      originalName: 'minutes.pdf',
      path: '/objects/minutes.pdf',
      mimeType: 'application/pdf',
      sizeKb: 128,
      pageCount: 4,
    });
    expect(control.valid).toBeTrue();
  });

  it('preserves a CommonFile-shaped standalone file value (originalName/path/sizeKb) for patch/edit mode', () => {
    const control = service.createContorl({
      key: 'supportingDocumentFile',
      label: 'Supporting Document',
      formFieldType: 'file',
      value: {
        originalName: 'income-statement-schedules.pdf',
        path: 'xvi-fc/ulb/681dd165c11cf21bf1cfd06a/2026-27/slb/supporting-document/income-statement-schedules.pdf',
        mimeType: 'application/pdf',
        extension: 'pdf',
        sizeKb: 964.44,
        pageCount: 6,
      },
    } as FieldConfig);

    expect(control.value).toEqual({
      originalName: 'income-statement-schedules.pdf',
      path: 'xvi-fc/ulb/681dd165c11cf21bf1cfd06a/2026-27/slb/supporting-document/income-statement-schedules.pdf',
      mimeType: 'application/pdf',
      sizeKb: 964.44,
      pageCount: 6,
    });
    expect(control.valid).toBeTrue();
  });

  it('creates a disabled FormControl when field.disabled is true', () => {
    const control = service.createContorl({
      key: 'ulbCount',
      label: 'ULB count',
      formFieldType: 'number',
      value: 431,
      disabled: true,
    } as FieldConfig);

    expect(control.disabled).toBeTrue();
    expect(control.value).toBe(431);
  });

  it('does not disable a date field when only field.readonly is true', () => {
    const control = service.createContorl({
      key: 'startDate',
      label: 'Start date',
      formFieldType: 'date',
      value: null,
      readonly: true,
    } as FieldConfig);

    expect(control.disabled).toBeFalse();
  });

  it('serializes date field payload values to UTC ISO strings', () => {
    const payload = service.serializeFormPayload(
      [
        {
          key: 'startDate',
          label: 'Start date',
          formFieldType: 'date',
        } as FieldConfig,
      ],
      {
        startDate: new Date(2026, 0, 2),
      },
    );

    expect(payload['startDate']).toBe('2026-01-02T00:00:00.000Z');
  });

  it('preserves non-date values while keeping existing ISO date strings stable', () => {
    const payload = service.serializeFormPayload(
      [
        {
          key: 'startDate',
          label: 'Start date',
          formFieldType: 'date',
        } as FieldConfig,
        {
          key: 'title',
          label: 'Title',
          formFieldType: 'input',
        } as FieldConfig,
      ],
      {
        startDate: '2026-01-02T00:00:00.000Z',
        title: 'Budget review',
      },
    );

    expect(payload['startDate']).toBe('2026-01-02T00:00:00.000Z');
    expect(payload['title']).toBe('Budget review');
  });

  it('builds table rows from year data with row validations and readonly state', () => {
    const form = service.setTableData({
      data: [
        {
          key: 'rowA',
          readonly: true,
          validations: [{ name: 'required' }],
          year: [{ key: '2023-24', value: '10' }],
        },
      ],
    });

    const control = form.get('rowA.2023-24') as FormControl;
    expect(control.value).toBe('10');
    expect(control.disabled).toBeTrue();
    control.enable();
    control.setValue('');
    expect(control.hasError('required')).toBeTrue();
  });

  it('builds backup table data as a FormArray including optional row sums', () => {
    const formArray = service.setTableData_bkp({
      data: [
        {
          key: 'rowA',
          sum: 30,
          tableData: [{ key: 'amount', value: 10 }],
        },
      ],
    }) as FormArray;

    const row = formArray.at(0) as FormGroup;
    expect(formArray.length).toBe(1);
    expect(row.get('sum')?.value).toBe(30);
    expect((row.get('rowA') as FormArray).length).toBe(1);
  });

  it('sets questionnaire controls and compares total vacancy against total sanction', () => {
    const questionnaire = service.setQuestionnaireData({
      data: [
        { key: 'totVacancy', value: 20 },
        { key: 'totSanction', value: 10 },
      ],
    });

    questionnaire.updateValueAndValidity();

    expect(questionnaire.get('totVacancy.value')?.hasError('lessThan')).toBeTrue();
  });

  it('creates file form validators based on PDF availability, required flag, and rejection status', () => {
    const rejectedPdf = service.createFileForm(
      {
        isPdfAvailable: true,
        verifyStatus: 3,
        file: {},
      },
      false,
    );
    const requiredFile = service.createFileForm({ isPdfAvailable: false, file: {} }, true);
    const acceptedPdf = service.createFileForm(
      { isPdfAvailable: true, verifyStatus: 2, file: { name: 'ok.pdf' } },
      false,
    );

    expect(rejectedPdf.get('verifyStatus')?.value).toBe(3);
    expect(rejectedPdf.get('file.name')?.hasError('required')).toBeTrue();
    expect(rejectedPdf.get('rejectReason')?.hasError('required')).toBeTrue();
    expect(requiredFile.get('file.name')?.hasError('required')).toBeTrue();
    expect(acceptedPdf.get('verifyStatus')?.value).toBe(2);
  });

  it('binds standard validators and date boundary validators', () => {
    const validator = service.bindValidations([
      { name: 'required' },
      { name: 'pattern', validator: '^[A-Z]+$' },
      { name: 'minlength', validator: 3 },
      { name: 'maxlength', validator: 5 },
    ] as any);
    const control = new FormControl('ab', validator);

    expect(control.errors).toEqual(
      jasmine.objectContaining({
        pattern: jasmine.any(Object),
        minlength: jasmine.any(Object),
      }),
    );

    const dateValidator = service.bindValidations(false, {
      formFieldType: 'date',
      minDate: '2024-01-01',
      maxDate: '2024-12-31',
    } as FieldConfig);
    const dateControl = new FormControl(new Date(2023, 11, 31), dateValidator);

    expect(dateControl.valid).toBeFalse();
  });

  it('binds a "decimal" validations entry to a real decimalPlacesValidator error', () => {
    const wholeNumberValidator = service.bindValidations([{ name: 'decimal', validator: 0 }] as any);
    expect(new FormControl(100, wholeNumberValidator).valid).toBeTrue();
    expect(new FormControl(100.5, wholeNumberValidator).hasError('decimal')).toBeTrue();
  });

  it('creates a tab control with table, questionnaire, file, and regular fields', () => {
    const form = service.tabControl([
      {
        key: 'tab1',
        formArrays: [
          {
            key: 'tableField',
            formFieldType: 'table',
            data: [{ key: 'rowA', year: [{ key: 'amount', value: 5 }] }],
          },
          {
            key: 'questionnaireField',
            formFieldType: 'questionnaire',
            data: [
              { key: 'totVacancy', value: 1 },
              { key: 'totSanction', value: 2 },
            ],
          },
          {
            key: 'fileField',
            formFieldType: 'file',
            required: true,
            year: [{ key: '2023-24', isPdfAvailable: false, file: {} }],
          },
          {
            key: 'plainField',
            formFieldType: 'input',
            value: 'plain',
          },
        ],
      },
    ]);

    const tabArray = form.get('tab1') as FormArray;

    expect(tabArray.length).toBe(4);
    expect(tabArray.at(0).get('tableField.rowA.amount')?.value).toBe(5);
    expect(tabArray.at(1).get('questionnaireField.totVacancy.value')?.value).toBe(1);
    expect(tabArray.at(2).get('fileField.2023-24.file.name')?.hasError('required')).toBeTrue();
    expect(tabArray.at(3).get('plainField')?.value).toBe('plain');
  });

  it('creates simple form groups with empty string fallback for falsy non-file values', () => {
    const form = service.toFormGroup([
      { key: 'name', label: 'Name', formFieldType: 'input', value: 0 } as FieldConfig,
      {
        key: 'email',
        label: 'Email',
        formFieldType: 'input',
        value: 'bad-email',
        validations: [{ name: 'email', message: 'Invalid email' }],
      } as FieldConfig,
    ]);

    expect(form.get('name')?.value).toBe('');
    expect(form.get('email')?.hasError('pattern')).toBeTrue();
  });

  describe('toFormGroup — matchesField / digitsOnly', () => {
    it('sets matchesField error on the declaring control when values differ', () => {
      const form = service.toFormGroup([
        { key: 'accountNumber', label: 'Account Number', formFieldType: 'text' } as FieldConfig,
        {
          key: 'confirmAccountNumber',
          label: 'Confirm',
          formFieldType: 'text',
          matchesField: 'accountNumber',
        } as FieldConfig,
      ]);

      form.controls['accountNumber'].setValue('123');
      form.controls['confirmAccountNumber'].setValue('456');

      expect(form.controls['confirmAccountNumber'].hasError('matchesField')).toBeTrue();
    });

    it('clears matchesField error once values match', () => {
      const form = service.toFormGroup([
        { key: 'accountNumber', label: 'Account Number', formFieldType: 'text' } as FieldConfig,
        {
          key: 'confirmAccountNumber',
          label: 'Confirm',
          formFieldType: 'text',
          matchesField: 'accountNumber',
        } as FieldConfig,
      ]);

      form.controls['accountNumber'].setValue('123');
      form.controls['confirmAccountNumber'].setValue('123');

      expect(form.controls['confirmAccountNumber'].hasError('matchesField')).toBeFalse();
    });

    it('is inert for fields that do not set matchesField', () => {
      const form = service.toFormGroup([
        { key: 'a', label: 'A', formFieldType: 'text' } as FieldConfig,
        { key: 'b', label: 'B', formFieldType: 'text' } as FieldConfig,
      ]);

      form.controls['a'].setValue('one');
      form.controls['b'].setValue('two');

      expect(form.controls['a'].errors).toBeNull();
      expect(form.controls['b'].errors).toBeNull();
    });

    it('resolves matchesField against dotted flat keys, not nested paths', () => {
      const form = service.toFormGroup([
        { key: 'bankDetails.accountNumber', label: 'Account', formFieldType: 'text' } as FieldConfig,
        {
          key: 'bankDetails.confirmAccountNumber',
          label: 'Confirm',
          formFieldType: 'text',
          matchesField: 'bankDetails.accountNumber',
        } as FieldConfig,
      ]);

      form.controls['bankDetails.accountNumber'].setValue('123');
      form.controls['bankDetails.confirmAccountNumber'].setValue('456');

      expect(form.controls['bankDetails.confirmAccountNumber'].hasError('matchesField')).toBeTrue();
    });

    it('applies digitsOnly named errors sourced from validations[] min/maxlength', () => {
      const form = service.toFormGroup([
        {
          key: 'accountNumber',
          label: 'Account Number',
          formFieldType: 'text',
          digitsOnly: true,
          validations: [
            { name: 'minlength', validator: 9, message: 'Too short' },
            { name: 'maxlength', validator: 18, message: 'Too long' },
          ],
        } as FieldConfig,
      ]);

      form.controls['accountNumber'].setValue('12abc');
      expect(form.controls['accountNumber'].hasError('hasAlphabets')).toBeTrue();

      form.controls['accountNumber'].setValue('123');
      expect(form.controls['accountNumber'].hasError('tooShort')).toBeTrue();

      form.controls['accountNumber'].setValue('123456789');
      expect(form.controls['accountNumber'].errors).toBeNull();
    });

    it('is inert for fields that do not set digitsOnly', () => {
      const form = service.toFormGroup([{ key: 'name', label: 'Name', formFieldType: 'text' } as FieldConfig]);

      form.controls['name'].setValue('abc 123!');

      expect(form.controls['name'].errors).toBeNull();
    });

    it('creates a permanently-disabled control when the field declares disabled: true', () => {
      const form = service.toFormGroup([
        { key: 'bankDetails.name', label: 'Bank Name', formFieldType: 'text', disabled: true } as FieldConfig,
      ]);

      expect(form.controls['bankDetails.name'].disabled).toBeTrue();
    });
  });

  it('normalizes standalone file values from alternate property names and URL filenames', () => {
    const withName = service.createContorl({
      key: 'file',
      formFieldType: 'file',
      value: { name: 'report.pdf', url: '/docs/report.pdf', size: '2048' },
    } as FieldConfig);
    const withUrlOnly = service.createContorl({
      key: 'file',
      formFieldType: 'file',
      value: { fileUrl: '/docs/derived.pdf?download=true', fileSize: 'invalid' },
    } as FieldConfig);

    expect(withName.value).toEqual({
      originalName: 'report.pdf',
      path: '/docs/report.pdf',
      mimeType: '',
      sizeKb: 2,
      pageCount: null,
    });
    expect(withUrlOnly.value).toEqual({
      originalName: 'derived.pdf',
      path: '/docs/derived.pdf?download=true',
      mimeType: '',
      sizeKb: 0,
      pageCount: null,
    });
  });

  it('returns standalone file values unchanged and unmutated when serializing payloads', () => {
    const fileValue: UploadedFileMetadata = {
      originalName: 'report.pdf',
      path: 'xvi-fc/state/example/report.pdf',
      mimeType: 'application/pdf',
      sizeKb: 128,
      pageCount: 4,
    };
    const snapshot = { ...fileValue };
    const fileField = { key: 'file', formFieldType: 'file' } as FieldConfig;

    const serialized = service.serializeFieldValue(fileField, fileValue);

    expect(serialized).toBe(fileValue);
    expect(fileValue).toEqual(snapshot);
  });

  it('serializes a legacy-hydrated file value unchanged', () => {
    const hydratedValue: UploadedFileMetadata = {
      originalName: 'old.pdf',
      path: '/objects/old.pdf',
      mimeType: '',
      sizeKb: 2,
      pageCount: null,
    };

    const serialized = service.serializeFieldValue(
      { key: 'file', formFieldType: 'file' } as FieldConfig,
      hydratedValue,
    );

    expect(serialized).toBe(hydratedValue);
  });

  it('serializes empty or invalid file values to null', () => {
    const fileField = { key: 'file', formFieldType: 'file' } as FieldConfig;

    expect(service.serializeFieldValue(fileField, null)).toBeNull();
    expect(service.serializeFieldValue(fileField, undefined)).toBeNull();
    expect(service.serializeFieldValue(fileField, 'not-a-file')).toBeNull();
    expect(service.serializeFieldValue(fileField, { fileName: 'old.pdf', fileUrl: '/objects/old.pdf' })).toBeNull();
    expect(
      service.serializeFieldValue(fileField, {
        originalName: 'bad.pdf',
        path: '/objects/bad.pdf',
        mimeType: '',
        sizeKb: Number.NaN,
        pageCount: null,
      }),
    ).toBeNull();
  });

  it('skips missing keys while serializing form payloads', () => {
    const payload = service.serializeFormPayload(
      [
        { key: '', formFieldType: 'input' } as FieldConfig,
        { key: 'present', formFieldType: 'input' } as FieldConfig,
        { key: 'missing', formFieldType: 'input' } as FieldConfig,
      ],
      { present: 'yes' },
    );

    expect(payload).toEqual(jasmine.objectContaining({ present: 'yes' }));
    expect(Object.prototype.hasOwnProperty.call(payload, 'missing')).toBeFalse();
  });
});
