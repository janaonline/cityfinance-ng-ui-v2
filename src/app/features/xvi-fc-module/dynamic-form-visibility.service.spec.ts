import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { signal } from '@angular/core';
import { DestroyRef } from '@angular/core';

import { ConditionalFieldConfig, DynamicFormVisibilityService } from './dynamic-form-visibility.service';

describe('DynamicFormVisibilityService', () => {
  let service: DynamicFormVisibilityService;
  let fb: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    });
    service = TestBed.inject(DynamicFormVisibilityService);
    fb = TestBed.inject(FormBuilder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('"in" operator in evaluateFieldVisibility', () => {
    function buildForm(controllerValue: unknown): ReturnType<FormBuilder['group']> {
      return fb.group({ controller: [controllerValue], dependent: [null] });
    }

    function buildFields(values: unknown[]): ConditionalFieldConfig[] {
      return [
        { formFieldType: 'radio', label: 'Controller', key: 'controller' },
        {
          formFieldType: 'text',
          label: 'Dependent',
          key: 'dependent',
          visibleWhen: {
            mode: 'all',
            conditions: [{ key: 'controller', operator: 'in', value: values }],
          },
        },
      ];
    }

    it('shows field when controller value is in the allowed list', () => {
      const form = buildForm('reportSubmittedAtrTabled');
      const fields = buildFields(['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled']);
      const fieldsSignal = signal(fields);
      const destroyRef = TestBed.inject(DestroyRef);

      service.bindVisibility({ form, fieldsSignal, dependencyIndex: service.createDependencyIndex(fields), destroyRef });

      expect(fieldsSignal()[1].hidden).toBeFalse();
    });

    it('hides field when controller value is not in the allowed list', () => {
      const form = buildForm('toBeSubmitted');
      const fields = buildFields(['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled']);
      const fieldsSignal = signal(fields);
      const destroyRef = TestBed.inject(DestroyRef);

      service.bindVisibility({ form, fieldsSignal, dependencyIndex: service.createDependencyIndex(fields), destroyRef });

      expect(fieldsSignal()[1].hidden).toBeTrue();
    });

    it('hides field when controller value is null (not in list)', () => {
      const form = buildForm(null);
      const fields = buildFields(['reportSubmittedAtrNotYetTabled', 'reportSubmittedAtrTabled']);
      const fieldsSignal = signal(fields);
      const destroyRef = TestBed.inject(DestroyRef);

      service.bindVisibility({ form, fieldsSignal, dependencyIndex: service.createDependencyIndex(fields), destroyRef });

      expect(fieldsSignal()[1].hidden).toBeTrue();
    });
  });

  describe('"isNotEmpty"/"isEmpty" operators in evaluateFieldVisibility', () => {
    // Mirrors the EULB pair: signedElectedbodyFile only visible once electedBodyExcelFile has a file.
    function buildForm(controllerValue: unknown): ReturnType<FormBuilder['group']> {
      return fb.group({ electedBodyExcelFile: [controllerValue], signedElectedbodyFile: [null] });
    }

    function buildFields(operator: 'isNotEmpty' | 'isEmpty'): ConditionalFieldConfig[] {
      return [
        { formFieldType: 'file', label: 'Upload elected bodies list', key: 'electedBodyExcelFile' },
        {
          formFieldType: 'file',
          label: 'Upload signed elected bodies list',
          key: 'signedElectedbodyFile',
          visibleWhen: {
            mode: 'all',
            conditions: [{ key: 'electedBodyExcelFile', operator }],
          },
        },
      ];
    }

    function bindAndGetHidden(controllerValue: unknown, operator: 'isNotEmpty' | 'isEmpty'): boolean | undefined {
      const form = buildForm(controllerValue);
      const fields = buildFields(operator);
      const fieldsSignal = signal(fields);
      const destroyRef = TestBed.inject(DestroyRef);

      service.bindVisibility({ form, fieldsSignal, dependencyIndex: service.createDependencyIndex(fields), destroyRef });

      return fieldsSignal()[1].hidden;
    }

    it('isNotEmpty hides the dependent when the controller file is null', () => {
      expect(bindAndGetHidden(null, 'isNotEmpty')).toBeTrue();
    });

    it('isNotEmpty hides the dependent when the controller is the default empty file shape', () => {
      const emptyFile = { originalName: '', path: '', mimeType: '', sizeKb: null, pageCount: null };
      expect(bindAndGetHidden(emptyFile, 'isNotEmpty')).toBeTrue();
    });

    it('isNotEmpty shows the dependent once the controller file has a path', () => {
      const uploadedFile = { originalName: 'ulbs.xlsx', path: 'state/ulbs.xlsx', mimeType: '', sizeKb: 12, pageCount: null };
      expect(bindAndGetHidden(uploadedFile, 'isNotEmpty')).toBeFalse();
    });

    it('isNotEmpty also recognizes the legacy fileName/fileUrl shape as present', () => {
      const legacyFile = { fileName: 'ulbs.xlsx', fileUrl: 'state/ulbs.xlsx' };
      expect(bindAndGetHidden(legacyFile, 'isNotEmpty')).toBeFalse();
    });

    it('isEmpty is the exact inverse of isNotEmpty', () => {
      expect(bindAndGetHidden(null, 'isEmpty')).toBeFalse();

      const uploadedFile = { originalName: 'ulbs.xlsx', path: 'state/ulbs.xlsx' };
      expect(bindAndGetHidden(uploadedFile, 'isEmpty')).toBeTrue();
    });
  });
});
