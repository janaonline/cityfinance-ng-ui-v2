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

  @Input() field!: any;
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
    // console.log('----group table -val-', this.group.value);
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0));
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0, 'fy2022-23_sourceOfFd'));
    // console.log('getProducts--1---', this.getProducts1());


  }

  // getFG(key: string, i: number): any {
  //   console.log('this.group.get(key)',this.group);
  //   // console.log('this.group.get(key)',this.group.get(key));

  //   return (this.group.get(key) as FormArray).controls[i]
  // }

  getYearGroup(fieldKey: any, i: number): FormGroup {
    return (this.group.controls[i]) as FormGroup;
  }
  getFileGroup(fieldKey: any, i: number): FormGroup {
    return ((this.group.controls[i]) as FormGroup).get(fieldKey) as FormGroup;
  }
  getTableGroup(fieldKey: any, i = 0, rowKey: string, j = 0): FormGroup {
    return ((((this.group.get(fieldKey) as FormArray)
      .controls[i] as FormGroup).get(rowKey) as FormArray).controls[j]) as FormGroup;
    // return this.group.get('sourceOfFdTable')?.controls[0];
  }

  // openDialog1(): void {
  //   this.dialogRef = this.dialog.open(this.viewAndVerifyDialog, {
  //     width: '1200px'
  //   });
  // }

  openDialog(year: FieldConfig, i: number): void {
    const dialogRef = this.dialog.open(VerifyDocumentsDialogueComponent, {
      data: { 
        year, fileRejectOptions: this.field.fileRejectOptions, 
        group: this.getYearGroup(year.key, i), 
        verifyForm: Object.assign({},this.getYearGroup(year.key, i)), 
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      // this.field = result;
    });
  }
}

