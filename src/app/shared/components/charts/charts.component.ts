import { AfterViewInit, Component, ElementRef, input, OnDestroy, ViewChild } from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
Chart.register(...registerables);

// In a new file, e.g., chart-types.ts
export interface ChartDataSet {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderRadius?: number;
  borderWidth?: number;
  pointBackgroundColor?: string;
  fill?: boolean;
  tension?: number;
  // type?: 'bar' | 'line'; // For mixed charts
}

export interface ChartConfig {
  chartType: 'barChart' | 'lineChart' | 'pieChart' | 'mixedChart' | 'gaugeChart' | 'doughnut';
  chartId: string;
  labels?: string[];
  datasets: ChartDataSet[];
  options?: ChartOptions;

  additionalInfo?: slbData;

  // Todo: create another interface
  // idx: number;
  // indicatorType: string;
  // value: number;
}

export interface slbData {
  indicatorName: string;
  value: number;
  nationalAvg: number;
  unit: string;
}

@Component({
  selector: 'app-charts',
  imports: [],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss',
})
export class ChartsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  chartConfig = input.required<ChartConfig>();
  chartInstance: Chart | undefined;

  // ngOnInit(): void {
  // console.log('Chart called: ', this.chartConfig());
  // }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart();
    }, 100);
  }

  private createChart(): void {
    // console.log('Canvas element:', this.chartCanvas);

    if (!this.chartCanvas) {
      console.error('Canvas element not found for chart:', this.chartConfig().chartId);
      return;
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context for canvas.');
      return;
    }

    // Destroy existing chart instance if any (for updates later)
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const config = this.chartConfig();

    switch (config.chartType) {
      case 'barChart':
        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options:
            config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Years', 'Amt in ₹ Cr'),
        });
        break;
      case 'lineChart':
        this.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options:
            config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Months', 'Amt in ₹ Cr'),
        });
        break;
      case 'pieChart':
        this.chartInstance = new Chart(ctx, {
          type: 'doughnut', // Or 'pie' based on actual usage
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options || baseChartOptions(DEFAULT_FONT_FAMILY, false, '', ''),
        });
        break;
      case 'mixedChart':
        this.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options:
            config.options || baseChartOptions(DEFAULT_FONT_FAMILY, true, 'Revenue', 'Amt in ₹ Cr'),
        });
        break;
      case 'gaugeChart':
        this.chartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: config.labels,
            datasets: config.datasets,
          },
          options: config.options,
        });
        break;
      default:
        console.warn(`Unknown chart type: ${config.chartType}`);
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}

// chart-config.ts
// TODO: Add this to constants.js and use from there.
export const DEFAULT_FONT_FAMILY = 'Montserrat';
const TEXT_LIGHT = '#374151';
const DEFAULT_FONT_SIZE = 11;
export const baseChartOptions = (
  fontFamily = 'Montserrat',
  showAxes = true,
  xAxisLabel = 'X Axis',
  yAxisLabel = 'Y Axis',
): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  // aspectRatio: 1,
  font: { family: fontFamily, size: 11 },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { labels: { font: { family: fontFamily, size: 12 } } },
    tooltip: {
      titleFont: { family: fontFamily },
      bodyFont: { family: fontFamily },
    },
  },
  layout: { padding: 5 },
  scales: {
    x: {
      display: showAxes,
      ticks: { font: { family: fontFamily } },
      title: {
        display: showAxes,
        text: xAxisLabel,
        font: {
          family: fontFamily,
          size: DEFAULT_FONT_SIZE,
          weight: 'bold',
        },
        color: TEXT_LIGHT,
      },
    },
    y: {
      display: showAxes,
      ticks: { font: { family: fontFamily } },
      title: {
        display: showAxes,
        text: yAxisLabel,
        font: {
          family: fontFamily,
          size: DEFAULT_FONT_SIZE,
          weight: 'bold',
        },
        color: TEXT_LIGHT,
      },
    },
  },
});
