import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';
import { APPROVAL_TYPES } from '../../../../core/models/models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-pmu-rejection-popup',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatRadioModule,],
  templateUrl: './pmu-rejection-popup.component.html',
  styleUrls: ['./pmu-rejection-popup.component.scss']
})
export class PmuRejectionPopupComponent implements OnInit {
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DialogComponent>,
    private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.form = this.fb.group({
      rejectReason: [this.data?.rejectReason || '', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]],
      suggestedValue: [this.data?.suggestedValue || '', this.data?.canSuggestValue ? Validators.required : null],
      approvalType: [APPROVAL_TYPES.ulbEnteredPmuReject || ''],
      status: 'REJECTED'
    })
  }


  submit() {
    this.dialogRef.close(this.form.value);
  }

  close() {
    this.dialogRef.close();
  }
}
