import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-elected-body-status',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './elected-body-status.component.html',
  styleUrl: './elected-body-status.component.scss',
})
export class ElectedBodyStatusComponent {
  private fb = inject(FormBuilder);
  private utilityService = inject(UtilityService);

  readonly form = this.fb.group({
    stateName: [{ value: 'Andhra Pradesh', disabled: true }],
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
