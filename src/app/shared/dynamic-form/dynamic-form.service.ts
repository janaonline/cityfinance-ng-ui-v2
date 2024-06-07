import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
// import { DataEntryService } from '../../features/xvi-fc/services/data-entry.service';
// import { FiscalRankingService } from '../../features/xvi-fc/services/fiscal-ranking.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  form!: FormGroup;
  constructor(private fb: FormBuilder,
    // public fiscalService: FiscalRankingService,
    // private _router: Router,
    // private dialog: MatDialog,
    // private activatedRoute: ActivatedRoute,
    // private loaderService: GlobalLoaderService,
    // private dateAdapter: DateAdapter<Date>
  ) { }

  getFG(tabKey: string, i: number): any {
    // return (((this.group.get(fieldKey) as FormArray)
    //   .controls[i] as FormGroup).get(rowKey) as FormArray).controls[j];
    // console.log('(this.form.get(tabKey) as FormArray).controls[i]',(this.form.get(tabKey) as FormArray).controls[i]);

    return (this.form.get(tabKey) as FormArray).controls[i]
  }
  setTableData(childField: any) {
    const tableRow: any = [];
    childField.tableRow.forEach((row: any) => {
      if (row.tableData) {
        const tableCol: any = [];
        row.tableData.forEach((col: any) => {
          tableCol.push(
            // set validation here
            new FormGroup({
              // [col.key]: new FormControl(col.value),
              [col.key]: this.createContorl(col),
            }));
        });
        tableRow.push(
          new FormGroup({
            // [row.key]: new FormControl(childField.value),
            [row.key]: new FormArray(tableCol),
          }));
      }

    })

    return new FormArray(tableRow);

  }
  setQuestionnaireData(childField: any) {
    const tableRow: any = [];
    childField.questions.forEach((row: any) => {
      if (row.tableData) {
        const tableCol: any = [];
        row.tableData.forEach((col: any) => {
          tableCol.push(
            // set validation here
            new FormGroup({
              // [col.key]: new FormControl(col.value),
              [col.key]: this.createContorl(col),
            }));
        });
        tableRow.push(
          new FormGroup({
            // [row.key]: new FormControl(childField.value),
            [row.key]: new FormArray(tableCol),
          }));
      }

    })

    return new FormArray(tableRow);

  }
  setFilesData(childField: any) {
    return new FormGroup({
      file: new FormGroup({
        name: new FormControl(childField.file.name || ''),
        url: new FormControl(childField.file.url || ''),
      }),
      verifyStatus: new FormControl(childField.verifyStatus || ''),
      rejectReason: new FormControl(childField.rejectReason || ''),
      rejectOption: new FormControl(childField.rejectOption || ''),
      // name: new FormControl(childField.file.name || ''),
      // url: new FormControl(childField.file.url || ''),
    });
    // const childFieldData: any = [];
    // childField.formArrays.forEach((row: any) => {
    //   childFieldData.push(
    //     new FormGroup({
    //       name: new FormControl(row.file.name || ''),
    //       url: new FormControl(row.file.url || ''),
    //     }));
    // })

    // return new FormArray(childFieldData);

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
    return new FormControl(field.value || '', this.bindValidations(field.validations));
    // return new FormControl(field.value || '');
  }
  tabControl(fields: any[]) {
    // const form = this.fb.group({});
    const group: any = {};
    fields.forEach((field: any) => {
      if (field.formArrays && field.formArrays.length) {
        let formArrays: any[] = [];
        field.formArrays.forEach((childField: any) => {
          // table row
          const childFieldData: any = {};
          if (childField.formFieldType === 'table') {
            childFieldData[childField.key] = this.setTableData(childField);
          }
          else if (childField.formFieldType === 'questionnaire') {
            childFieldData[childField.key] = this.setQuestionnaireData(childField);
          } 
          else if (childField.formFieldType === 'file') {
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
}
