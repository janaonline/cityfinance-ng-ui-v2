import { Component, computed, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TrimOnBlurDirective } from '../../../../core/directives/trim-on-blur.directive';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';

@Component({
  selector: 'app-textarea',
  imports: [MaterialModule, TrimOnBlurDirective],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent implements OnChanges {
  @Input() field: FieldConfig = {} as FieldConfig;
  @Input() group: FormGroup = new FormGroup({});

  readonly = computed(() => this.field.readonly);

  readonly validations = signal<FieldConfig['validations']>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field']) {
      this.validations.set(this.field?.validations ?? []);
    }
  }

  hasError(key: string, name: string): boolean {
    const control = this.group.get(key);
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }
}
