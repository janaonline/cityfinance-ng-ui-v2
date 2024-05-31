import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-select",
  standalone: true,
  imports: [MaterialModule],
  template: `
    <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
    <mat-label>{{field.label}}</mat-label>
    	<mat-select [formControlName]="field.key">
    		<mat-option *ngFor="let item of options" [value]="item">{{item}}</mat-option>
    	</mat-select>
    </mat-form-field>
    <!-- <mat-form-field class="demo-full-width margin-top" [formGroup]="group.value">
    <mat-label class="com-style">{{ getValue('label') }}
    <span *ngIf="getValue('required')" class="text-danger">*</span>
    <mat-icon style="font-size: 18px" *ngIf="getValue('info')" [matTooltip]="getValue('info')">info_outline
    </mat-icon>
  </mat-label>
    	<mat-select formControlName="value">
    		<mat-option *ngFor="let opt of getValue('options')" [value]="opt">{{opt}}</mat-option>
    	</mat-select>
    </mat-form-field> -->
    `,
  styles: []
})
export class SelectComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() options!: any[];
  @Input() item!: FormGroup;
  constructor() { }
  ngOnInit() {
    // console.log('----group sel --',this.group);
    this.options = this.options || this.field.options;
    // console.log('this.options---',this.options);
    
  }
  // getValue(name: string) {
  //   return this.group.value.get(name).value;
  // }
}
