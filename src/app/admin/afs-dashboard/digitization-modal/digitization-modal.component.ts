import { Component, inject, model, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PDFDocument } from 'pdf-lib';
import { environment } from '../../../../environments/environment';
import { AfsExcelFile, AfsService, FilterValues } from '../afs.service';

export interface DialogData {
  selectedRows: any[];
  filters: FilterValues;
  type: 'add' | 'remove';
}

@Component({
  selector: 'app-digitization-modal',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule,],
  templateUrl: './digitization-modal.component.html',
  styleUrl: './digitization-modal.component.scss'
})
export class DigitizationModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DigitizationModalComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly afsService = inject(AfsService);

  // logsData: any;
  filteredFiles: any;
  storageBaseUrl: string = environment.STORAGE_BASEURL;
  selectedFilesCount: number = 0;

  filters: FilterValues = this.data.filters;
  totalSelectedPages: number = 0;

  showDigitizePopup = false;
  digitizeStatus: string = '';
  digitizePopupMessage: string = '';
  selectedFiles: AfsExcelFile[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    // this.fetchLog();
    this.prepareFiles();
  }

  async getPdfPageCount(url: string): Promise<number> {
    try {
      const response = await fetch(environment.STORAGE_BASEURL + url);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (err) {
      console.error('Failed to load PDF for page count:', err);
      return 0;
    }
  }

  async prepareFiles() {
    // console.log('selectedRows', this.data.selectedRows);
    let alreadyDigitizedFiles = 0;
    let alreadyDigitizedPages = 0;
    this.isLoading = true;
    for (const row of this.data.selectedRows) {
      const fileData = {
        annualAccountsId: row._id,
        ulb: row.ulb,
        year: row.year,
        docType: this.filters.docType,
        auditType: this.filters.auditType,
      }

      const ulbFile = row[`${this.filters.docType}`]?.url;
      const afsFile = row.afsexcelfiles?.afsFile ? row.afsexcelfiles?.afsFile.pdfUrl : null;

      ++this.selectedFilesCount;
      if (ulbFile) {
        this.selectedFiles.push({ pdfUrl: ulbFile, uploadedBy: 'ULB', ...fileData });
        if (['digitized', 'queued'].includes(row.afsexcelfiles?.ulbFile?.digitizationStatus || '')) {
          ++alreadyDigitizedFiles;
          this.totalSelectedPages = alreadyDigitizedPages = alreadyDigitizedPages + (row.afsexcelfiles?.ulbFile?.noOfPages || 0);
        } else {
          this.totalSelectedPages = this.totalSelectedPages + await this.getPdfPageCount(ulbFile);
        }
      }

      if (afsFile) {
        // this.totalSelectedPages = this.totalSelectedPages + await this.getPdfPageCount(afsFile);
        this.selectedFiles.push({ pdfUrl: afsFile, uploadedBy: 'AFS', ...fileData });
        ++this.selectedFilesCount;
        if (['digitized', 'queued'].includes(row.afsexcelfiles?.afsFile?.digitizationStatus || '')) {
          ++alreadyDigitizedFiles;
          this.totalSelectedPages = alreadyDigitizedPages = alreadyDigitizedPages + (row.afsexcelfiles?.afsFile?.noOfPages || 0);
        } else {
          this.totalSelectedPages = this.totalSelectedPages + await this.getPdfPageCount(afsFile);
        }
      }
    }

    console.log('Files prepared for digitization:', this.selectedFiles);
    this.isLoading = false;
    // --- build message ---
    if (alreadyDigitizedFiles > 0) {
      this.digitizePopupMessage = `Are you sure to digitize the selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files along with ${alreadyDigitizedFiles} already digitized PDFs with ${alreadyDigitizedPages} pages?`;
    } else {
      this.digitizePopupMessage = `You have selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files to digitize.`;
    }
  }

  proceedDigitization(type: string): void {
    this.isLoading = true;
    // console.log('Proceeding digitization...', this.selectedFiles);
    const payloads = { jobs: this.selectedFiles };
    // this.dialogRef.close(true);
    // return;
    this.afsService.startDigitization(payloads).subscribe({
      next: (res) => {
        this.isLoading = false;
        // console.log('Digitization started successfully:', res);
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to start digitization:', err);
        this.dialogRef.close(false);
      }
    });
  }


  cancel(): void {
    this.dialogRef.close();
  }
  readonly confirm = model(this.data);


}
