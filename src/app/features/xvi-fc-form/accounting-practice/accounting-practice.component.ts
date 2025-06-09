import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { DecimalLimitDirective } from '../../../core/directives/decimal-limit.directive';
import { NoUpDownDirective } from '../../../core/directives/no-up-down.directive';
import { MaterialModule } from '../../../material.module';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';

@Component({
  selector: 'app-accounting-practice',
  imports: [MaterialModule, DecimalLimitDirective, NoUpDownDirective],
  templateUrl: './accounting-practice.component.html',
  styleUrl: './accounting-practice.component.scss'
})
export class AccountingPracticeComponent implements OnInit {
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
        const reasonField = this.group.controls[i]
          .get(section.key)
          ?.get(question.key)
          ?.get('reason');

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
    for (const control of this.group.controls) {
      control.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe((data) => {
        this.validateData(data);
      });
    }
  }

  getGroup(i: number, sectionKey: string, rowKey: string): FormGroup {
    return ((this.group.controls[i] as FormGroup).get(sectionKey) as FormGroup).get(
      rowKey,
    ) as FormGroup;
  }

  hasError(i: number, sectionKey: string, rowKey: string, name: string, field = 'value') {
    return (this.getGroup(i, sectionKey, rowKey) as FormGroup).get(field)?.hasError(name);
  }
}
