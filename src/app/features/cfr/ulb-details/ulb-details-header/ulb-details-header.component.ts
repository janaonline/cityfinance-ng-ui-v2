import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-ulb-details-header',
  templateUrl: './ulb-details-header.component.html',
  styleUrls: ['./ulb-details-header.component.scss'],
  standalone: true,
  imports: [MaterialModule],
})
export class UlbDetailsHeaderComponent implements OnChanges {
  @Input() data: any;
  ulb: any;
  cfPrimary: string = 'hsla(30, 83%, 49%, 1)';
  cfPrimaryLight: string = 'hsl(27, 79%, 92%)';
  cfSecondary: string = 'hsla(220, 62%, 25%, 1)';
  fontFamily: string = 'Montserrat';

  constructor() { }

  ngOnInit(): void {
    this.updateCharts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) this.updateInputDataDependencies();
  }

  private getFontObj(fontSize: number): any {
    return {
      size: fontSize,
      family: this.fontFamily,
    };
  }

  private updateInputDataDependencies() {
    this.ulb = this.data?.ulb;
  }

  private updateCharts(): void {
    this.chart1 = new Chart('chart1Canvas', {
      type: 'bar',
      data: {
        labels: ['RM', 'EP', 'FG'],
        datasets: [
          {
            label: 'ULB Score',
            data: [400, 100, 200],
            backgroundColor: this.cfPrimary,
            // borderWidth: 1,
            barPercentage: 0.4
          },
          {
            label: 'Parameter Score',
            data: [200, 300, 300],
            backgroundColor: this.cfSecondary,
            // borderWidth: 1,
            barPercentage: 0.4
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: this.getFontObj(10) } } },
        scales: {
          x: {
            stacked: true,
            ticks: { font: this.getFontObj(10) }
          },
          y: {
            stacked: true,
            ticks: { font: this.getFontObj(10) }
          }
        }
      },
    } as any);

    this.chart2 = new Chart('chart2Canvas', {
      type: 'line',
      data: {
        labels: ['RM', 'EP', 'FG'],
        datasets: [
          {
            label: 'Ranks',
            data: [1, 2, 3],
            backgroundColor: this.cfSecondary,
            borderColor: this.cfSecondary,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: this.getFontObj(12) } } },
        scales: {
          x: { ticks: { font: this.getFontObj(11) } },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value) => { return Number(value).toFixed(0); },
              font: this.getFontObj(11)
            }
          },
        }
      },
    });

    // Create custom plugin to add text inside the bar.
    const innerBarText = {
      id: 'innerBarText',
      afterDraw(chart: any) {
        const { ctx, data, chartArea: { left, top }, scales: { x, y } } = chart;
        ctx.save();

        // Loop through each data point in the first dataset
        data.datasets[0].data.forEach((dataPoint: any, index: any) => {
          const bar = chart.getDatasetMeta(0).data[index]; // Get the bar element
          const xPos = bar.x; // x position of the bar
          const yPos = bar.y + bar.height / 2; // y position of the bar (centered vertically)

          ctx.font = '7px Montserrat';
          ctx.fillStyle = 'gray';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Display the data value inside the bar
          ctx.fillText(dataPoint, xPos, yPos);
        });

        ctx.restore();
      }
    };

    // Register the custom plugin
    Chart.register(innerBarText);

    this.chart3 = new Chart('chart3Canvas', {
      type: 'bar',
      data: {
        labels: [
          '15. Properties under tax collection net',
          '14. Digital own rev collection to tot own rev collection',
          '13. Own revenue receivables outstanding',
          '12. Budget vs Actual (variance) for total receipts',
          '11. P.Tax & accounting linked to it-based system',
          '10. Timely audit & publication of annual accounts',
          '9. O&M to total rev exp(3-Y Avg)',
          '8. Growth in capex per capita',
          '7. Capex per capita (3-Y Avg)',
          '6. Property tax per capita (3-Y CAGR)',
          '5. Own revenue per capita (3-Y CAGR)',
          '4. Total budget size per capita',
          '3. Property tax per capita',
          '2. Own revenue per capita',
          '1. Total budget size per capita'
        ],
        datasets: [
          {
            data: ['50', '16', '50', '40', '50', '50', '28.1', '63.1', '32.7', '67.0', '64.3', '0', '46.8', '94.1', '85'],
            backgroundColor: this.cfPrimaryLight,
            borderColor: this.cfPrimary,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        indexAxis: 'y',
        elements: { bar: { borderWidth: 2 } },
        scales: {
          x: { ticks: { font: this.getFontObj(10) } },
          y: { ticks: { font: this.getFontObj(7.5) } },
        },
        plugins: { legend: { display: false } },
      }
    });
  }

  public downloadPdf(): void {
    const element = document.getElementById('rankings-pdf');

    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        // Scale the image to fit A4 size
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('City Report.pdf');
      });
    } else {
      console.error('Element #rankings-pdf not found!');
    }
  }

  public chart1: any;
  public chart2: any;
  public chart3: any;

  public section1_card1: any[] = [
    { title: '25,654', subtitle: 'Population (2011 Census)' },
    { title: '4M+', subtitle: 'Population Category<br>High Participation State' },
    { title: '2/ 4', subtitle: 'National Rank' },
  ]

  public section1_card2: any[] = [
    {
      key: 'RM',
      label: 'Resource Mobilisation',
      // key1: 'OverAll',
      scoreNumerator: 736.87,
      scoreDenominator: 1200,
      // key2: 'National',
      rankNumerator: 2,
      rankDenominator: 4,
      // key3: 'Average',
      avgNumerator: 736.87,
      avgDenominator: 1200,
      desc: "This parameter evaluates the current size and growth trend of a ulb's diverse revenue sources, including revenue generation and property tax collection.",
    },
    {
      key: 'EP',
      label: 'Expenditure Performance',
      // key1: 'OverAll',
      scoreNumerator: 736.87,
      scoreDenominator: 1200,
      // key2: 'National',
      rankNumerator: 2,
      rankDenominator: 4,
      // key3: 'Average',
      avgNumerator: 736.87,
      avgDenominator: 1200,
      desc: "This parameter assesses the amount and effectiveness of a ULB's spending on infrastructure and services that benefit residents.",
    },
    {
      key: 'FG',
      label: 'Fiscal Governance',
      // key1: 'OverAll',
      scoreNumerator: 736.87,
      scoreDenominator: 1200,
      // key2: 'National',
      rankNumerator: 2,
      rankDenominator: 4,
      // key3: 'Average',
      avgNumerator: 736.87,
      avgDenominator: 1200,
      desc: "This parameter assesses the strength of a ULB's financial management systems, including transparency, efficiency, and effectiveness in revenue collection and budgeting.",
    }
  ];

  overAllScore: number = 12;

}
