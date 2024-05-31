import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MaterialModule, InputComponent, SelectComponent,],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  @Input() field!: FieldConfig;
  @Input() group!: FormGroup;

  constructor() { }
  ngOnInit() {
    console.log('----field table --', this.field);
    console.log('----group table --', this.group);
    // console.log('----group table --', this.group.value);
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0));
    // console.log('getTableGroup-----', this.getTableGroup('sourceOfFdTable',0,'sourceOfFd',0, 'fy2022-23_sourceOfFd'));
    // console.log('getProducts--1---', this.getProducts1());


  }

  getTableGroup(fieldKey: string, i = 0, rowKey: string, j = 0) {
    // return this.group.controls.products.controls;
    console.log('rowKey', fieldKey, '--i--', i, '----', rowKey, '----', j);
    console.log('this.group.get(rowKey)',this.group.get(fieldKey));
    // console.log('this.group.get(rowKey)',(((this.group.get(fieldKey) as FormArray)
    // .controls[i] as FormArray).get(rowKey) as FormArray).controls[j]);
    // this.group.controls[fieldKey].controls[i];
    return (((this.group.get(fieldKey) as FormArray)
      .controls[i] as FormArray).get(rowKey) as FormArray).controls[j];
    // return this.group.get('sourceOfFdTable')?.controls[0];
  }
  getProducts1() {
    // return this.group.controls.products.controls;
    // return (((this.group.get('sourceOfFdTable') as FormArray).controls[0]) as FormArray).controls;
  }

}
