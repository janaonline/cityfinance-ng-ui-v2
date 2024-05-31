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
  @Input() group!: FormGroup;
  collapsed = false;
  panelOpenState = true;


  constructor() { }
  ngOnInit() {
    // console.log('----field table --', this.field);
    // console.log('----group table --', this.group);    
  }

  getTableGroup(fieldKey: any, i = 0, rowKey: string, j = 0): FormGroup {
    return ((((this.group.get(fieldKey) as FormArray)
      .controls[i] as FormGroup).get(rowKey) as FormArray).controls[j]) as FormGroup;
  }

}
