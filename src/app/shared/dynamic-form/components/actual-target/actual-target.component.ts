import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { NoUpDownDirective } from '../../../../core/directives/no-up-down.directive';
import { DecimalLimitDirective } from '../../../../core/directives/decimal-limit.directive';

/**
 * Renders a single question ({@link FieldConfig} with `formFieldType: 'actualTarget'`) as two
 * number inputs — Actual and Target — sharing one label and one set of validators. The bound
 * control at `group.get(field.key)` is a nested `FormGroup` with `actual`/`target` sub-controls
 * (see `DynamicFormService.createContorl`), so this component only needs to bind directly to
 * that sub-group rather than manage any state itself.
 */
@Component({
  selector: 'app-actual-target',
  imports: [MaterialModule, DecimalLimitDirective, NoUpDownDirective],
  templateUrl: './actual-target.component.html',
})
export class ActualTargetComponent implements OnInit, OnChanges {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() readonly: boolean | undefined = false;

  pairGroup!: FormGroup;
  validations: FieldConfig['validations'] = [];
  decimal = 0;

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['group']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    this.pairGroup = this.group?.get(this.field?.key) as FormGroup;
    this.readonly = this.field?.readonly;
    this.validations = this.field?.validations;
    this.decimal = this.field?.decimal ?? 0;
  }

  hasError(sub: 'actual' | 'target', name: string): boolean {
    const control = this.pairGroup?.get(sub);
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }
}
