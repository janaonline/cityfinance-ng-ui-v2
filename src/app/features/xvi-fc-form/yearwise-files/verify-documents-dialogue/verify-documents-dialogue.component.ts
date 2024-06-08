import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';
import { FormGroup } from '@angular/forms';
import { FileComponent } from '../../../../shared/dynamic-form/components/file/file.component';
import { InputComponent } from '../../../../shared/dynamic-form/components/input/input.component';
import { RadiobuttonComponent } from '../../../../shared/dynamic-form/components/radiobutton/radiobutton.component';
import { SelectComponent } from '../../../../shared/dynamic-form/components/select/select.component';

export interface DialogData {
  field: FieldConfig;
  fileRejectOptions: any[];
  group: FormGroup;
  verifyForm: FormGroup;
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
    multiple: true,
    options: this.data.field.fileRejectOptions,
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
    // console.log('----this.data.field --', this.data.field);
  }

  get rawValue() {
    return this.getVerifyFormGroup().getRawValue();
  }

  getVerifyStatus() {
    return this.rawValue.verifyStatus;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getVerifyFormGroup(): FormGroup {
    return (this.data.verifyForm) as FormGroup;
  }
  getFormGroup(): FormGroup {
    return (this.data.group) as FormGroup;
  }

  disableStatus(): boolean {
    if (![2, 3].includes(this.rawValue.verifyStatus)) return true;
    if (this.rawValue.verifyStatus === 3 &&
      (!this.rawValue.rejectOption || !this.rawValue.rejectReason || !this.rawValue.file.name)) {
      return true;
    }
    return false;
  }
  onSubmit() {
    this.data.field.verifyStatus = this.getVerifyStatus();
    this.data.group.patchValue(this.data.verifyForm.getRawValue());
    this.dialogRef.close();
  }
}
