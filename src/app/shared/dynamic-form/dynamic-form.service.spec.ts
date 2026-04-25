import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
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
});
