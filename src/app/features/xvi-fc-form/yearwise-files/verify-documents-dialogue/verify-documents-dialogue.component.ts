import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';
import { FormControl, FormGroup } from '@angular/forms';
import { FileComponent } from '../../../../shared/dynamic-form/components/file/file.component';
import { InputComponent } from '../../../../shared/dynamic-form/components/input/input.component';
import { RadiobuttonComponent } from '../../../../shared/dynamic-form/components/radiobutton/radiobutton.component';
import { SelectComponent } from '../../../../shared/dynamic-form/components/select/select.component';

export interface DialogData {
  year: FieldConfig;
  fileRejectOptions: any[];
  group: FormGroup;
}

@Component({
  selector: 'app-verify-documents-dialogue',
  standalone: true,
  imports: [MaterialModule, FileComponent,
    InputComponent, RadiobuttonComponent,
    SelectComponent,
  ],
  templateUrl: './verify-documents-dialogue.component.html',
  styleUrl: './verify-documents-dialogue.component.scss'
})
export class VerifyDocumentsDialogueComponent {

  verifyOptions = [{ id: 2, label: 'Accept Existing Document' }, { id: 3, label: 'Reject Existing Document' }];

  verifyStatus: FieldConfig = {
    formFieldType: 'radio', label: '', key: 'verifyStatus',
    options: this.verifyOptions,
  };

  rejectOption: FieldConfig = {
    options: this.data.fileRejectOptions,
    formFieldType: 'select', label: 'File(s) that require replacement', key: 'rejectOption',
  };

  rejectReason: FieldConfig = {
    formFieldType: 'text', label: 'Please let us know the reason for replacing existing file(s)', key: 'rejectReason',
  };



  // formfields: any = { rejectReason: FieldConfig { formField }}
  constructor(
    public dialogRef: MatDialogRef<VerifyDocumentsDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit() {
    console.log('----field dialogue --', this.data);
    // console.log('----field dialogue --', this.data.field);
    // console.log('----group table --', this.group);
    // console.log('----group table -val-', this.group.value);
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0));
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0, 'fy2022-23_sourceOfFd'));
    // console.log('getProducts--1---', this.getProducts1());


  }

  getVerifyStatus(fieldKey: string) {
    return (this.getFormGroup(fieldKey).get('verifyStatus') as FormControl).value;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  // getFileGroup(fieldKey: any, i: number): FormGroup {
  //   return (this.data.group.controls[i]) as FormGroup;
  // }
  getFormGroup(fieldKey: any): FormGroup {
    // console.log('this.data.group.controls[i]',this.data.group.controls[i]);
    console.log('this.data.group.get(fieldKey)', this.data.group.get(fieldKey));

    return (this.data.group.get(fieldKey)) as FormGroup;
  }
}
