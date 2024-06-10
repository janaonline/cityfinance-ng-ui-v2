import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { FileComponent } from '../../../shared/dynamic-form/components/file/file.component';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { VerifyDocumentsDialogueComponent } from './verify-documents-dialogue/verify-documents-dialogue.component';
// import { deepClone } from '@angular-devkit/core';
import * as _ from 'lodash';


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
    // console.log('----group table --', this.group.controls[0].get(this.field.data[0].key).get());
    // console.log('----group table -val-', this.group.value);


  }

  // getFG(key: string, i: number): any {
  //   console.log('this.group.get(key)',this.group);
  //   // console.log('this.group.get(key)',this.group.get(key));

  //   return (this.group.get(key) as FormArray).controls[i]
  // }

  getYearGroup(i: number, fieldKey: any): FormGroup {
    // console.log('this.group.controls[0]',this.group.controls[0]);
    // console.log('fieldKey-------',fieldKey);
    // console.log('this.group.controls[0]-------',((this.group.controls[0]) as FormGroup).get(fieldKey));

    return (((this.group.controls[0]) as FormGroup).get(this.field.data[0].key) as FormGroup).get(fieldKey) as FormGroup;
  }


  openDialog(year: FieldConfig, i: number): void {
    const fg = new FormGroup({});
    let verifyForm = _.cloneDeep(this.getYearGroup(i, year.key));

    const dialogRef = this.dialog.open(VerifyDocumentsDialogueComponent, {
      // width: '1200px',
      data: {
        field: year,
        // fileRejectOptions: this.field.fileRejectOptions,
        group: this.getYearGroup(i, year.key),
        verifyForm
      },
    });


    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      // this.field = result;
    });
  }

  deleteFile(key: string) {
    this.getYearGroup(0, key).reset();
    // this.getYearGroup(0, key).get('file')?.patchValue({ name: '', url: '' });
    // this.getYearGroup(0, key).get('verifyStatus')?.patchValue(1);
    // this.getYearGroup(0, key).get('rejectOption')?.patchValue('');
    // this.getYearGroup(0, key).get('rejectReason')?.patchValue('');
  }
}

