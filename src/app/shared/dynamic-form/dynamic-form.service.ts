import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';

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
          tableCol[col.key] = this.createContorl(col);
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
  setQuestionnaireData(childField: any) {
    const tableRow: any = [];
    childField.data.forEach((row: any) => {
      tableRow[row.key] = new FormGroup({ value: this.createContorl(row), reason: new FormControl(row.reason) });
    })

    return new FormGroup(tableRow);

  }
  setFilesData(childField: any) {
    const years: any = [];

    // childRows.forEach((row: any) => {
    const yearData = childField.year;
    if (yearData) {
      yearData.forEach((col: any) => {
        years[col.key] = this.createFileForm(col);
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

  createFileForm(childField: any) {
    return new FormGroup({
      file: new FormGroup({
        name: new FormControl(childField.file?.name || null),
        url: new FormControl(childField.file?.url || null),
        size: new FormControl(childField.file?.size || null),
      }),
      verifyStatus: new FormControl(childField.verifyStatus || null),
      rejectReason: new FormControl(childField.rejectReason || null),
      rejectOption: new FormControl(childField.rejectOption || null),
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
  createContorl(field: any) {
    return new FormControl(field.value || null, this.bindValidations(field.validations));
    // return new FormControl(field.value || '');
  }
  tabControl(fields: any[]) {
    // const form = this.fb.group({});
    const group: any = {};
    fields.forEach((field: any) => {
      const fieldFormArrays = field.data || field.formArrays;
      if (fieldFormArrays && fieldFormArrays.length) {
        let formArrays: any[] = [];
        fieldFormArrays.forEach((childField: any) => {
          // console.log('childField', childField);
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
          formArrays.push(new FormGroup(childFieldData));

          // group = new FormGroup({ [field.key]: new FormArray(formArrays) })
        });
        group[field.key] = new FormArray(formArrays);

      }
      // group[field.key] = new FormControl(field.value || '');

      //  new FormGroup(group);
    });
    return new FormGroup(group);
  }

  // addSumLogics() {
  //   const s3DataControl = Object.values((this.form.controls.find(control => control.value?.id == 's3') as any).controls?.data?.controls);
  //   const sumAbleContrls = s3DataControl?.filter((value: FormGroup) => value?.controls?.logic?.value == 'sum') as FormGroup[];
  //   sumAbleContrls?.forEach(parentControl => {
  //     const childControls = s3DataControl
  //       .filter((value: FormGroup) => parentControl?.controls?.calculatedFrom?.value?.includes('' + value.controls.position.value)) as FormGroup[];

  //     childControls.forEach((child) => {
  //       child.valueChanges.subscribe(updated => {
  //         const yearWiseAmount = childControls.map((innerChild) => innerChild.value.yearData.map(year => year.value));
  //         const columnWiseSum = this.getColumnWiseSum(yearWiseAmount);
  //         parentControl.patchValue({ yearData: columnWiseSum.map(col => ({ value: col })) });
  //         (parentControl.get('yearData') as any)?.controls.forEach(parentYearItemControl => {
  //           parentYearItemControl.markAllAsTouched();
  //           parentYearItemControl.markAsDirty();
  //         })
  //       })
  //       // child.updateValueAndValidity({ emitEvent: true });
  //     });
  //   });
  // }

  // getColumnWiseSum(arr: number[][]): number[] {
  //   // console.log('aaaarrr', arr);
  //   return arr[0]?.map((_, colIndex) => {
  //     let retNull: boolean = true;
  //     let sum = arr.reduce((acc, curr) => {
  //       if (!isNaN(Number(curr[colIndex])) && (curr[colIndex]?.toString()?.trim() != "")) {
  //         retNull = false;
  //       }
  //       return acc + (curr[colIndex] * 1 || 0);
  //     }, 0);
  //     return retNull ? null : sum;
  //   });
  // }
}
