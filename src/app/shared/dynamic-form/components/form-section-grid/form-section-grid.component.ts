import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { DynamicFormComponent } from '../../dynamic-form.component';
import { FormSectionConfig } from '../../field.interface';

/**
 * Renders a JSON-driven list of form sections as mat-cards, laying out each section's fields in a
 * bootstrap grid (`field.grid`, e.g. 'col-12' / 'col-md-6'). Field labels, required asterisks, and
 * hint text are all driven by config so a page can be composed purely from a `FormSectionConfig[]`
 * without hand-written per-field HTML.
 */
@Component({
  selector: 'app-form-section-grid',
  imports: [MaterialModule, DynamicFormComponent],
  templateUrl: './form-section-grid.component.html',
  styleUrl: './form-section-grid.component.scss',
})
export class FormSectionGridComponent {
  @Input({ required: true }) sections!: FormSectionConfig[];
  @Input({ required: true }) group!: FormGroup;
}
