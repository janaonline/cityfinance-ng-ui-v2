import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { FileComponent } from '../../../shared/dynamic-form/components/file/file.component';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { VerifyDocumentsDialogueComponent } from './verify-documents-dialogue/verify-documents-dialogue.component';

@Component({
  selector: 'app-yearwise-files',
  standalone: true,
  imports: [MaterialModule, FileComponent],
  templateUrl: './yearwise-files.component.html',
  styleUrl: './yearwise-files.component.scss'
})
export class YearwiseFilesComponent {

  @Input() field!: FieldConfig;
  // @Input() group!: FormGroup;
  @Input() group!: FormArray;
  collapsed = false;
  panelOpenState = true;

  @ViewChild('viewAndVerifyDialog')
  viewAndVerifyDialog!: TemplateRef<any>;

  dialogRef!: MatDialogRef<any>;

  constructor(public dialog: MatDialog) { }
  ngOnInit() {
    // console.log('----field table --', this.field);
    // console.log('----group table --', this.group);
    console.log('----group table -val-', this.group.value);
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0));
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0, 'fy2022-23_sourceOfFd'));
    // console.log('getProducts--1---', this.getProducts1());


  }

  // getFG(key: string, i: number): any {
  //   console.log('this.group.get(key)',this.group);
  //   // console.log('this.group.get(key)',this.group.get(key));

  //   return (this.group.get(key) as FormArray).controls[i]
  // }

  getFileGroup(fieldKey: any, i: number): FormGroup {
    // console.log('fieldKey----', fieldKey);

    // // return this.group.get(fieldKey) as FormGroup; 
    // console.log('this.group--------', this.group);
    // console.log('this.group.get(fieldKey)', this.group.controls[i]);

    // return (this.group.get(fieldKey) as FormArray).controls[i] as FormGroup;
    return (this.group.controls[i]) as FormGroup;
  }
  getTableGroup(fieldKey: any, i = 0, rowKey: string, j = 0): FormGroup {
    return ((((this.group.get(fieldKey) as FormArray)
      .controls[i] as FormGroup).get(rowKey) as FormArray).controls[j]) as FormGroup;
    // return this.group.get('sourceOfFdTable')?.controls[0];
  }

  openDialog1(): void {
    this.dialogRef = this.dialog.open(this.viewAndVerifyDialog, {
      width: '1200px'
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(VerifyDocumentsDialogueComponent, {
      data: { field: this.field },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.field = result;
    });
  }
}

