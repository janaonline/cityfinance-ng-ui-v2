import { Component, ViewChild, OnInit, Input } from "@angular/core";
import { AbstractControl, FormArray, Validators } from "@angular/forms";
import { FieldConfig } from "../../field.interface";
// import { DynamicFormComponent } from "../dynamic-form/dynamic-form.component";
import { FormGroup } from "@angular/forms";
import { MaterialModule } from '../../../../material.module';
import { ButtonComponent } from "../button/button.component";
import { DateComponent } from "../date/date.component";
import { InputComponent } from "../input/input.component";
import { SelectComponent } from "../select/select.component";

@Component({
  selector: 'app-child-form',
  standalone: true,
  imports: [MaterialModule, InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,],
  templateUrl: './child-form.component.html',
  styleUrls: ['./child-form.component.css']
})
export class ChildFormComponent {
  @Input() field!: any;
  @Input() group!: FormGroup;

  constructor() { }
  ngOnInit() {
    // this.regConfig = this.field.fields;
    console.log(this.group);
    // this.group.valueChanges.subscribe(x => {
    //   console.log("child form",x);
    // });
  }

  getSubItems(name: string) {

    // return (this.group.get(name) as FormArray)['controls'];
    return (this.group.get(name) as FormArray)['controls'];
    // return this.group.get(field?.name)[];
  }

  // submit(event){
  //   console.log(this.group,event);
  //   this.group["controls"]["childForm"].patchValue([event]);
  // }

  // assignForm(event){
  //   this.group = event;
  //   console.log(event);
  // }

}