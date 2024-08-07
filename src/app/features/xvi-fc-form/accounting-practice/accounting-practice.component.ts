import { Component, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { MaterialModule } from '../../../material.module';
import { DecimalLimitDirective } from '../../../core/directives/decimal-limit.directive';
import { NoUpDownDirective } from '../../../core/directives/no-up-down.directive';
import { RestrictEInputDirective } from '../../../core/directives/restrict-e-input.directive';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-accounting-practice',
  standalone: true,
  imports: [MaterialModule, DecimalLimitDirective,
    NoUpDownDirective, RestrictEInputDirective],
  templateUrl: './accounting-practice.component.html',
  styleUrl: './accounting-practice.component.scss'
})
export class AccountingPracticeComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormArray;
  collapsed = false;
  panelOpenState = true;
  subscription!: Subscription;


  constructor() { }
  ngOnInit() {
    this.validateData();
    this.checkOtherOpt();
  }

  // Validate reason: for option which has Please specify.
  validateData(changedData: any = false) {
    const fieldData: any = this.field.data;
    let i = 0;
    for (const section of fieldData) {
      for (const question of section.data) {
        if (!question.options) {
          return;
        }
        let checkValue = question.value;
        if (changedData) {
          checkValue = changedData[section.key][question.key].value;
        }
        const option = question.options?.find((e: any) => e.id === checkValue);
        const reasonField = this.group.controls[i].get(section.key)?.get(question.key)?.get('reason');

        if (option && option.showInputBox) {
          reasonField?.setValidators([Validators.required]);
        } else {
          reasonField?.patchValue(null, { emitEvent: false, onlySelf: true });
          reasonField?.clearValidators();
        }
        reasonField?.updateValueAndValidity({ emitEvent: false, onlySelf: true });

      }
      i++;
    }

  }
  // Validate reason (On value change): for option which has Please specify.
  checkOtherOpt() {
    for (let control of this.group.controls) {
      control.valueChanges
        .pipe(
          debounceTime(400),
          distinctUntilChanged()
        )
        .subscribe(data => {
          this.validateData(data);
        })
    }

  }

  getGroup(i: number, sectionKey: string, rowKey: string): FormGroup {
    return ((this.group.controls[i] as FormGroup).get(sectionKey) as FormGroup).get(rowKey) as FormGroup;
  }

  hasError(i: number, sectionKey: string, rowKey: string, name: string, field = 'value') {
    return (this.getGroup(i, sectionKey, rowKey) as FormGroup).get(field)?.hasError(name)
  }
}
