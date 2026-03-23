import { TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { FieldConfig } from './field.interface';
import { DynamicFormService } from './dynamic-form.service';

describe('DynamicFormService', () => {
  let service: DynamicFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
});
