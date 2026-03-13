import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppMenuComponent } from '../app.menu';

@Component({
  selector: 'app-test-component',
  imports: [AppMenuComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss',
})
export class TestComponentComponent {
  private fb = inject(FormBuilder);

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
      return;
    }

    const payload = this.form.getRawValue();
    console.log('Form submitted:', payload);
  }
}
