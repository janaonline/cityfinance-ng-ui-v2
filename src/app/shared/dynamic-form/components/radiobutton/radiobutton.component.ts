import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
    selector: 'app-radiobutton',
    imports: [MaterialModule],
    template: ` <div class="demo-full-width margin-top" [formGroup]="group">
      @if (field.label) {
        <div>
          <label class="fw-bold radio-label-padding"
            >{{ field.position ? field.position + '. ' : '' }}{{ field.label }}
            <!-- <span class="text-danger">*&nbsp;</span> -->
          </label>
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
    </div>`,
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
