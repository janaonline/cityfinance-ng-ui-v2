import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../shared/dynamic-form/dynamic-form.service';
import { ARRAY_VALUES, EVENT_STATUS, EventTemplateDialogData } from '../interface';

@Component({
  selector: 'app-dialog',
  imports: [MatDialogModule, DynamicFormComponent, MatCardModule, DatePipe],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventTemplateDialogData,
    public formService: DynamicFormService,
  ) {}

  ngOnInit(): void {
    this.form = this.formService.toFormGroup(this.data.eventTemplate);
  }

  save() {
    // Validate form
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.value };
    // Convert back to array.
    ARRAY_VALUES.forEach((key) => {
      if (payload[key]) {
        payload[key] = payload[key].split(',').map((item: string) => item.trim());
      }
    });
    
    // Convert eventStatus back to number
    payload.eventStatus = payload.eventStatus === EVENT_STATUS[1] ? 1 : 2;
    
    this.dialogRef.close({ payload, action: this.data.action, eventId: this.data.eventId });
  }
}
