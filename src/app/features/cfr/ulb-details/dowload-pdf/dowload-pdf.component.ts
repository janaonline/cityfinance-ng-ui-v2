import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dowload-pdf',
  standalone: true,
  imports: [],
  templateUrl: './dowload-pdf.component.html',
  styleUrl: './dowload-pdf.component.scss'
})
export class DowloadPdfComponent implements AfterViewInit {

  @ViewChild('chartCanvas1', { static: false }) chartCanvas1!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas2', { static: false }) chartCanvas2!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCanvas3', { static: false }) chartCanvas3!: ElementRef<HTMLCanvasElement>;

  chart1!: Chart;
  chart2!: Chart;
  chart3!: Chart;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Register Chart.js components and the data labels plugin
      Chart.register(...registerables, ChartDataLabels);
      this.createChart1();
      this.createChart2();
      this.createChart3();
    }
  }


  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private activatedRoute: ActivatedRoute,
  ) { }


  createChart1(): void {
    this.chart1 = new Chart(this.chartCanvas1.nativeElement, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Score',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black', // Set the color of the labels
            anchor: 'end', // Where the label should appear (e.g., on top of the bars)
            align: 'top', // Align the label
            formatter: function (value: number) {
              return value.toString(); // Format value as a string
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            type: 'linear',
          },
        },
      },
      plugins: [ChartDataLabels], // Enable the plugin
    });
  }
  createChart2(): void {
    this.chart2 = new Chart(this.chartCanvas2.nativeElement, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Rank',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black', // Set the color of the labels
            anchor: 'end', // Where the label should appear (e.g., on top of the bars)
            align: 'top', // Align the label
            formatter: function (value: number) {
              return value.toString(); // Format value as a string
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            type: 'linear',
          },
        },
      },
      plugins: [ChartDataLabels], // Enable the plugin
    });
  }
  createChart3(): void {
    this.chart3 = new Chart(this.chartCanvas3.nativeElement, {
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Score',
            data: [12, 19, 3, 5, 2],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            color: 'black', // Set the color of the labels
            anchor: 'end', // Where the label should appear (e.g., on top of the bars)
            align: 'top', // Align the label
            formatter: function (value: number) {
              return value.toString(); // Format value as a string
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            type: 'linear',
          },
        },
      },
      plugins: [ChartDataLabels], // Enable the plugin
    });
  }

  @ViewChild('pdfDownload') pdfDownload!: ElementRef;
  async downloadPDF() {
    const templateElement = this.pdfDownload.nativeElement;

    // Ensure the hidden template is rendered properly
    templateElement.style.display = 'block';

    html2canvas(templateElement, { scale: 2 }).then((canvas) => {
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
      pdf.save('city-report-card.pdf');

      // Hide the template again
      templateElement.style.display = 'none';
    });

    // const canvas = this.pdfDownload.nativeElement;
    // const pdf = new jsPDF('landscape'); // Landscape orientation
    // const canvasImage = await html2canvas(canvas)
    // const imgData = canvasImage.toDataURL('image/png');
    // pdf.addImage(imgData, 'PNG', 10, 20, 180, 160); // Adjust size as needed
    // pdf.save('chart.pdf');
  }



  // downloadPDF() {
  //   const element = document.getElementById('pdf-download'); // Replace 'content' with your HTML element's ID.

  //   if (!element) {
  //     console.error('Element not found!');
  //     return;
  //   }

  //   html2canvas(element).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('landscape', 'mm', 'a4'); // Landscape orientation

  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width; // Maintain aspect ratio.

  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save('webpage.pdf');
  //   });
  // }
}
