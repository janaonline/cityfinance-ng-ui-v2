import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../field.interface';
import { MaterialModule } from '../../../../material.module';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
// import { filter } from 'lodash';

@Component({
    selector: 'app-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MaterialModule, InputComponent, SelectComponent],
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

  constructor() {}
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
    this.yearFields = firstField.map((value: any) => {
      return value.year;
    });
    // console.log('this.years-----', this.yearFields);
  }
  sumLogic() {
    const sumFields = this.field.data
      ? this.field.data
          .filter((e) => e.sumOf && e.sumOf.length)
          .sort((a, b) => a.sumOrder - b.sumOrder)
      : [];
    // const totalSumFields = this.field.data ? this.field.data.filter(e => e.totalSumOf) : [];
    // console.log('----sumFields --', sumFields);

    this.subscription = this.group.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((data) => {
        // console.log('-----data----', data);
        // const currentTable = data[this.field.key];
        if (!sumFields.length) return;
        sumFields.forEach((sumField) => {
          const currentTable = this.group.get(this.field.key)?.getRawValue();

          let sumYears: any = {};
          this.yearFields.forEach((yearField: string) => {
            let sumYear = 0;
            const sumFieldYearKey = `fy${yearField}_${sumField.key}`;
            // console.log('yearKey', sumFieldYearKey);
            // sumYears[yearField] = 0;
            sumYears[sumFieldYearKey] = 0;

            sumField['sumOf'].forEach((subField: number) => {
              // console.log('currentTable[subField]---', currentTable, '----', subField, '------', currentTable[subField]);
              // const key = `fy2021-22_sourceOfFd`;
              const yearKey = `fy${yearField}_${subField}`;
              // console.log('yearKey', yearKey);

              if (
                currentTable[subField] &&
                currentTable[subField][yearKey] &&
                !isNaN(parseInt(currentTable[subField][yearKey]))
              ) {
                sumYears[sumFieldYearKey] += parseInt(currentTable[subField][yearKey]);
              }
              // if (currentTable[subField] && currentTable[subField][yearField] && !isNaN(parseInt(currentTable[subField][yearField]))) {
              //   sumYears[yearField] += parseInt(currentTable[subField][yearField]);
              // }
            });
          });
          // console.log('sumYears', sumYears);

          this.group
            .get(this.field.key)
            ?.get(sumField['key'])
            ?.patchValue(sumYears, { emitEvent: false, onlySelf: true });
        });
        // this.total = data.reduce((a: any, b: any) => a + +b.fdnTotalShares, 0)
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getTableGroup(fieldKey: any, rowKey: string): FormGroup {
    return (this.group.get(fieldKey) as FormGroup).get(rowKey) as FormGroup;
  }
}
