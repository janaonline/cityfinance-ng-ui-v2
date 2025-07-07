import { Component, input, viewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MaterialModule } from '../../../../material.module';
import { ChartConfig } from '../../../../shared/components/charts/chart-interfaces';
import { ChartsComponent } from '../../../../shared/components/charts/charts.component';
import {
  baseChartOptions,
  DEFAULT_FONT_FAMILY,
} from '../../../../shared/components/charts/constants';
import { NoDataFoundComponent } from '../../../../shared/components/shared-ui/no-data-found.component';

@Component({
  selector: 'app-financial-indicator',
  imports: [NoDataFoundComponent, ChartsComponent, MaterialModule],
  templateUrl: './financial-indicator.component.html',
  styleUrl: './financial-indicator.component.scss',
})
export class FinancialIndicatorComponent {
  readonly disabledColor = '#e9ecef';
  readonly primaryColor = '#1b4965';
  readonly secondaryColor = '#62b6cb';
  readonly accentColor = '#bee9e8';
  readonly lineColor = '#f43f5e';

  yearsSignal = input.required<string[]>();

  accordion = viewChild.required(MatAccordion);

  chartData: ChartConfig = {
    chartId: 'mixed0',
    chartType: 'mixedChart',
    labels: ['2020-21', '2021-22', '2022-23'],
    data: {
      labels: ['2020-21', '2021-22', '2022-23'],
      datasets: [
        {
          type: 'line',
          label: 'Y-o-Y Growth',
          data: [-20, -10, 0],
          borderWidth: 2,
          borderColor: this.lineColor,
          pointBackgroundColor: this.lineColor,
          fill: false,
          tension: 0.3,
        },
        {
          type: 'bar',
          label: 'ULB Name',
          data: [2937, 3524, 3883],
          backgroundColor: [this.secondaryColor],
          borderRadius: 5,
        },
        {
          type: 'bar',
          label: 'National Avg',
          data: [1576, 1946, 3037],
          backgroundColor: [this.primaryColor],
          borderRadius: 5,
        },
      ],
    },
    options: baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
  };
}
