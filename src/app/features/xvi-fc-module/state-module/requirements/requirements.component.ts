import { Component, inject, signal } from '@angular/core';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-requirements',
  imports: [AngularMultiSelectModule],
  templateUrl: './requirements.component.html',
  styleUrl: './requirements.component.scss',
})
export class RequirementsComponent {
  utilityService = inject(UtilityService);

  conditionsToBeMet = signal([
    {
      label: 'SFC Status',
      desc: 'State Finance Commission constituted and notified - to be confirmed',
    },
    {
      label: 'Elected Body Status',
      desc: 'Confirmation that ULBs have elected councils in place - to be uploaded',
    },
    {
      label: 'Devolution Formula',
      desc: 'Upload the Excel file showing grant amounts and devolution formula for each ULB',
    },
  ]);

  upload(label: string) {
    this.utilityService.triggerSnackbar(`${label} uploaded successfully!`);
  }
}
