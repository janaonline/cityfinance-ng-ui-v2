import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MaterialModule } from '../../../../material.module';
import { LoaderComponent } from "../../../../shared/components/loader/loader.component";
import { PreLoaderComponent } from "../../../../shared/components/pre-loader/pre-loader.component";
import { FiscalRankingService } from '../../services/fiscal-ranking.service';

interface ChartData {
  labels: string[],
  datasets: {
    label: string,
    borderWidth?: number,
    data: number[],
    backgroundColor: string,
    borderColor?: string,
    barPercentage?: number,
  }[]
}

// interface AnyOject {
//   [key: string]: any
// }
interface Section {
  remainingCards: any;
  card1: any;
  card2a: any;
  card2b: any;
  card3a: any;
  card3b: any;
}

@Component({
  selector: 'app-download-pdf',
  standalone: true,
  imports: [MaterialModule, LoaderComponent, PreLoaderComponent],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss'
})
// export class DownloadPdfComponent implements AfterViewInit {
export class DownloadPdfComponent implements OnInit {
  isDataFetched: boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fiscalRankingService: FiscalRankingService,
  ) { }

  get ulbId() {
    return this.activatedRoute.snapshot.params['ulbId'];
  }

  ngOnInit(): void {
    this.downloadPdf();
  }


  // PDF download.
  // Default variables.
  private fontFamily: string = 'Montserrat';
  cfPrimaryLight: string = 'hsl(27, 79%, 92%)';
  ulbData: any = {};
  section2: any = {};
  section3: any = {};
  overAllScore: number = 0;
  chart1: Chart | undefined;
  chart2: Chart | undefined;
  chart3: Chart | undefined;

  public downloadPdf(): void {
    this.fiscalRankingService.downloadRankedUlbPdf(this.ulbId).subscribe({
      next: (res: any) => {
        this.isDataFetched = false;
        this.ulbData = res.ulbData;
        this.section2 = res.section2;
        this.section3 = res.section3;
        this.overAllScore = res.overAllScore;
        this.isDataFetched = true;

        setTimeout(() => {
          this.updateCharts(res.chart1Data, res.chart2Data, res.chart3Data);

          // Ensures charts and text are fully rendered before capture
          requestAnimationFrame(() => {

            const element = document.getElementById('rankings-pdf');

            if (element) {
              html2canvas(element, { useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape', 'mm', 'a4');

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('City Report.pdf');

                setTimeout(() => { window.close() }, 100);

              });
            }

          });

        }, 200);

      },
      error: (error) => {
        console.error('Error in downloading pdf: ', error.message);
      }
    });
  }

  private getFontObj(fontSize: number): any {
    return {
      size: fontSize,
      family: this.fontFamily,
    };
  }

  private updateCharts(chart1Data: ChartData, chart2Data: ChartData, chart3Data: ChartData): void {

    this.chart1 = new Chart('chart1Canvas', {
      type: 'bar',
      data: chart1Data,
      options: {
        animation: { duration: 0 },
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { font: this.getFontObj(10) } } },
        scales: {
          x: {
            stacked: true,
            ticks: { font: this.getFontObj(10) }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 100,
              min: 0,
              max: 600,
              font: this.getFontObj(10)
            }
          }
        }
      },
    } as any);

    this.chart2 = new Chart('chart2Canvas', {
      type: 'line',
      data: chart2Data,
      options: {
        animation: { duration: 0 },
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
        const { ctx, data } = chart;
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
      data: chart3Data,
      options: {
        animation: { duration: 0 },
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

    return;
  }

}


