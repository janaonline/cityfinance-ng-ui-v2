import { Component, Input, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
// import { DynamicFormComponent } from "../dynamic-form/dynamic-form.component";
import { FormGroup } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-child-form',
  imports: [MaterialModule],
  templateUrl: './child-form.component.html',
  styleUrls: ['./child-form.component.css']
})
export class ChildFormComponent implements OnInit {
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
