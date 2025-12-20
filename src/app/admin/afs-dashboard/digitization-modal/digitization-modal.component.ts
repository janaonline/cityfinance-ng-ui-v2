import { Component, inject, model, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PDFDocument } from 'pdf-lib';
import { environment } from '../../../../environments/environment';
import { AfsExcelFile, AfsService } from '../afs.service';

export interface DialogData {
  selectedRows: any[];
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

  filters = {
    docType: 'bal_sheet_schedules',
    // yearId: '606aaf854dff55e6c075d219',
    yearId: '606aadac4dff55e6c075c507',
    auditType: 'audited',
    populationCategory: '1M-4M'
  };
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
    const alreadyDigitizedFiles = 0;
    const alreadyDigitizedPages = 0;

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
        this.totalSelectedPages = this.totalSelectedPages + await this.getPdfPageCount(ulbFile);
        this.selectedFiles.push({ pdfUrl: ulbFile, uploadedBy: 'ULB', ...fileData });

      }

      if (afsFile) {
        this.totalSelectedPages = this.totalSelectedPages + await this.getPdfPageCount(afsFile);
        this.selectedFiles.push({ pdfUrl: afsFile, uploadedBy: 'AFS', ...fileData });
        ++this.selectedFilesCount;
      }
    }

    console.log('Files prepared for digitization:', this.selectedFiles);

    // --- build message ---
    if (alreadyDigitizedFiles > 0) {
      this.digitizePopupMessage = `Are you sure to digitize the selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files along with ${alreadyDigitizedFiles} already digitized PDFs with ${alreadyDigitizedPages} pages?`;
    } else {
      this.digitizePopupMessage = `You have selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files to digitize.`;
    }
  }

  proceedDigitization(): void {
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

  //   openDigitizePopup() {
  //     this.showDigitizePopup = true;
  //     this.digitizeStatus = '';

  //     const PLACEHOLDER_URL = 'https://placeholder-link.com/none';
  //     let alreadyDigitizedFiles = 0;
  //     let alreadyDigitizedPages = 0;

  //     for (const f of this.filteredFiles.filter((f: any) => f.selected)) {
  //       // filter out placeholder excel files
  //       const validExcelFiles = (f.excelFiles || []).filter(
  //         (ef: any) => ef.fileUrl && ef.fileUrl !== PLACEHOLDER_URL
  //       );

  //       if (validExcelFiles.length > 0) {
  //         alreadyDigitizedFiles += validExcelFiles.length;

  //         // sum up page counts from the main file
  //         if (f.pageCount) alreadyDigitizedPages += f.pageCount;

  //         // and from extra files (AFS PDFs etc.)
  //         if (f.extraFiles?.length) {
  //           for (const ef of f.extraFiles) {
  //             if (ef.pageCount) alreadyDigitizedPages += ef.pageCount;
  //           }
  //         }
  //       }
  //     }

  //     // --- build message ---
  //     if (alreadyDigitizedFiles > 0) {
  //       this.digitizePopupMessage = `Are you sure to digitize the selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files along with ${alreadyDigitizedFiles} already digitized PDFs with ${alreadyDigitizedPages} pages?`;
  //     } else {
  //       this.digitizePopupMessage = `You have selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files to digitize.`;
  //     }
  //   }



  //   private async fetchPdfAsBlob(url: string): Promise<Blob> {
  //     if (!url) {
  //       throw new Error("Invalid file URL");
  //     }

  //     let fullUrl = url.trim();

  //     //  Fix malformed URLs like "https//"
  //     if (fullUrl.startsWith("https//")) {
  //       fullUrl = fullUrl.replace("https//", "https://");
  //     }

  //     //  Only prefix storageBaseUrl if the URL is relative (starts with "/")
  //     if (fullUrl.startsWith("/")) {
  //       fullUrl = this.storageBaseUrl + fullUrl;
  //     }

  //     console.log(" Fetching PDF from:", fullUrl);

  //     const response = await fetch(fullUrl);
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  //     }

  //     return await response.blob();
  //   }



  //   private async fetchExcelAsBlob(url: string): Promise<Blob> {
  //     const response = await fetch(url);
  //     if (!response.ok) throw new Error(`Failed to fetch Excel: ${response.status}`);
  //     return await response.blob();
  //   }


  //   private normalizePdfUrl(rawUrl: string): string {
  //     if (!rawUrl) return '';
  //     let fullUrl = rawUrl.trim();
  //     if (fullUrl.startsWith('https//')) {
  //       fullUrl = fullUrl.replace('https//', 'https://');
  //     }
  //     if (fullUrl.startsWith('/')) {
  //       fullUrl = this.storageBaseUrl + fullUrl;
  //     }
  //     return fullUrl;
  //   }

  //   /** Build FormData for a single PDF (ULB or AFS) */
  //   private async buildDigitizationFormData(url: string) {
  //     const timestamp = new Date().getTime();
  //     const formData = new FormData();

  //     const blob = await this.fetchPdfAsBlob(url);
  //     // formData.append('file', blob, `document_${timestamp}.pdf`);
  //     formData.append('file', blob, `document.pdf`);

  //     formData.append('Document_type_ID', this.filters.docType || 'bal_sheet');

  //     return formData;
  //   }

  //   /** Wrapper for digitization HTTP call with safe error handling */
  //   private async callDigitizationApi(
  //     url: string
  //   ): Promise<DigitizationResponse> {
  //     let response: DigitizationResponse = {};

  //     const formData = await this.buildDigitizationFormData(url);

  //     try {
  //       response = await firstValueFrom(this.afsService.digitizeFile(formData));
  //     } catch (error: any) {
  //       response = error?.error || {};
  //       console.warn(`⚠️ Digitization failed:`, response);
  //     }

  //     console.log(`📄Digitization API Response:`, response);
  //     return response;
  //   }

  //   /** Process a single ULB row (main file + extra AFS files) */
  //   private async processFileRow(fileRow: FileData): Promise<void> {
  //     const excelLinks: ExcelLinkMeta[] = [];
  //     // if (!pdf.fileUrl && !pdf.previewUrl && !pdf.originalFile) {
  //     //   console.warn(`⚠️ Skipping ${sourceType}: no file source`, pdf);
  //     //   continue;
  //     // }

  //     // Call digitization API
  //     const digitizeResp = await this.callDigitizationApi(fileRow.pdfUrl);

  //     // Show message if present
  //     if (digitizeResp?.message) {
  //       alert(digitizeResp.message);
  //     }

  //     // Handle response (excel link / failed request / metrics)
  //     const excelMeta = await this.handleDigitizationResponse(
  //       digitizeResp,
  //       fileRow,
  //     );

  //     if (excelMeta) {
  //       excelLinks.push(excelMeta);
  //     }


  //     // Upload Excel metadata if any were generated
  //     if (excelLinks.length > 0) {
  //       await this.uploadExcelLinks(fileRow, excelLinks);
  //       console.log(`✅ Uploaded ${excelLinks.length} Excel(s) for ${fileRow.ulb}`);
  //     }

  //     console.log('Row processed successfully:', fileRow.ulb);
  //   }

  //   /**
  //  * Handle digitization response:
  //  * - If Excel generated → return ExcelLinkMeta
  //  * - If only requestId → save failed request
  //  * - Always update metrics
  //  */
  //   private async handleDigitizationResponse(
  //     digitizeResp: DigitizationResponse,
  //     fileRow: any
  //   ): Promise<ExcelLinkMeta | null> {
  //     const hasExcel = !!digitizeResp?.S3_Excel_Storage_Link;
  //     const hasRequestId = !!digitizeResp?.request_id;
  //     const confidenceScore = digitizeResp?.overall_confidence_score ?? null;

  //     const fullPdfUrl = this.normalizePdfUrl(fileRow.fileUrl);
  //     const pagesCount = await this.getPdfPageCount(fullPdfUrl);

  //     // Update metrics (success / failure)
  //     await this.updateDigitizationMetrics(hasExcel, pagesCount);

  //     // CASE 1: Excel successfully generated
  //     if (hasExcel) {
  //       return {
  //         url: digitizeResp.S3_Excel_Storage_Link!,
  //         requestId: digitizeResp.request_id || '',
  //         source: fileRow.sourceType,
  //         confidenceScore
  //       };
  //     }

  //     // CASE 2: Failed but has requestId — save request only
  //     if (hasRequestId) {
  //       const metaBody = {
  //         ulbId: fileRow.ulb,
  //         financialYear: this.filters.yearId,
  //         auditType: this.filters.auditType,
  //         docType: this.filters.docType,
  //         requestIds: [digitizeResp.request_id],
  //         failedSource: fileRow.uploadedBy,
  //         confidenceScore
  //       };

  //       console.log(`💾 Saving failed ${fileRow.uploadedBy} requestId:`, metaBody);
  //       await this.afsService.saveDigitizeReq(metaBody)

  //       console.log(`✅ Saved failed ${fileRow.uploadedBy} requestId for ${fileRow['ulbId']}`);
  //     }

  //     return null;
  //   }

  //   /** Hit metrics endpoint with success / failure and pages */
  //   private async updateDigitizationMetrics(success: boolean, pagesCount: number): Promise<void> {
  //     const params = {
  //       update: 'true',
  //       success: success ? 'true' : 'false',
  //       pages: String(pagesCount)
  //     }
  //     try {
  //       await this.afsService.getMetrics(params);

  //     } catch (err) {
  //       console.warn('⚠️ Failed to update digitization metrics', err);
  //     }
  //   }

  //   /** Upload successful Excel link metadata to backend */
  //   private async uploadExcelLinks(fileRow: any, excelLinks: ExcelLinkMeta[]): Promise<void> {
  //     const backendForm = new FormData();
  //     backendForm.append('ulbId', fileRow.ulb);
  //     backendForm.append('financialYear', this.filters.yearId);
  //     backendForm.append('auditType', this.filters.auditType);
  //     backendForm.append('docType', this.filters.docType);

  //     for (const excel of excelLinks) {
  //       backendForm.append('excelLinks', JSON.stringify(excel));
  //     }
  //     await this.afsService.afsExcelFile(backendForm);

  //   }

  //   async proceedDigitization_v2(): Promise<void> {
  //     if (!this.selectedFilesCount) {
  //       return;
  //     }

  //     this.digitizeStatus = 'processing';

  //     for (const fileRow of this.selectedFiles) {
  //       try {
  //         await this.processFileRow(fileRow);
  //       } catch (err) {
  //         console.error('❌ Error digitizing row', fileRow.ulb, err);
  //       }
  //     }

  //     this.digitizeStatus = 'done';

  //     if (this.digitizeStatus === 'done') {
  //       // this.applyFilters();
  //     }
  //   }

  //   async proceedDigitization_v1() {
  //     for (const row of this.data.selectedRows as RawRow[]) {
  //       const ulbFile = environment.STORAGE_BASEURL + row[`${this.filters.docType}`]?.url;
  //       const afsFile = row.afsfiles ? environment.STORAGE_BASEURL + '/' + row.afsfiles?.s3Key : null;


  //       const sourceType = ulbFile ? 'ULB' : 'AFS';

  //       const digitizeResp: any = await this.callDigitizationApi(ulbFile);

  //       console.log(`📄 ${sourceType} Digitization API Response:`, digitizeResp);
  //       if (digitizeResp?.message) {
  //         alert(digitizeResp.message);
  //       }

  //       // === CASE 1: Excel successfully generated ===
  //       if (digitizeResp?.S3_Excel_Storage_Link) {
  //         const excelLinks = [];
  //         excelLinks.push({
  //           url: digitizeResp.S3_Excel_Storage_Link,
  //           requestId: digitizeResp.request_id,
  //           source: sourceType,
  //           confidenceScore: digitizeResp?.overall_confidence_score || null,
  //         });
  //       }

  //       // === CASE 2: Failed but has requestId — save request only ===
  //       else if (digitizeResp?.request_id) {
  //         const metaBody = {
  //           ulbId: row.ulb,
  //           financialYear: this.filters.yearId,
  //           auditType: this.filters.auditType,
  //           docType: this.filters.docType,
  //           requestIds: [digitizeResp.request_id],
  //           failedSource: sourceType,
  //           confidenceScore: digitizeResp?.overall_confidence_score || null,
  //         };

  //         console.log(`💾 Saving failed ${sourceType} requestId:`, metaBody);

  //         await this.afsService.saveDigitizeReq(metaBody);

  //         console.log(`✅ Saved failed ${sourceType} requestId for ${row.ulb}`);
  //       }
  //     }
  //   }

  //   async proceedDigitization_bkp() {
  //     if (this.selectedFilesCount === 0) return;

  //     this.digitizeStatus = 'processing';

  //     for (const fileRow of this.filteredFiles.filter((f: any) => f.selected)) {
  //       try {
  //         const excelLinks: any[] = [];

  //         // Combine ULB + AFS PDFs
  //         const pdfFiles = [fileRow, ...(fileRow.extraFiles || [])];

  //         for (const pdf of pdfFiles) {
  //           if (!pdf.fileUrl && !pdf.previewUrl && !pdf.originalFile) continue;

  //           const formData = new FormData();

  //           // Prepare file blob
  //           if (pdf.originalFile) {
  //             formData.append("file", pdf.originalFile, pdf.originalFile.name);
  //           } else {
  //             const blob = await this.fetchPdfAsBlob(pdf.fileUrl || pdf.previewUrl || '');
  //             formData.append("file", blob, "document.pdf");
  //           }

  //           const sourceType = pdf === fileRow ? 'ULB' : 'AFS';
  //           formData.append("Document_type_ID", fileRow.docType || "bal_sheet");

  //           let digitizeResp: any;
  //           try {
  //             // digitizeResp = await this.http.post(
  //             //   environment.api.url3 + "digitization/AFS_Digitization",
  //             //   formData
  //             // ).toPromise();
  //           } catch (error: any) {
  //             digitizeResp = error?.error || {};
  //             console.warn(`⚠️ ${sourceType} Digitization failed:`, digitizeResp);
  //           }

  //           console.log(`📄 ${sourceType} Digitization API Response:`, digitizeResp);
  //           if (digitizeResp?.message) {
  //             alert(digitizeResp.message);
  //           }
  //           // === CASE 1: Excel successfully generated ===
  //           if (digitizeResp?.S3_Excel_Storage_Link) {

  //             excelLinks.push({
  //               url: digitizeResp.S3_Excel_Storage_Link,
  //               requestId: digitizeResp.request_id,
  //               source: sourceType,
  //               confidenceScore: digitizeResp?.overall_confidence_score || null,
  //             });
  //           }

  //           // === CASE 2: Failed but has requestId — save request only ===
  //           else if (digitizeResp?.request_id) {
  //             const metaBody = {
  //               ulbId: fileRow['ulbId'],
  //               financialYear: this.filters.yearId,
  //               auditType: this.filters.auditType,
  //               docType: this.filters.docType,
  //               // docTypeName: this.filters.documentTypes
  //               //   .flatMap(group => group.items)
  //               //   .find(doc => doc.key === this.selectedDocType)?.name || '',
  //               requestIds: [digitizeResp.request_id],
  //               failedSource: sourceType,
  //               confidenceScore: digitizeResp?.overall_confidence_score || null,
  //             };

  //             console.log(`💾 Saving failed ${sourceType} requestId:`, metaBody);

  //             // await this.http.post(
  //             //   environment.api.url + 'afs-digitization/save-request-only',
  //             //   metaBody
  //             // ).toPromise();

  //             console.log(`✅ Saved failed ${sourceType} requestId for ${fileRow['ulbId']}`);
  //           }
  //           if (digitizeResp?.S3_Excel_Storage_Link) {
  //             // ✅ Successful file

  //             const fullPdfUrl = this.normalizePdfUrl(pdf.fileUrl || pdf.previewUrl || '');
  //             const pagesCount = await this.getPdfPageCount(fullPdfUrl);

  //             // await this.http.get(
  //             //   `${environment.api.url}afs-digitization/afs-metrics?update=true&success=true&pages=${pagesCount}`
  //             // ).toPromise();
  //           } else {
  //             // ❌ Failed file
  //             const fullPdfUrl = this.normalizePdfUrl(pdf.fileUrl || pdf.previewUrl || '');

  //             const pagesCount = await this.getPdfPageCount(fullPdfUrl);

  //             // await this.http.get(
  //             //   `${environment.api.url}afs-digitization/afs-metrics?update=true&success=false&pages=${pagesCount}`
  //             // ).toPromise();
  //           }
  //         }

  //         // === Upload successful Excel(s) (if any) ===
  //         if (excelLinks.length > 0) {
  //           const backendForm = new FormData();
  //           backendForm.append('ulbId', fileRow['ulbId']);
  //           backendForm.append('financialYear', this.filters.yearId);
  //           backendForm.append('auditType', this.filters.auditType);

  //           const docTypeName = this.filters.docType;
  //           // this.filters.documentTypes
  //           //   .flatMap(group => group.items)
  //           //   .find(doc => doc.key === this.selectedDocType)?.name || '';
  //           backendForm.append('docType', docTypeName);

  //           for (const excel of excelLinks) {
  //             backendForm.append('excelLinks', JSON.stringify(excel));
  //           }
  //           // await this.http.post(
  //           //   environment.api.url + 'afs-digitization/afs-excel-file',
  //           //   backendForm
  //           // ).toPromise();

  //           console.log(`✅ Uploaded ${excelLinks.length} Excel(s) for ${fileRow['ulbId']}`);
  //         }

  //         console.log('Row processed successfully:', fileRow['ulbId']);
  //       } catch (err) {
  //         console.error('❌ Error digitizing row', fileRow['ulbId'], err);
  //       }
  //     }

  //     this.digitizeStatus = 'done';
  //     if (this.digitizeStatus === 'done') {
  //       // this.applyFilters();
  //     }
  //   }


}
