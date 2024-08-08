import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { FileComponent } from '../../../shared/dynamic-form/components/file/file.component';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { VerifyDocumentsDialogueComponent } from './verify-documents-dialogue/verify-documents-dialogue.component';
// import { deepClone } from '@angular-devkit/core';
// import * as _ from 'lodash';
import { cloneDeep } from 'lodash-es';
import { ToStorageUrlPipe } from '../../../core/pipes/to-storage-url.pipe';

export enum FileVerifyStatus {
  pending = 1,
  accept = 2,
  reject = 3,
}

@Component({
  selector: 'app-yearwise-files',
  standalone: true,
  imports: [MaterialModule, FileComponent, ToStorageUrlPipe],
  templateUrl: './yearwise-files.component.html',
  styleUrl: './yearwise-files.component.scss',
})
export class YearwiseFilesComponent {
  @Input() field!: any;
  @Input() group!: FormArray;
  collapsed = false;
  panelOpenState = true;

  @ViewChild('viewAndVerifyDialog')
  viewAndVerifyDialog!: TemplateRef<any>;

  dialogRef!: MatDialogRef<any>;

  constructor(public dialog: MatDialog) {}
  ngOnInit() {
    // console.log('----field table --', this.field);
    // console.log('----group table -val-', this.group.value);
  }

  getYearGroup(sectionIndex: number, i: number, fieldKey: any): FormGroup {
    return (
      (this.group.controls[sectionIndex] as FormGroup).get(
        this.field.data[sectionIndex].key,
      ) as FormGroup
    ).get(fieldKey) as FormGroup;
  }

  openDialog(sectionIndex: number, year: FieldConfig, i: number): void {
    const fg = new FormGroup({});
    // let verifyForm = _.cloneDeep(this.getYearGroup(i, year.key));
    let verifyForm = cloneDeep(this.getYearGroup(sectionIndex, i, year.key));
    // let verifyForm = structuredClone(this.getYearGroup(i, year.key));

    const dialogRef = this.dialog.open(VerifyDocumentsDialogueComponent, {
      // width: '1200px',
      data: {
        field: year,
        // fileRejectOptions: this.field.fileRejectOptions,
        group: this.getYearGroup(sectionIndex, i, year.key),
        verifyForm,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed', result);
      // this.field = result;
    });
  }

  deleteFile(sectionIndex: number, key: string) {
    this.getYearGroup(sectionIndex, 0, key).reset();
  }
}
