// 

import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() {
    // pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  generatePdf() {
    const documentDefinition = this.getDocumentDefinition();
    // pdfMake.createPdf(documentDefinition).download('document.pdf');
  }

  private getDocumentDefinition() {
    return {
      content: [
        { text: 'Dynamic PDF with pdfmake', style: 'header' },
        'This is a sample PDF generated with pdfmake in Angular.',
        { text: 'Another paragraph', style: 'subheader' },
        { text: 'This is an unstyled paragraph.' },
        { text: 'This is a paragraph with a style applied.', style: 'exampleStyle' },
        {
          table: {
            body: [
              ['Column 1', 'Column 2', 'Column 3'],
              ['Data 1', 'Data 2', 'Data 3'],
              ['Data 4', 'Data 5', 'Data 6']
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 15,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        exampleStyle: {
          italics: true,
          alignment: 'center'
        }
      }
    };
  }
}
