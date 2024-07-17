import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  constructor(private http: HttpClient) {
    this.setupPdfMake();
  }

  private setupPdfMake() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
      // Add other fonts as needed
    };
  }

  generatePdfFromJson(content: any) {
    const documentDefinition = this.getDocumentDefinition(content);
    pdfMake.createPdf(documentDefinition).download('document.pdf');
  }

  private getDocumentDefinition(content: any) {
    return {
      content: [
        { text: content.title, style: 'header' },
        content.body,
        { text: 'Table', style: 'subheader' },
        {
          table: {
            body: [
              content.tableHeaders,
              ...content.tableRows
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          background: 'grey',
          padding: [10, 10, 10, 10] as [number, number, number, number],
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number]
        },
        subheader: {
          fontSize: 15,
          color: 'red',
          bold: true,
          padding: [10, 10, 10, 10] as [number, number, number, number],
          margin: [0, 10, 0, 5] as [number, number, number, number]
        }
      }
    };
  }

  getContentFromJson(): Observable<any> {
    return this.http.get('assets/pdf-content.json');
  }
}
