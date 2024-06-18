import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-radiobutton",
  standalone: true,
  imports: [MaterialModule],
  template: `
    <div class="demo-full-width margin-top" [formGroup]="group">
    	<div *ngIf="field.label">
    		<label class="fw-bold radio-label-padding">{{field.position ? field.position+'. ':''}}{{field.label}}<span class="text-danger">*&nbsp;</span>
        </label>
    	</div>
    	<mat-radio-group [formControlName]="field.key">
    		<mat-radio-button *ngFor="let opt of options" [value]="opt.id || opt " color="primary">{{opt.label || opt}}</mat-radio-button>
        <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
    <mat-error *ngIf="hasError(field.key, validation.name)">{{validation.message}}</mat-error>
  </ng-container>
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

  constructor() { }
  ngOnInit() {
    this.options = this.options || this.field.options;
  }

  hasError(key: string, name: string) {
    return (this.group.get(key) as FormControl).hasError(name)
  }

}
