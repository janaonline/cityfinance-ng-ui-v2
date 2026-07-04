import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldConfig } from './field.interface';
import { DynamicFormService } from './dynamic-form.service';

describe('DynamicFormService', () => {
  let service: DynamicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }] });
    service = TestBed.inject(DynamicFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
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

  it('preserves a populated standalone file value for patch/edit mode', () => {
    const populatedValue = {
      fileName: 'minutes.pdf',
      fileUrl: '/objects/minutes.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
    };

    const control = service.createContorl({
      key: 'attachment',
      label: 'Attachment',
      formFieldType: 'file',
      value: populatedValue,
    } as FieldConfig);

    expect(control.value).toEqual(populatedValue);
    expect(control.valid).toBeTrue();
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
            data: [{ key: 'totVacancy', value: 1 }, { key: 'totSanction', value: 2 }],
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
      fileName: 'report.pdf',
      fileUrl: '/docs/report.pdf',
      fileSize: 2048,
    });
    expect(withUrlOnly.value).toEqual({
      fileName: 'derived.pdf',
      fileUrl: '/docs/derived.pdf?download=true',
      fileSize: null,
    });
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
