import { Component, Input } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldConfig } from '../../field.interface';

@Component({
  selector: 'app-input-card',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-card.component.html',
  styleUrl: './input-card.component.scss',
})
export class InputCardComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;

  get control(): AbstractControl | null {
    return this.group?.get(this.field?.key) ?? null;
  }

  /**
   * Resolved card header text.
   * Priority: inputCardConfig.title → field.label (unless suppressed by hideLabel in inline mode).
   */
  get cardTitle(): string | null {
    const explicitTitle = this.field?.inputCardConfig?.title;
    if (explicitTitle) return explicitTitle;
    if (this.field?.hideLabel) return null;
    return this.field?.label ?? null;
  }

  get showError(): boolean {
    const c = this.control;
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  get errorMessage(): string {
    const c = this.control;
    if (!c) return '';
    for (const v of this.field?.validations ?? []) {
      if (c.hasError(v.name)) return v.message;
    }
    return '';
  }
}
