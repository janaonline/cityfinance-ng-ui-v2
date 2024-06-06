import { Component, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { FieldConfig } from '../../../shared/dynamic-form/field.interface';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-review-submit',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './review-submit.component.html',
  styleUrl: './review-submit.component.scss'
})
export class ReviewSubmitComponent {
  @Input() fields!: any[];
  @Input() group!: FormGroup;
  collapsed = false;
  panelOpenState = true;

  constructor() { }
  ngOnInit() {

  }

  getTableGroup(fieldKey: any, i = 0, rowKey: string, j = 0): FormGroup {
    return ((((this.group.get(fieldKey) as FormArray)
      .controls[i] as FormGroup).get(rowKey) as FormArray).controls[j]) as FormGroup;
  }

}
