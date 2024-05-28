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
    	<mat-select [placeholder]="field.label" [formControlName]="field.name">
    		<mat-option *ngFor="let item of field.options" [value]="item">{{item}}</mat-option>
    	</mat-select>
    </mat-form-field>`,
  styles: []
})
export class SelectComponent {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  constructor() { }
  ngOnInit() { }
}
