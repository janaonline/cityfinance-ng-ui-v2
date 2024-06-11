import { Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
// import { filter } from 'lodash';

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
  collapsed = false;
  panelOpenState = true;
  total: number = 0;
  subscription!: Subscription;
  sumFields: any[] = [];
  yearFields: string[] = [];

  constructor() { }
  ngOnInit() {
    // console.log('----field table --', this.field);
    // console.log('----group table --', this.group);
    // console.log('----field table --', this.field.data);
    // console.log('----group table getRawValue --', this.group.getRawValue());
    this.getYears();
    this.sumLogic();

  }

  getYears() {
    const firstField = this.field.data ? this.field.data[0].year : [];
    this.yearFields = firstField.map((value: any) => { return value.key; });
    // console.log('this.years-----', this.yearFields);
  }
  sumLogic() {
    const sumFields = this.field.data ? this.field.data.filter(e => e.sumOf) : [];
    // const totalSumFields = this.field.data ? this.field.data.filter(e => e.totalSumOf) : [];
    // console.log('----sumFields --', sumFields);

    this.subscription = this.group.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(data => {
        // console.log('-----data----', data);
        const currentTable = data[this.field.key];
        if(!sumFields.length) return;
        sumFields.forEach((sumField) => {
          // console.log('sumField', sumField['sum']);
          // console.log('key', sumField['key']);
          // console.log('sumField year', sumField['year']);
          // let sumYears:any = { '2022-23': 0, '2021-22': 0, '2020-21': 0, '2019-20': 0, '2018-19': 0 };
          let sumYears: any = {};
          this.yearFields.forEach((yearField: string) => {
            let sumYear = 0;
            sumYears[yearField] = 0;

            sumField['sumOf'].forEach((subField: number) => {
              if (currentTable[subField] && currentTable[subField][yearField] && !isNaN(parseInt(currentTable[subField][yearField]))) {
                sumYears[yearField] += parseInt(currentTable[subField][yearField]);
              }
            });
            
            // console.log('sumYear total----', sumYears);

            // this.group.get(this.field.key)?.get(sumField['key'])?.get(yearField)?.patchValue(sumField, { emitEvent: false, onlySelf: true });
            // console.log('---', this.group.get(this.field.key)?.get(sumField['key'])?.get(yearField)?.getRawValue());

          });
          this.group.get(this.field.key)?.get(sumField['key'])?.patchValue(sumYears, { emitEvent: false, onlySelf: true });
        })
        // this.total = data.reduce((a: any, b: any) => a + +b.fdnTotalShares, 0)
      })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getTableGroup(fieldKey: any, rowKey: string): FormGroup {
    return (this.group.get(fieldKey) as FormGroup).get(rowKey) as FormGroup;
  }


}
