import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { PdfGeneratorService } from '../core/services/pdf-generator.service';

@Component({
  selector: 'app-pdf-content',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pdf-content.component.html',
  styleUrls: ['./pdf-content.component.scss']
})
export class PdfContentComponent {
  content: any;

  constructor(private pdfGeneratorService: PdfGeneratorService) {}

  ngOnInit(): void {
    this.pdfGeneratorService.getContentFromJson().subscribe(data => {
      this.content = data;
    });
  }

  generatePdf() {
    this.pdfGeneratorService.generatePdfFromJson(this.content);
  }
}
