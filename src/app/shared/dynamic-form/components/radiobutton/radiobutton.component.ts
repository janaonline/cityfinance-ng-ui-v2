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
<div><label  class="fw-bold radio-label-padding">{{field.position ? field.position+'. ':''}}{{field.label}}:</label></div>
<mat-radio-group [formControlName]="field.key">
<mat-radio-button *ngFor="let opt of field.options" [value]="opt">{{opt}}</mat-radio-button>
</mat-radio-group>
</div>
`,
  styles: `
  
.mat-radio-button.mat-accent.mat-radio-checked .mat-radio-outer-circle{
    border-color:rgb(6, 7, 10); 
  }
  
  .mat-radio-button.mat-accent .mat-radio-inner-circle{
    color:rgb(0, 0, 0);
    background-color:rgb(0, 0, 0) ;
  }
  
  .mat-radio-button.mat-accent .mat-radio-ripple .mat-ripple-element {
      background-color:rgb(255, 37, 37,.26)
  }
  `
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
