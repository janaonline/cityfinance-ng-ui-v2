import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
import { compareArrFieldsValidator, compareFieldsValidator } from '../../core/validators/comparison.validator';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  form!: FormGroup;
  constructor(private fb: FormBuilder,) { }

  getFG(tabKey: string, i: number): any {
    return (this.form.get(tabKey) as FormArray).controls[i]
  }
  setTableData(childField: any) {
    const tableRow: any = [];
    const childRows = childField['data'] || childField['tableRow']
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

    })

    return new FormGroup(tableRow);

  }
  setTableData_bkp(childField: any) {
    const tableRow: any = [];
    const childRows = childField['data'] || childField['tableRow']
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
            }));
        });
        tableRow.push(
          new FormGroup({
            [row.key]: new FormArray(tableCol),
            ...(row.sum && { 'sum': new FormControl(row.sum) })
          }));
      }

    })

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
    }
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
    }
  }
  setQuestionnaireData(childField: any) {
    const tableRow: any = [];
    childField.data.forEach((row: any) => {
      tableRow[row.key] = new FormGroup({ value: this.createContorl(row), reason: new FormControl(row.reason) });
    })
    return new FormGroup(tableRow, {
      // validators: this.MustMatch('password', 'confirmPassword')
      // validators: [this.lessThanValidator('totSanction', 'totVacancy')]
      validators: [compareFieldsValidator('totVacancy', 'totSanction', 'lessThan')]
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

    return new FormGroup({
      file: new FormGroup({
        name: new FormControl(yearField.file?.name || null, fileValidator),
        url: new FormControl(yearField.file?.url || null),
        size: new FormControl(yearField.file?.size || null),
      }),
      verifyStatus: new FormControl(yearField.verifyStatus || null, verifyStatusValidator),
      rejectReason: new FormControl(yearField.rejectReason || null, rejectValidator),
      rejectOption: new FormControl(yearField.rejectOption || null, rejectValidator),
    });
  }

  bindValidations(validations: any) {
    if (validations && validations.length > 0) {
      const validators: any = [];
      validations.forEach((row: any) => {
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
          case 'minLength':
            validators.push(Validators.minLength(row.validator));
            break;
          case 'maxLength':
            validators.push(Validators.maxLength(row.validator));
            break;
          case 'email':
            validators.push(Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'));
            break;
        }
      });

      return Validators.compose(validators);
    }
    return null;
  }
  createContorl(field: any, validations = false, readonly = false) {
    const validationsData = validations || field.validations;
    // const val = field.value ? { value: field.value, disabled: readonly || field.readonly } : '';
    const val = { value: field.value, disabled: readonly || field.readonly };
    return new FormControl(val, this.bindValidations(validationsData));
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
          const compareValid = childField.validations?.find((e: { name: string; }) => e.name === 'greaterThanEqualTo');

          if (compareValid) {
            validators.push(compareArrFieldsValidator(childField.key, compareValid.field, compareValid.name));
          }
          // table row
          const childFieldData: any = {};
          if (childField.formFieldType === 'table') {
            childFieldData[childField.key] = this.setTableData(childField);
          }
          else if (childField.formFieldType === 'questionnaire') {

            childFieldData[childField.key] = this.setQuestionnaireData(childField);
          }
          else if (childField.formFieldType === 'file') {
            // console.log('childField----', childField);
            childFieldData[childField.key] = this.setFilesData(childField);
          }
          else {
            // childFieldData[childField.key] = new FormControl(childField.value);
            childFieldData[childField.key] = this.createContorl(childField);
          }
          // console.log('validators', validators);
          formArrays.push(new FormGroup(childFieldData));

        });
        group[field.key] = new FormArray(formArrays,
          // { validators: [compareArrFieldsValidator('popApril2024', 'pop2011', 'greaterThanEqualTo')] },
          { validators }
        );

      }
    });
    return new FormGroup(group);
  }

}
