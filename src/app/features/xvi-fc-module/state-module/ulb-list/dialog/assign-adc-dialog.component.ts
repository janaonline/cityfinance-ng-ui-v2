import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IUlbMaster } from '../../../../../core/models/ulb-master';
import { AdcService, IAdc } from '../../../shared/adc/adc.service';

export interface AssignAdcDialogData {
  ulb: IUlbMaster;
}

/** `adcId: null` hands the ULB back to the State DMA. */
export interface AssignAdcDialogResponse {
  adcId: string | null;
}

/** Admin "Assign ADC" action: pick the Autonomous District Council that owns a ULB, or "None" to return it to the State. */
@Component({
  selector: 'app-assign-adc-dialog',
  imports: [MatDialogModule, FormsModule],
  templateUrl: './assign-adc-dialog.component.html',
})
export class AssignAdcDialogComponent implements OnInit {
  adcs: IAdc[] = [];
  /** '' stands for "None" — the select can't bind a real null option value. */
  selectedAdcId = '';
  loading = true;
  loadError = false;

  constructor(
    private dialogRef: MatDialogRef<AssignAdcDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignAdcDialogData,
    private adcService: AdcService,
  ) {
    this.selectedAdcId = this.data.ulb.adc?._id ?? '';
  }

  ngOnInit(): void {
    this.adcService.list(this.data.ulb.state).subscribe({
      next: (adcs) => {
        this.adcs = adcs;
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  save(): void {
    this.dialogRef.close({ adcId: this.selectedAdcId || null } as AssignAdcDialogResponse);
  }
}
