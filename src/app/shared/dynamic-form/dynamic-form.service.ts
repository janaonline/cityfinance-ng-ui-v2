import { Injectable } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import {
  compareArrFieldsValidator,
  compareFieldsValidator,
} from '../../core/validators/comparison.validator';
import { FieldConfig, UploadedFileValue } from './field.interface';
import { maxDateValidator, minDateValidator } from '../../core/validators/date-range.validator';
import { toUtcIsoDateString } from './components/date/utc-iso-date-adapter';

@Injectable({
  providedIn: 'root',
})
export class DynamicFormService {
  form!: FormGroup;
  constructor(private fb: FormBuilder) {}

  getFG(tabKey: string, i: number): any {
    return (this.form.get(tabKey) as FormArray).controls[i];
  }
  setTableData(childField: any) {
    const tableRow: any = [];
    const childRows = childField['data'] || childField['tableRow'];
    childRows.forEach((row: any) => {
      const tableData = row.year || row.tableData;
      if (tableData) {
        const tableCol: any = [];
        tableData.forEach((col: any) => {
          tableCol[col.key] = this.createContorl(col, row.validations, row.readonly);
        });
        // console.log('row----',row.key);

        tableRow[row.key] = new FormGroup(tableCol);
        // tableRow.push(
        //   new FormGroup({
        //     [row.key]: new FormGroup(tableCol),
        //   }));
      }
    });

    return new FormGroup(tableRow);
  }
  setTableData_bkp(childField: any) {
    const tableRow: any = [];
    const childRows = childField['data'] || childField['tableRow'];
    childRows.forEach((row: any) => {
      const tableData = row.year || row.tableData;
      if (tableData) {
        const tableCol: any = [];
        tableData.forEach((col: any) => {
          tableCol.push(
            // set validation here
            new FormGroup({
              // [col.key]: new FormControl(col.value),
              [col.key]: this.createContorl(col),
              // 'sum': new FormControl(col.sum),
            }),
          );
        });
        tableRow.push(
          new FormGroup({
            [row.key]: new FormArray(tableCol),
            ...(row.sum && { sum: new FormControl(row.sum) }),
          }),
        );
      }
    });

    return new FormArray(tableRow);
  }
  // custom validator to check that two fields match
  MustMatch(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
      const control = group.get(controlName)?.get('value');

      const matchingControl = group.get(matchingControlName)?.get('value');

      if (!control || !matchingControl) {
        return null;
      }
      console.log('control va', control.value, 'matchingControl va', matchingControl.value);

      // return if another validator has already found an error on the matchingControl
      if (matchingControl.errors && !matchingControl.errors['lessThan']) {
        return null;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ lessThan: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }
  // custom validator to check that if the cuurent field less than compare fields
  lessThanValidator(controlName: string, matchingControlName: string) {
    return (group: AbstractControl) => {
      const control = group.get(controlName)?.get('value');

      const matchingControl = group.get(matchingControlName)?.get('value');

      if (!control || !matchingControl) {
        return null;
      }

      // return if another validator has already found an error on the matchingControl
      if (matchingControl.errors && !matchingControl.errors['lessThan']) {
        return null;
      }

      // set error on matchingControl if validation fails
      if (control.value < matchingControl.value) {
        matchingControl.setErrors({ lessThan: true });
      } else {
        matchingControl.setErrors(null);
      }
      return null;
    };
  }
  setQuestionnaireData(childField: any) {
    const tableRow: any = [];
    childField.data.forEach((row: any) => {
      tableRow[row.key] = new FormGroup({
        value: this.createContorl(row),
        reason: new FormControl(row.reason),
      });
    });
    return new FormGroup(tableRow, {
      // validators: this.MustMatch('password', 'confirmPassword')
      // validators: [this.lessThanValidator('totSanction', 'totVacancy')]
      validators: [compareFieldsValidator('totVacancy', 'totSanction', 'lessThan')],
    });
  }
  setFilesData(childField: any) {
    const years: any = [];

    // childRows.forEach((row: any) => {
    const yearData = childField.year;
    if (yearData) {
      yearData.forEach((col: any) => {
        years[col.key] = this.createFileForm(col, childField.required);
        // years.push(
        //   new FormGroup({
        //     // [row.key]: new FormControl(childField.value),
        //     [col.key]: this.createFileForm(col),
        //   })

        // );
      });
    }
    // return new FormGroup(years);
    return new FormGroup(years);
  }

  createFileForm(yearField: any, required: boolean) {
    const fileValidator = [];
    const rejectValidator: any = [];
    const verifyStatusValidator: any = [];
    // console.log('required', yearField, required);
    // if pdf available check verify validator
    if (yearField.isPdfAvailable) {
      verifyStatusValidator.push(Validators.required);
      if (yearField.verifyStatus === 3) {
        rejectValidator.push(Validators.required);
        fileValidator.push(Validators.required);
      }
    } else if (required) {
      fileValidator.push(Validators.required);
    }
    // except accept/reject others null
    const verifyStatus = [2, 3].includes(Number(yearField.verifyStatus))
      ? yearField.verifyStatus
      : null;
    return new FormGroup({
      file: new FormGroup({
        name: new FormControl(yearField.file?.name || null, fileValidator),
        url: new FormControl(yearField.file?.url || null),
        size: new FormControl(yearField.file?.size || null),
      }),
      verifyStatus: new FormControl(verifyStatus, verifyStatusValidator),
      rejectReason: new FormControl(yearField.rejectReason || null, rejectValidator),
      rejectOption: new FormControl(yearField.rejectOption || null, rejectValidator),
    });
  }

  bindValidations(
    validations: FieldConfig['validations'] | false | undefined,
    field?: Pick<FieldConfig, 'formFieldType' | 'minDate' | 'maxDate'>,
  ) {
    const validators: ValidatorFn[] = [];
    const validationList = validations || [];
    let hasMinDateValidation = false;
    let hasMaxDateValidation = false;

    if (validationList.length > 0) {
      validationList.forEach((row: any) => {
        switch (row.name) {
          case 'required':
            validators.push(Validators.required);
            break;
          case 'nullValidator':
            validators.push(Validators.nullValidator);
            break;
          case 'pattern':
            validators.push(Validators.pattern(row.validator));
            break;
          case 'min':
            validators.push(Validators.min(row.validator));
            break;
          case 'max':
            validators.push(Validators.max(row.validator));
            break;
          case 'minDate':
            hasMinDateValidation = true;
            validators.push(minDateValidator(row.validator ?? field?.minDate));
            break;
          case 'maxDate':
            hasMaxDateValidation = true;
            validators.push(maxDateValidator(row.validator ?? field?.maxDate));
            break;
          case 'minlength':
            validators.push(Validators.minLength(row.validator));
            break;
          case 'maxlength':
            validators.push(Validators.maxLength(row.validator));
            break;
          case 'email':
            validators.push(Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'));
            break;
        }
      });
    }

    if (field?.formFieldType === 'date') {
      if (!hasMinDateValidation && field.minDate !== undefined) {
        validators.push(minDateValidator(field.minDate));
      }

      if (!hasMaxDateValidation && field.maxDate !== undefined) {
        validators.push(maxDateValidator(field.maxDate));
      }
    }

    return validators.length > 0 ? Validators.compose(validators) : null;
  }
  createContorl(field: any, validations = false, readonly = false) {
    const validationsData = validations || field.validations;
    // const val = field.value ? { value: field.value, disabled: readonly || field.readonly } : '';
    const resolvedReadonly = readonly || field.readonly;
    const val = {
      value: this.resolveInitialControlValue(field, false),
      disabled: field.formFieldType === 'date' ? false : resolvedReadonly,
    };
    return new FormControl(val, this.bindValidations(validationsData, field));
    // return new FormControl(field.value || '');
  }
  tabControl(fields: any[]) {
    // const form = this.fb.group({});
    const group: any = {};
    fields.forEach((field: any) => {
      const fieldFormArrays = field.data || field.formArrays;
      if (fieldFormArrays && fieldFormArrays.length) {
        let formArrays: any[] = [];
        const validators: any = [];
        fieldFormArrays.forEach((childField: any) => {
          const compareValid = childField.validations?.find(
            (e: { name: string }) => e.name === 'greaterThanEqualTo',
          );

          if (compareValid) {
            validators.push(
              compareArrFieldsValidator(childField.key, compareValid.field, compareValid.name),
            );
          }
          // table row
          const childFieldData: any = {};
          if (childField.formFieldType === 'table') {
            childFieldData[childField.key] = this.setTableData(childField);
          } else if (childField.formFieldType === 'questionnaire') {
            childFieldData[childField.key] = this.setQuestionnaireData(childField);
          } else if (childField.formFieldType === 'file') {
            // console.log('childField----', childField);
            childFieldData[childField.key] = this.setFilesData(childField);
          } else {
            // childFieldData[childField.key] = new FormControl(childField.value);
            childFieldData[childField.key] = this.createContorl(childField);
          }
          // console.log('validators', validators);
          formArrays.push(new FormGroup(childFieldData));
        });
        group[field.key] = new FormArray(
          formArrays,
          // { validators: [compareArrFieldsValidator('popApril2024', 'pop2011', 'greaterThanEqualTo')] },
          { validators },
        );
      }
    });
    return new FormGroup(group);
  }

  toFormGroup(questions: FieldConfig[]): FormGroup {
    const group: any = {};
    questions.forEach((question: FieldConfig) => {
      group[question.key] = new FormControl(
        this.resolveInitialControlValue(question, true),
        this.bindValidations(question.validations, question),
      );
    });
    return new FormGroup(group);
  }

  /**
   * Convert dynamic-form values into the payload shape expected by persistence layers.
   * Date fields stay compatible with the Material datepicker in form state and are
   * serialized to UTC ISO strings only when building the outbound payload.
   */
  serializeFormPayload(
    fields: ReadonlyArray<Pick<FieldConfig, 'key' | 'formFieldType'>>,
    values: Record<string, unknown>,
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = Object.create(null);

    for (const field of fields) {
      const key = field.key;
      if (
        typeof key !== 'string' ||
        key.length === 0 ||
        !Object.prototype.hasOwnProperty.call(values, key)
      ) {
        continue;
      }

      payload[key] = this.serializeFieldValue(field, values[key]);
    }

    return payload;
  }

  serializeFieldValue(field: Pick<FieldConfig, 'formFieldType'>, value: unknown): unknown {
    if (field.formFieldType !== 'date') {
      return value;
    }

    const serializedDate = toUtcIsoDateString(value);
    return serializedDate === undefined ? value : serializedDate;
  }

  /**
   * Resolve the initial value assigned to a dynamic form control at creation time.
   *
   * File fields require a dedicated normalization path so standalone uploads start with `null`
   * when they are effectively empty. This keeps Angular validators such as `required` aligned
   * with the actual UI state and preserves patched edit values when a valid uploaded file object
   * is already present. Non-file controls retain the existing fallback behavior used across the
   * dynamic-form system.
   *
   * @param field - Minimal field configuration used to determine the control type and seed value
   * @param useEmptyStringFallback - Whether falsy non-file values should default to an empty string
   * @returns The normalized initial control value for the field
   */
  private resolveInitialControlValue(
    field: Pick<FieldConfig, 'formFieldType' | 'value'>,
    useEmptyStringFallback: boolean,
  ): unknown {
    if (field.formFieldType === 'file') {
      return this.normalizeStandaloneFileValue(field.value);
    }

    return useEmptyStringFallback ? field.value || '' : field.value;
  }

  private normalizeStandaloneFileValue(value: unknown): UploadedFileValue {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const rawValue = value as Record<string, unknown>;
    const fileName =
      this.getNonEmptyString(rawValue['fileName']) ?? this.getNonEmptyString(rawValue['name']);
    const fileUrl =
      this.getNonEmptyString(rawValue['fileUrl']) ?? this.getNonEmptyString(rawValue['url']);

    if (!fileName && !fileUrl) {
      return null;
    }

    const fileSize = this.normalizeFileSize(rawValue['fileSize'] ?? rawValue['size']);
    const mimeType = this.getNonEmptyString(rawValue['mimeType']);

    return {
      fileName: fileName ?? this.getFileNameFromUrl(fileUrl),
      fileUrl: fileUrl ?? '',
      fileSize,
      ...(mimeType ? { mimeType } : {}),
    };
  }

  private getNonEmptyString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private normalizeFileSize(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const normalizedValue = value.trim();
    if (!normalizedValue) {
      return null;
    }

    const numericValue = Number(normalizedValue);
    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
  }

  private getFileNameFromUrl(fileUrl: string | null): string {
    if (!fileUrl) {
      return '';
    }

    const pathSegment = fileUrl.split(/[?#]/)[0];
    const segments = pathSegment.split('/');
    return segments[segments.length - 1] ?? '';
  }
}
