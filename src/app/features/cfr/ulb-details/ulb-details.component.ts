import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { BreadcrumbComponent, BreadcrumbLink } from '../breadcrumb/breadcrumb.component';
import { FiscalRankingService, UlbData } from '../services/fiscal-ranking.service';
import { ComparisonComponent } from './comparison/comparison.component';
import { PerformanceFourMComponent } from './performance-four-m/performance-four-m.component';
import { UlbDetailsAssessmentParametersComponent } from './ulb-details-assessment-parameters/ulb-details-assessment-parameters.component';
import { UlbDetailsHeaderComponent } from './ulb-details-header/ulb-details-header.component';
import { PreLoaderComponent } from '../../../shared/components/pre-loader/pre-loader.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface APIResponse {
  assessmentParameter: any;
  fsData: {
    [key: string]: {
      value: string | null;
      status: 'APPROVED' | 'REJECTED' | 'PENDING';
    };
  };
  topUlbs: UlbData[];
  ulb: any;
}

@Component({
  selector: 'app-ulb-details',
  templateUrl: './ulb-details.component.html',
  styleUrls: ['./ulb-details.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    BreadcrumbComponent,
    UlbDetailsHeaderComponent,
    UlbDetailsAssessmentParametersComponent,
    PerformanceFourMComponent,
    ComparisonComponent,
    LoaderComponent,
    PreLoaderComponent
  ],
})
export class UlbDetailsComponent implements OnInit {
  breadcrumbLinks: BreadcrumbLink[] = [
    {
      label: 'City Finance Ranking - Home',
      url: '/cfr/home',
    },
    {
      label: 'Top rankings',
      url: '/cfr/top-rankings',
    },
  ];

  data: APIResponse = {} as APIResponse;
  isLoading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fiscalRankingService: FiscalRankingService,
  ) { }

  get ulbId() {
    return this.activatedRoute.snapshot.params['ulbId'];
  }

  ngOnInit(): void {
    this.breadcrumbLinks.push({
      label: 'ULB details',
      url: `/cfr/ulb/${this.ulbId}`,
      class: 'disabled',
    });

    this.loadUlbData();
    // Swal.fire('Error', 'Something went wrong', 'error');
  }

  loadUlbData() {
    this.isLoading = true;
    this.fiscalRankingService.ulbDetails(this.ulbId).subscribe((res: any) => {
      // console.log(res);
      this.data = res.data;
      this.isLoading = false;
    });
  }
  @ViewChild('pdfDownload') pdfDownload!: ElementRef;
  downloadPDF() {
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
      pdf.save('download-template.pdf');

      // Hide the template again
      templateElement.style.display = 'none';
    });
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
