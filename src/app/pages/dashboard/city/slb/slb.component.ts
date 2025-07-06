import { CommonModule } from '@angular/common';
import { Component, input, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { Subject, Subscription } from 'rxjs';
import { ButtonObj } from '../../../../core/models/interfaces';
import { MaterialModule } from '../../../../material.module';
import {
  ChartConfig,
  ChartsComponent,
} from '../../../../shared/components/charts/charts.component';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';
import { TabButtonsComponent } from '../../../../shared/components/shared-ui/tab-buttons.component';
import { res } from './res-structure';

@Component({
  selector: 'app-slb',
  standalone: true,
  imports: [
    CommonModule,
    TabButtonsComponent,
    ReactiveFormsModule,
    NoDataFoundComponent,
    ChartsComponent,
    MaterialModule,
  ],
  templateUrl: './slb.component.html',
  styleUrl: './slb.component.scss',
})
export class SlbComponent implements OnInit, OnDestroy {
  // Input from parent.
  readonly ulbId = input.required<string>();
  readonly years = input.required<string[]>();

  readonly buttons: ButtonObj[] = [
    { key: 'waterSupply', label: 'Water Supply' },
    { key: 'wasteWaterManagement', label: 'Waste Water Management' },
    { key: 'solidWasteManagement', label: 'Solid Waste Management' },
    { key: 'stormWaterDrainage', label: 'Storm Water Drainage' },
  ];
  currentSelectedButtonKey = signal<string>('');
  myForm!: FormGroup;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  chartData!: ChartConfig[];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.getSlbData();
    // console.log('slb yeas in child: ', this.years());
  }

  private initializeForm(): void {
    this.myForm = this.fb.group({ year: [this.years()[0]] });

    this.subscriptions.push(
      this.myForm.get('year')!.valueChanges.subscribe(() => this.getSlbData()),
    );
  }

  // Output emitted by child to parent
  onSelectedButtonChange(key: string): void {
    // console.log('Button key sent from child to parent:', key);
    this.currentSelectedButtonKey.set(key);
  }

  get year() {
    return this.myForm.get('year')?.value;
  }

  private getSlbData(): void {
    this.chartData = res.data.map((indicatorObj, idx) => {
      const value = Math.round(indicatorObj.value);
      const benchMarkValue = Math.round(indicatorObj.benchMarkValue);
      const nationalValue = Math.round(indicatorObj.nationalValue);
      const maxValue = Math.max(value, benchMarkValue, nationalValue);

      const datasets = [
        {
          label: 'Benchmark Value',
          data: [benchMarkValue, maxValue - benchMarkValue],
          backgroundColor: ['#1b4965', '#f8f9fa'],
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: 'National Average',
          data: [nationalValue, maxValue - nationalValue],
          backgroundColor: ['#62b6cb', '#f8f9fa'],
          borderWidth: 1,
          borderRadius: 5,
        },
        {
          label: indicatorObj.ulbName,
          data: [value, maxValue - value],
          backgroundColor: ['#bee9e8', '#f8f9fa'],
          borderWidth: 1,
          borderRadius: 5,
        },
      ];

      let unit = '%';
      if (indicatorObj.unitType === 'litres per capita per day (lpcd)') unit = 'LCPD';
      else if (indicatorObj.unitType === 'Incidents') unit = 'Incidents';

      const chartConfig: ChartConfig = {
        chartId: `slb${idx}`,
        chartType: 'gaugeChart',
        labels: [''],
        datasets,
        options: gaugeChartOptions,
        additionalInfo: {
          value,
          indicatorName: indicatorObj.name,
          nationalAvg: nationalValue,
          unit,
        },
      };

      return chartConfig;
    });

    // console.log('data = ', this.chartData);
  }

  showThumbUp(item: ChartConfig): 'text-success' | 'text-light' {
    if (item.additionalInfo && item.additionalInfo.value > item.additionalInfo.nationalAvg)
      return 'text-success';

    return 'text-light';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }
}

const gaugeChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1,
  circumference: 180,
  rotation: 270,
  cutout: '55%',
  plugins: {
    legend: { display: false },
    tooltip: {
      filter: (tooltipItem) => tooltipItem.dataIndex === 0,
    },
  },
};

// chartData: ChartConfig = {
//   chartId: 'barChart',
//   chartType: 'barChart',
//   labels: ['2020-21', '2021-22', '2022-23'],
//   datasets: [
//     {
//       label: '2023-24',
//       data: [12, 19, 3],
//       backgroundColor: ['#65D2F3'],
//       borderRadius: 5,
//     },
//     {
//       label: '2022-23',
//       data: [10, 8, 6],
//       backgroundColor: ['#1596E6'],
//       borderRadius: 5,
//     },
//     {
//       label: '2021-22',
//       data: [12, 10, 14],
//       backgroundColor: ['#245ABF'],
//       borderRadius: 5,
//     },
//   ],
// };
