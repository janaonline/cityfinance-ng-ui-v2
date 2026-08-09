import { ValidatorFn } from '@angular/forms';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../../dynamic-form-visibility.service';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { EulbPostSubmissionUpdateRow, EulbPostSubmissionUpdateValidateRowPayload } from '../../eulb-status.models';
import { EulbPostUpdateEditFormFacade } from './eulb-post-update-edit-form.facade';

describe('EulbPostUpdateEditFormFacade', () => {
  class DynamicFormStub implements Pick<DynamicFormService, 'bindValidations'> {
    bindValidations(): ValidatorFn | null {
      return null;
    }
  }

  class VisibilityStub implements Pick<DynamicFormVisibilityService, 'evaluateConditions'> {
    evaluateConditions(
      conditionGroup: Parameters<DynamicFormVisibilityService['evaluateConditions']>[0],
      valueLookup: (key: string) => unknown,
    ): boolean {
      if (!conditionGroup?.conditions?.length) return true;

      const results = conditionGroup.conditions.map((condition) => {
        const rawValue = valueLookup(condition.key);
        switch (condition.operator) {
          case 'equals':
            return rawValue === condition.value;
          case 'notEquals':
            return rawValue !== condition.value;
          case 'in':
            return condition.value.includes(rawValue);
          case 'notIn':
            return !condition.value.includes(rawValue);
          case 'yearGreaterThan':
            return false;
        }
      });

      return conditionGroup.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
    }
  }

  function createFacade(markForCheck = (): void => undefined): EulbPostUpdateEditFormFacade {
    return new EulbPostUpdateEditFormFacade({
      dynamicService: new DynamicFormStub(),
      visibilityService: new VisibilityStub(),
      markForCheck,
    });
  }

  function createPayload(
    overrides: Partial<EulbPostSubmissionUpdateValidateRowPayload> = {},
  ): EulbPostSubmissionUpdateValidateRowPayload {
    return {
      rowId: 'row-1',
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2020-01-01',
      dateOfExpiry: '2030-01-01',
      remarks: 'Initial remarks',
      ...overrides,
    };
  }

  function createLoadedRow(overrides: Partial<EulbPostSubmissionUpdateRow> = {}): EulbPostSubmissionUpdateRow {
    return {
      _id: 'row-1',
      rowNumber: 1,
      censusCode: '100001',
      ulbName: 'Test ULB',
      electedBodyStatus: 'Constituted',
      dateOfConstitution: '2020-01-01',
      dateOfExpiry: '2030-01-01',
      remarks: 'Initial remarks',
      validationStatus: 'VALID',
      errors: [],
      ...overrides,
    };
  }

  function createFields(): ConditionalFieldConfig[] {
    const enabledWhenConstituted: ConditionalFieldConfig['enabledWhen'] = {
      mode: 'all',
      conditions: [{ key: 'electedBodyStatus', operator: 'equals', value: 'Constituted' }],
    };

    return [
      {
        key: 'electedBodyStatus',
        label: 'Elected Body Status',
        formFieldType: 'select',
        options: ['Constituted', 'Not Constituted', '6th Schedule'],
      },
      {
        key: 'dateOfConstitution',
        label: 'Date on which the elected body is in place.',
        formFieldType: 'date',
        enabledWhen: enabledWhenConstituted,
        clearValueWhenDisabled: true,
        disabledReason: 'Available only when constituted.',
      },
      {
        key: 'dateOfExpiry',
        label: 'Date of Expiry',
        formFieldType: 'date',
        enabledWhen: enabledWhenConstituted,
        clearValueWhenDisabled: true,
        disabledReason: 'Available only when constituted.',
      },
      { key: 'remarks', label: 'Remarks', formFieldType: 'text' },
    ];
  }

  it('creates controls from backend rowEditFields', () => {
    const facade = createFacade();

    const form = facade.startEdit({
      payload: createPayload(),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    expect(Object.keys(form.controls)).toEqual([
      'electedBodyStatus',
      'dateOfConstitution',
      'dateOfExpiry',
      'remarks',
    ]);
    expect(facade.getFields().map((field) => field.key)).toEqual([
      'electedBodyStatus',
      'dateOfConstitution',
      'dateOfExpiry',
      'remarks',
    ]);
  });

  it('patches row values correctly', () => {
    const facade = createFacade();

    facade.startEdit({
      payload: createPayload({ remarks: 'Patched remarks' }),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    expect(facade.form.controls.electedBodyStatus.value).toBe('Constituted');
    expect(facade.form.controls.dateOfConstitution.value).toBe('2020-01-01');
    expect(facade.form.controls.dateOfExpiry.value).toBe('2030-01-01');
    expect(facade.form.controls.remarks.value).toBe('Patched remarks');
  });

  it('reads payload values correctly', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload(),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    facade.form.controls.electedBodyStatus.setValue('Not Constituted');
    facade.form.controls.dateOfConstitution.setValue('');
    facade.form.controls.dateOfExpiry.setValue('');
    facade.form.controls.remarks.setValue('Updated remarks');

    expect(facade.readPayload(createLoadedRow())).toEqual({
      rowId: 'row-1',
      electedBodyStatus: 'Not Constituted',
      dateOfConstitution: null,
      dateOfExpiry: null,
      remarks: 'Updated remarks',
    });
  });

  it('disables constitution and expiry date fields when status is Not Constituted', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload({ electedBodyStatus: 'Not Constituted' }),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    expect(facade.form.controls.dateOfConstitution.disabled).toBeTrue();
    expect(facade.form.controls.dateOfExpiry.disabled).toBeTrue();
  });

  it('enables constitution and expiry date fields when status is Constituted', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload({ electedBodyStatus: 'Not Constituted' }),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    facade.form.controls.electedBodyStatus.setValue('Constituted');

    expect(facade.form.controls.dateOfConstitution.enabled).toBeTrue();
    expect(facade.form.controls.dateOfExpiry.enabled).toBeTrue();
  });

  it('clears disabled date values when required by field config', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload(),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });

    facade.form.controls.electedBodyStatus.setValue('Not Constituted');

    expect(facade.form.controls.dateOfConstitution.value).toBe('');
    expect(facade.form.controls.dateOfExpiry.value).toBe('');
  });

  it('clears stale field api errors when a field value changes', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload(),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });
    facade.form.controls.remarks.setErrors({ apiErrors: ['Old API error.'] });

    facade.form.controls.remarks.setValue('Edited remarks');

    expect(facade.form.controls.remarks.hasError('apiErrors')).toBeFalse();
  });

  it('preserves remarks behavior', () => {
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload({ remarks: 'Keep these remarks' }),
      fields: createFields(),
      canEdit: true,
      onChange: () => undefined,
    });
    facade.form.controls.electedBodyStatus.setValue('Not Constituted');

    expect(facade.form.controls.remarks.enabled).toBeTrue();
    expect(facade.form.controls.remarks.value).toBe('Keep these remarks');
  });

  it('returns correct editable-field checks', () => {
    const facade = createFacade();
    facade.setFields([{ key: 'remarks', label: 'Remarks', formFieldType: 'text' }]);

    expect(facade.isFieldEditable('remarks')).toBeTrue();
    expect(facade.isFieldEditable('dateOfExpiry')).toBeFalse();
  });

  it('cleans up subscriptions and bindings on reset', () => {
    let changeCount = 0;
    const facade = createFacade();
    facade.startEdit({
      payload: createPayload(),
      fields: createFields(),
      canEdit: true,
      onChange: () => changeCount++,
    });

    facade.resetEditState();
    facade.form.controls.remarks.setValue('Change after reset');

    expect(changeCount).toBe(0);
  });
});
