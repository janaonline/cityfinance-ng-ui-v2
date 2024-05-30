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
<label class="radio-label-padding">{{field.label}}:</label>
<mat-radio-group [formControlName]="field.key">
<mat-radio-button *ngFor="let opt of field.options" [value]="opt">{{opt}}</mat-radio-button>
</mat-radio-group>
</div>
`,
  styles: []
})
export class RadiobuttonComponent implements OnInit {
  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;
  @Input() item!: FormGroup;
  constructor() { }
  ngOnInit() { }

  // getValue(name: string) {
  //   return this.group.value.get(name) ? this.group.value.get(name).value : '';
  // }
}
