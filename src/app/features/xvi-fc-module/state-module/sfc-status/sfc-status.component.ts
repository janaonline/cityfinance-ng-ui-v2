import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-sfc-status',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sfc-status.component.html',
  styleUrl: './sfc-status.component.scss',
})
export class SfcStatusComponent {
  private fb = inject(FormBuilder);
  private utilityService = inject(UtilityService);

  readonly form = this.fb.group({
    stateName: [{ value: 'Andhra Pradesh', disabled: true }],
    sfcActive: [{ value: 'Yes - 8th term' }],
    sfcTerm: [{ value: '22-03-2024 to 21-03-2029' }],
    sfcReportStatus: [{ value: 'To be submitted' }],
    applicableSfcGrantCalculation: [{ value: 'Previous - 7th term' }],
    applicableSfcReportSubmissionDate: [{ value: '19-01-2024' }],

    ulbDevolutionFormula: ['', [Validators.maxLength(2000)]],
    pmuIssueClarification: ['', [Validators.maxLength(2000)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        'Please correct the errors in the form before submitting.',
        'snackbar-danger',
      );
      return;
    }

    const payload = this.form.getRawValue();
    console.log('Form submitted:', payload);
    this.utilityService.triggerSnackbar('Form submitted successfully!');
  }

  onCancel(): void {
    this.form.reset();
    this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
  }
}
