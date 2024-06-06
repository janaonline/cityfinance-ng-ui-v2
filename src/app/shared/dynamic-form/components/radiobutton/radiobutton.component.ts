import { Component, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: "app-radiobutton",
  standalone: true,
  imports: [MaterialModule],
  template: `
<div class="demo-full-width margin-top" [formGroup]="group">
<div><label  class="fw-bold radio-label-padding">{{field.position ? field.position+'. ':''}}{{field.label}} <span class="text-danger">*</span></label></div>
<mat-radio-group [formControlName]="field.key">
<mat-radio-button *ngFor="let opt of options" [value]="opt" color="primary">{{opt}}</mat-radio-button>
</mat-radio-group>
</div>
`,
  styles: ``
})
export class RadiobuttonComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;
  @Input() options!: any[];

  constructor() { }
  ngOnInit() {
    this.options = this.options || this.field.options;
  }

  // getValue(name: string) {
  //   return this.group.value.get(name) ? this.group.value.get(name).value : '';
  // }
}
