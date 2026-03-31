import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
    selector: 'app-radiobutton',
    imports: [MaterialModule],
    template: ` <fieldset class="demo-full-width margin-top" [formGroup]="group">
      @if (field.label) {
        <div>
          <legend class="fw-bold m-0 custom-font-size-6"
            >{{ field.position ? field.position + '. ' : '' }}{{ field.label }}
            <!-- <span class="text-danger">*&nbsp;</span> -->
          </legend>
        </div>
      }
      <mat-radio-group [formControlName]="field.key">
        @for (opt of options; track opt) {
          <mat-radio-button [value]="opt.id || opt" color="primary">{{
            opt.label || opt
          }}</mat-radio-button>
        }
        @for (validation of field.validations; track validation) {
          <ng-container ngProjectAs="mat-error">
            @if (hasError(field.key, validation.name)) {
              <mat-error>{{ validation.message }}</mat-error>
            }
          </ng-container>
        }
      </mat-radio-group>
    </fieldset>`,
    styles: ``
})
export class RadiobuttonComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;
  @Input() options!: any[];
  // @Input() label: any = true;

  constructor() {}
  ngOnInit() {
    this.options = this.options || this.field.options;
  }

  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name);
  }
}
