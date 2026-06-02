import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UtilityService } from '../../../../core/services/utility.service';

@Component({
  selector: 'app-devolution-formula',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './devolution-formula.component.html',
  styleUrl: './devolution-formula.component.scss',
})
export class DevolutionFormulaComponent {
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
