import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormSectionGridComponent } from '../../../../../shared/dynamic-form/components/form-section-grid/form-section-grid.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import { FieldConfig, FormSectionConfig } from '../../../../../shared/dynamic-form/field.interface';
import { MaterialModule } from '../../../../../material.module';
import { UlbMasterService } from '../ulb-master.service';
import { UlbDialogData } from '../ulb-list.interface';

@Component({
  selector: 'app-ulb-dialog',
  imports: [MatDialogModule, MaterialModule, FormSectionGridComponent],
  templateUrl: './ulb-dialog.component.html',
  styleUrl: './ulb-dialog.component.scss',
})
export class UlbDialogComponent implements OnInit {
  form!: FormGroup;
  sections: FormSectionConfig[] = [];
  loadFailed = false;

  private fields: FieldConfig[] = [];

  constructor(
    private dialogRef: MatDialogRef<UlbDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UlbDialogData,
    private formService: DynamicFormService,
    private ulbMasterService: UlbMasterService,
  ) {}

  ngOnInit(): void {
    // ADMIN 'Edit' uses the full ADMIN-only field set; STATE 'Resubmit' (fixing a REJECTED
    // submission) is restricted to the same fields collected on the Register ULB page.
    const sections$ =
      this.data.action === 'Resubmit' ? this.ulbMasterService.getRegisterSections() : this.ulbMasterService.getEditSections();

    sections$.subscribe({
      next: (res) => {
        const ulbRecord = (this.data.ulb ?? {}) as Record<string, unknown>;
        // Sections come back as generic field definitions (no values) — hydrate each with the
        // ULB row being edited, and hide the built-in label since the grid renders its own.
        this.sections = (res.data ?? [])
          .map((section) => ({
            ...section,
            fields: section.fields
              // Primary-contact fields provision the ULB's first login at registration time and
              // are never persisted onto the ULB itself — resubmitting a correction has nothing
              // to do with them, so drop the whole section rather than show inert inputs.
              .filter((field) => this.data.action !== 'Resubmit' || !field.key.startsWith('primaryContact'))
              .map((field) => ({
                ...field,
                hideLabel: true,
                value: ulbRecord[field.key] ?? field.value,
              })),
          }))
          .filter((section) => section.fields.length > 0);
        this.fields = this.sections.flatMap((section) => section.fields);
        this.form = this.formService.toFormGroup(this.fields);
      },
      error: () => {
        this.loadFailed = true;
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue() as Record<string, unknown>;
    const payload = this.formService.serializeFormPayload(this.fields, rawValue);

    ['population', 'area', 'wards'].forEach((key) => {
      if (payload[key] !== '' && payload[key] !== null && payload[key] !== undefined) {
        payload[key] = Number(payload[key]);
      }
    });

    this.dialogRef.close({ payload, action: this.data.action, ulbId: this.data.ulbId });
  }
}
