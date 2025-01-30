import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FiscalRankingService, UlbData } from '../../services/fiscal-ranking.service';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Chart from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-download-pdf',
  standalone: true,
  imports: [],
  templateUrl: './download-pdf.component.html',
  styleUrl: './download-pdf.component.scss'
})
// export class DownloadPdfComponent implements AfterViewInit {
export class DownloadPdfComponent implements OnInit {

  // data: APIResponse = {} as APIResponse;
  isLoading: boolean = true;

  @Input() data: any;
  ulb: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fiscalRankingService: FiscalRankingService,
    private http: HttpClient
  ) { }



  ngOnInit(): void {
  }


  downloadPDF() {
    // Create a new offscreen template
    const offscreenTemplate = document.createElement('div');

    // Set up the template structure
    offscreenTemplate.innerHTML = `
      <div style="width:99%;">
    <div class="d-flex mb-3">
        <h1 class="p-2 text-uppercase text-cfSecondary fw-bold">City Finance Ranking</h1>
        <div class="ms-auto p-2"><img src="./assets/images/city-finance-ranking.png"></div>
    </div>
    <div class="row mb-2">
        <div class="col">
            <div class="px-4 py-2 mb-4 bg-warning-subtle">
                <div class="fw-bold text-cfSecondary fs-3">${this.data?.ulb?.population}</div>
                <div>Population (2011 Census)</div>
            </div>
            <div class="px-4 py-2 mb-4 bg-warning-subtle">
                <div class="fw-bold text-cfSecondary fs-3">${this.data?.ulb?.overAll?.score}</div>
                <div>Population Category ${this.data?.ulb?.statePartCat}</div>
            </div>
            <div class="px-4 py-2 mb-4 bg-warning-subtle">
                <div class="fw-bold text-cfSecondary fs-3">${this.data?.ulb?.overAll?.rank}/4</div>
                <div>National Rank</div>
            </div>
        </div>
        <div class="col">
            <div class="p-3 bg-dark-blue text-white" style="background-color: rgb(24, 51, 103); height: 320px;">
                <div class="d-flex mb-2">
                    <div class="flex-shrink-0 bg-white">
                        <img src="assets/fiscal-rankings/RM.svg">
                    </div>
                    <div class="flex-grow-1 ms-3 fs-5">
                        Resource Mobilization
                    </div>
                </div>
                <div class="fw-bold fs-6">Over All Score: ${this.data?.ulb?.resourceMobilization?.score}/1200</div>
                <div class="fw-bold fs-6">National Rank: ${this.data?.ulb?.resourceMobilization?.rank}/4</div>
                <div class="fw-bold fs-6">Avarage Score: ${this.data?.ulb?.resourceMobilization?.nationalAvg}/1200</div>
                <hr>
                <p class="fs-6">This parameter evaluates the current size and growth trend of a ULB’s diverse revenue
                    sources, including revenue generation and property tax collection.</p>
            </div>
        </div>
        <div class="col">
            <div class="p-3 bg-dark-blue text-white" style="background-color: rgb(24, 51, 103); height: 320px;">
                <div class="d-flex mb-2">
                    <div class="flex-shrink-0 bg-white">
                        <img src="assets/fiscal-rankings/EP.svg">
                    </div>
                    <div class="flex-grow-1 ms-3 fs-5">
                        Expenditure Performance
                    </div>
                </div>
                <div class="fw-bold fs-6">Over All Score:${this.data?.ulb?.expenditurePerformance?.score}/1200</div>
                <div class="fw-bold fs-6">National Rank: ${this.data?.ulb?.expenditurePerformance?.rank}/4</div>
                <div class="fw-bold fs-6">Avarage Score: ${this.data?.ulb?.expenditurePerformance?.nationalAvg}/1200</div>
                <hr>
                <p class="fs-6">This parameter assesses the amount and effectiveness of a ULB's spending on
                    infrastructure and services that benefit residents.</p>
            </div>
        </div>
        <div class="col">
            <div class="p-3 bg-dark-blue text-white" style="background-color: rgb(24, 51, 103); height: 320px;">
                <div class="d-flex mb-2">
                    <div class="flex-shrink-0 bg-white">
                        <img src="assets/fiscal-rankings/FG.svg">
                    </div>
                    <div class="flex-grow-1 ms-3 fs-5">
                        Fiscal Governance
                    </div>
                </div>
                <div class="fw-bold fs-6">Over All Score: ${this.data?.ulb?.fiscalGovernance?.score}/1200</div>
                <div class="fw-bold fs-6">National Rank: ${this.data?.ulb?.fiscalGovernance?.rank}/4</div>
                <div class="fw-bold fs-6">Avarage Score: ${this.data?.ulb?.fiscalGovernance?.nationalAvg}/1200</div>
                <hr>
                <p class="fs-6">This parameter assesses the strength of a ULB's financial management systems,
                    including transparency, efficiency, and effectiveness in revenue collection and budgeting.</p>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col pdf-col">
            <div class="shadow-lg p-2">
                <h5 class="text-cfPrimary">Parameter wise score</h5>
                <p class="fs-6">This section presents the city’s scores for the three pillars of sound financial
                    management:
                    resource
                    mobilisation, expenditure performance, and fiscal governance. A high score in resource mobilisation
                    indicates strong revenue generation, while a high score in expenditure performance reflects
                    efficient
                    use of fund.</p>
                <canvas id="chart1"></canvas>
                <div class="mt-4">
                    <p class="fs-6">Note:<br>
                        State Subcategory<br>
                        1. High Participation (>75% of ULBs from the State participated in the ranking)<br>
                        2. Low Participation (<75% of ULBs from the State participated in the ranking) <br>
                            3. Hilly/ North Eastern States- High Participation State </p>
                </div>
            </div>
        </div>
        <div class="col pdf-col">
            <div class="shadow-lg p-2 mb-2">
                <h5 class="text-cfPrimary">Overall score</h5>
                <div class="d-flex align-items-center mb-2">
                    <div class="flex-shrink-0 bg-white">
                        <div class="fw-bold fs-6 text-cfSecondary">${this.data?.ulb?.overAll?.score}/1200</div>
                        <p>Overall score </p>
                    </div>
                    <div class="flex-grow-1 ms-3 border-set"
                        style="border-left: 2px solid rgb(24, 51, 103); padding-left: 1rem;">
                        <p class="fs-6">This section shows the city’s overall score (out of 1200) based on its
                            performance across 15 key indicators of financial health. The city’s rank among all
                            participating cities is also provided.</p>
                    </div>
                </div>

            </div>
            <div class="shadow-lg p-2">
                <h5 class="text-cfPrimary">Parameter wise Ranks </h5>
                <p class="fs-6">This section presents the city’s rank for each parameter – resource mobilisation,
                    expenditure
                    performance, and fiscal governance – compared to other cities in its population category. Higher
                    ranks
                    indicate better performance than peer cities in revenue generation, efficient spending, and
                    financial
                    transparency.</p>
                <canvas id="chart2"></canvas>
            </div>
        </div>
        <div class="col pdf-col">
            <div class="shadow-lg p-2 mb-2">
                <h5 class="text-cfPrimary">Indicator-wise scores</h5>
                <p class="fs-6">This section provides a detailed breakdown of the city’s performance on the 15
                    indicators
                    used to
                    calculate the overall score. These indicators cover various aspects of resource mobilisation,
                    expenditure performance, and fiscal governance, providing a granular view of the city’s financial
                    health. Each indicator is scored out of 100.</p>
                <canvas id="chart3"></canvas>
            </div>
            <div class="about p-2" style="background-color: rgb(229, 125, 21); color: #fff;">
                <h6>About City Finance Rankings</h6>
                <p class="fs-6">The CityFinance Rankings, an initiative of the Ministry of Housing and Urban Affairs
                    (MoHUA)
                    in
                    collaboration with Janaagraha, evaluates the financial health of India's cities (Urban Local
                    Bodies—ULBs) based on their financial performance across various parameters. By promoting fiscal
                    accountability and transparency among ULBs, the rankings ultimately aim to improve the quality
                    of
                    life
                    for residents across India's urban landscape.</p>
            </div>
        </div>
    </div>
</div>
    `;

    // Append the offscreen template temporarily
    document.body.appendChild(offscreenTemplate);

    // Get references to the canvases
    const chart1Canvas = offscreenTemplate.querySelector('#chart1') as HTMLCanvasElement;
    const chart2Canvas = offscreenTemplate.querySelector('#chart2') as HTMLCanvasElement;
    const chart3Canvas = offscreenTemplate.querySelector('#chart3') as HTMLCanvasElement;

    // Create the charts using Chart.js
    const chart1 = new Chart(chart1Canvas.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Sales',
            data: [12, 19, 3, 5],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
      },
    });

    const chart2 = new Chart(chart2Canvas.getContext('2d')!, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [
          {
            label: 'Revenue',
            data: [15, 10, 25, 18],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
      },
    });

    const chart3 = new Chart(chart3Canvas.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['Product A', 'Product B', 'Product C'],
        datasets: [
          {
            label: 'Product Share',
            data: [30, 50, 20],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
      },
    });

    // Wait for the charts to render before generating the PDF
    setTimeout(() => {
      html2canvas(offscreenTemplate, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
        pdf.save('City-report-card.pdf');

        // Clean up the temporary template
        document.body.removeChild(offscreenTemplate);

        // Destroy charts to avoid memory leaks
        chart1.destroy();
        chart2.destroy();
        chart3.destroy();
      });
    }, 500); // Delay to ensure charts are fully rendered
  }

}


