import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-accounting-practice',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './accounting-practice.component.html',
  styleUrl: './accounting-practice.component.scss'
})
export class AccountingPracticeComponent {
  @Input() field!: FieldConfig;
  // @Input() group!: FormGroup;
  @Input() group!: FormArray;
  collapsed = false;
  panelOpenState = true;


  constructor() { }
  ngOnInit() {
    console.log('----field acc --', this.field);
    console.log('----group acc --', this.group);
  }

  getGroup(i: number, sectionKey: string, rowKey: string): FormGroup {
    // console.log('sectionKey-----', sectionKey, 'rowKey-----', rowKey);
    // console.log('this.group..get(sectionKey)----', this.group.get(sectionKey));
    // console.log('this.group.controls[i]-----', ((this.group.at(i) as FormGroup).controls[sectionKey as FormGroup).get(rowKey));
    // return new FormGroup({});
    return ((this.group.controls[i] as FormGroup).get(sectionKey) as FormGroup).get(rowKey) as FormGroup;
  }

}
