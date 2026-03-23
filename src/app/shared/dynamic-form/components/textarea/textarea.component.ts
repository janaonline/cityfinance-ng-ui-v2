import { Component, computed, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TrimOnBlurDirective } from '../../../../core/directives/trim-on-blur.directive';
import { MaterialModule } from '../../../../material.module';
import { FieldConfig } from '../../field.interface';

@Component({
  selector: 'app-textarea',
  imports: [MaterialModule, TrimOnBlurDirective],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent {
  @Input() field: FieldConfig = {} as FieldConfig;
  @Input() group: FormGroup = new FormGroup({});

  readonly = computed(() => this.field.readonly);

  validations = computed(() => this.field.validations);

  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name);
  }
}
