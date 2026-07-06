import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: 'app-select',
  imports: [MaterialModule],
  template: ` @if (displayLabel && !displayInlineLabel && !field.hideLabel) {
      <label class="fw-semibold"
        >{{ field.position ? field.position + '. ' : '' }}{{ field.label }}
        <!-- <span class="text-danger" *ngIf="field.required">*&nbsp;</span> -->
      </label>
    }
    <mat-form-field appearance="outline" class="demo-full-width" [formGroup]="group">
      @if (displayInlineLabel && !field.hideLabel) {
        <mat-label>{{ field.label }}</mat-label>
      }
      <mat-select
        [formControlName]="field.key"
        [multiple]="field.multiple"
        [placeholder]="field.placeholder || 'Select an Option'"
        [panelWidth]="parentField ? 400 : 'auto'"
        [attr.data-cy]="field.key ? field.key + '-test' : null"
      >
        <!-- <mat-option value="">Select an Option</mat-option> -->
        @if (parentField?.options) {
          @for (item of parentField?.options; track $index; let last = $last) {
            <mat-option [value]="optionValue(item)">{{ optionLabel(item) }}</mat-option>
            @if (!last) {
              <mat-divider></mat-divider>
            }
          }
        } @else {
          @for (item of field.options; track $index; let last = $last) {
            <mat-option [value]="optionValue(item)">{{ optionLabel(item) }}</mat-option>
            @if (!last) {
              <mat-divider></mat-divider>
            }
          }
        }
      </mat-select>
      @for (validation of this.validations; track validation) {
        <ng-container ngProjectAs="mat-error">
          @if (hasError(field.key, validation.name)) {
            <mat-error>{{ validation.message }}</mat-error>
          }
        </ng-container>
      }
    </mat-form-field>
    <!-- <mat-form-field class="demo-full-width margin-top" [formGroup]="group.value"><mat-label class="com-style">{{ getValue('label') }}
<span *ngIf="getValue('required')" class="text-danger">*</span><mat-icon style="font-size: 18px" *ngIf="getValue('info')" [matTooltip]="getValue('info')">info_outline
</mat-icon></mat-label><mat-select formControlName="value"><mat-option *ngFor="let opt of getValue('options')" [value]="opt">{{opt}}</mat-option></mat-select></mat-form-field> -->`,
  styles: [],
})
export class SelectComponent implements OnInit, OnChanges {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() options!: any[];
  @Input() displayLabel: boolean = true;
  @Input() displayInlineLabel: boolean = false;

  @Input() parentField: any;
  validations: any[] = [];
  readonly: any = false;

  constructor() {}

  ngOnInit(): void {
    this.syncFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] || changes['parentField']) {
      this.syncFromInputs();
    }
  }

  private syncFromInputs(): void {
    this.options = this.options || this.field.options;
    this.validations = this.parentField?.validations || this.field.validations;
    this.readonly = this.parentField?.readonly || this.field?.readonly;
  }

  hasError(key: string, name: string): boolean {
    const control = this.group.get(key);
    return !!control?.hasError(name) && (control.touched || control.dirty);
  }

  /** Accepts plain strings ('YES') as well as `{ id, label }` objects (e.g. live-loaded lookups). */
  optionValue(item: any): any {
    return item && typeof item === 'object' ? (item.id ?? item.value ?? item._id) : item;
  }

  optionLabel(item: any): any {
    return item && typeof item === 'object' ? (item.label ?? item.name ?? item) : item;
  }
}
