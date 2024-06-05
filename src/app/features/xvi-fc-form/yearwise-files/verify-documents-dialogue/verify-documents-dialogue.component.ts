import { Component, Inject } from '@angular/core';
import { MaterialModule } from '../../../../material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FieldConfig } from '../../../../shared/dynamic-form/field.interface';

export interface DialogData {
  year: FieldConfig;
}

@Component({
  selector: 'app-verify-documents-dialogue',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './verify-documents-dialogue.component.html',
  styleUrl: './verify-documents-dialogue.component.scss'
})
export class VerifyDocumentsDialogueComponent {

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

  onNoClick(): void {
    this.dialogRef.close();
  }
}
