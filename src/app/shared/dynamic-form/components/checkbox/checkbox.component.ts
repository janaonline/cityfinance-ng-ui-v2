import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
    selector: 'app-checkbox',
    imports: [MaterialModule],
    template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
      <mat-checkbox [formControlName]="field.key">{{ field.label }}</mat-checkbox>
    </div>
    <!-- <div class="demo-full-width margin-top" [formGroup]="group.value">
    	<mat-checkbox formControlName="value">{{ getValue('label') }}</mat-checkbox>
    </div> -->
  `,
    styles: []
})
export class CheckboxComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() {}
  ngOnInit() {}
}
