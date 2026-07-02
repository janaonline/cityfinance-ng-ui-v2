import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { MaterialModule } from '../../../../../material.module';
import { UlbDialogData } from '../ulb-list.interface';

@Component({
  selector: 'app-ulb-dialog',
  imports: [MatDialogModule, MatCardModule, MaterialModule, DynamicFormComponent],
  templateUrl: './ulb-dialog.component.html',
  styleUrl: './ulb-dialog.component.scss',
})
export class UlbDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<UlbDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UlbDialogData,
    public formService: DynamicFormService,
  ) {}

  ngOnInit(): void {
    this.form = this.formService.toFormGroup(this.data.ulbTemplate);
    this.form.addControl(
      'state',
      new FormControl({ value: this.data.ulb?.state ?? '', disabled: !!this.data.lockState }, Validators.required),
    );
    this.form.addControl('ulbType', new FormControl(this.data.ulb?.ulbType ?? '', Validators.required));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue() as Record<string, unknown>;
    const payload = this.formService.serializeFormPayload(this.data.ulbTemplate, rawValue);

    payload['state'] = rawValue['state'];
    payload['ulbType'] = rawValue['ulbType'];
    ['population', 'area', 'wards'].forEach((key) => {
      if (payload[key] !== '' && payload[key] !== null && payload[key] !== undefined) {
        payload[key] = Number(payload[key]);
      }
    });

    this.dialogRef.close({ payload, action: this.data.action, ulbId: this.data.ulbId });
  }
}
