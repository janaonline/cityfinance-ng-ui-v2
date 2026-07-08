import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MaterialModule } from '../../../../material.module';
import { DynamicFormComponent } from '../../dynamic-form.component';
import { FormSectionConfig } from '../../field.interface';

/**
 * Renders a JSON-driven list of form sections inside a single mat-card, separated by dividers, laying
 * out each section's fields in a bootstrap grid (`field.grid`, e.g. 'col-12' / 'col-md-6'). Field
 * labels, required asterisks, and hint text are all driven by config so a page can be composed purely
 * from a `FormSectionConfig[]` without hand-written per-field HTML.
 */
@Component({
  selector: 'app-form-section-grid',
  imports: [MaterialModule, MatDividerModule, DynamicFormComponent],
  templateUrl: './form-section-grid.component.html',
  styleUrl: './form-section-grid.component.scss',
})
export class FormSectionGridComponent {
  @Input({ required: true }) sections!: FormSectionConfig[];
  @Input({ required: true }) group!: FormGroup;

  private readonly iconColors = [
    '#0f6f49',
    '#087b7f',
    '#2980b9',
    '#8e44ad',
    '#d35400',
    '#c0392b',
    '#16a085',
    '#2c3e50',
  ];

  iconColor(index: number): string {
    return this.iconColors[index % this.iconColors.length];
  }
}
