import { SelectionModel } from '@angular/cdk/collections';
import { Component, ViewChild, AfterViewInit, inject, ViewChildren, ElementRef, QueryList, input, effect, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AfsService } from '../afs.service';
import { ToStorageUrlPipe } from "../../../core/pipes/to-storage-url.pipe";
import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AfsLogModalComponent } from '../afs-log-modal/afs-log-modal.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfPageCountPipe } from '../../../core/pipes/pdf-page-count.pipe';
import { PDFDocument } from 'pdf-lib';
import { environment } from '../../../../environments/environment';
import { DigitizationModalComponent } from '../digitization-modal/digitization-modal.component';
import { FilterValues } from '../afs-filter/afs-filter.component';
import { FileService } from '../../../shared/dynamic-form/components/file/file.service';
import { HttpEventType } from '@angular/common/http';
export interface RawRow {
  ulb: string;
  ulbCode: string;
  cityName: string;
  formStatus: number;
  digitizeStatus: string;
  formUploadedOn: string;
  digitizedOn: string;
  afsexcelfiles: any;
  afsfiles: any;
  extraFiles?: any[];
  hasAFS?: boolean;

  position: number;
  city: string;
  stateId: string;
  stateName: string;
  populationCategory: string;
  year: string;
  docType: string;
  docTypeLabel: string;
  isAudited: 'audited' | 'unAudited';
  [key: string]: any;
}
@Component({
  selector: 'app-afs-table',
  imports: [
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    ToStorageUrlPipe,
    DatePipe,
    NgClass,
    AsyncPipe,
    PdfPageCountPipe,
  ],
  templateUrl: './afs-table.component.html',
  styleUrl: './afs-table.component.scss'
})
export class AfsTableComponent implements AfterViewInit {

  // readonly storageUrl = environment.STORAGE_BASEURL;
  readonly storageUrl = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com';
  readonly dialog = inject(MatDialog);
  readonly afsService = inject(AfsService);
  private fileService = inject(FileService);

  page = 1;
  limit = 10;
  pageSize = 10;
  totalCount = 0;

  filters = input.required<FilterValues>({});

  MASTER_FORM_STATUS: { [key: number]: string } = {
    [-1]: 'No Status',
    1: 'Not Started',
    2: 'In Progress',
    3: 'Under Review By State',
    4: 'Under Review By MoHUA',
    5: 'Returned By State',
    6: 'Submission Acknowledged By MoHUA',
    7: 'Returned By MoHUA',
    8: 'Verification Not Started',
    9: 'Verification In Progress',
    10: 'Returned by PMU',
    11: 'Submission Acknowledged by PMU',
  };

  dashboardCards = [
    {
      id: 1,
      icon: "bi bi-folder-check",
      label: "642",
      desc: "Files Digitized",
      class: "text-info",
    },
    {
      id: 2,
      icon: "bi bi-file-earmark-text",
      label: "4,550",
      desc: "Pages Digitized",
      class: "text-info",
    },
    {
      id: 3,
      icon: "bi bi-folder-x",
      label: "679",
      desc: "Files Failed",
      class: "text-danger",
    },
    {
      id: 4,
      icon: "bi bi-file-earmark-x",
      label: "679",
      desc: "Pages Failed",
      class: "text-danger",
    },
    {
      id: 5,
      icon: "bi bi-check-circle",
      label: "49%",
      desc: "Successful",
      class: "text-success",
    },
  ];


  docTypes = {
    bal_sheet: 'Balance Sheet',
    bal_sheet_schedules: 'Schedules To Balance Sheet',
    inc_exp: 'Income And Expenditure',
    inc_exp_schedules: 'Schedules To Income And Expenditure',
    cash_flow: 'Cash Flow Statement',
  }

  selection = new SelectionModel<RawRow>(true, []);

  isTableLoading: boolean = false;
  activeRow: any;
  // constructor(private afsService: AfsService,) { }

  // ngOnInit(): void {
  // this.getAfsList();
  // }

  // TODO: rename
  abc = effect(() => {
    // This effect runs initially and whenever this.quantity() changes
    this.getAfsList();
  })
  uploadFolderName: string = 'afs/uploads/';
  selectedRow: any;
  currentFile: any;

  handlePageEvent(event: any) {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getAfsList();
  }
  getAfsList(): void {
    this.isTableLoading = true;

    const params = {
      ...this.filters(),
      page: this.page,
      limit: this.pageSize,
      // ulb: this.filters().ulbId,
      // stateId: this.filters().stateId,
      // populationCategory: this.filters().populationCategory,
      // yearId: this.filters().yearId,
      // auditType: this.filters().auditType,
      // docType: this.filters().docType,
    };
    this.afsService.getAfsList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.totalCount = res.totalCount;
        this.isTableLoading = false;
      },
      error: (err) => {
        console.error('Failed to load AFS list:', err);
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: RawRow): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  dataSource = new MatTableDataSource<RawRow>([]);
  displayedColumns: string[] = [
    'select',
    'state',
    'city',
    'ulbUploadedPdf',
    'formStatus',
    'digitizeStatus',
    // 'populationCategory',
    // 'year',
    // 'docType',
    // 'auditStatus'
    'formUploadedOn',
    'digitizedOn',
    'requestIdLog',
  ];

  activeFilterSummary = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openLogDialog(requestId: string): void {
    // Implement dialog opening logic here
    // console.log('Open log dialog for Request ID:', requestId);
    const dialogRef = this.dialog.open(AfsLogModalComponent, { data: { requestId }, panelClass: 'col-8' });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });

  }

  setActiveRow(file: any) {
    this.activeRow = file;
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number = 0) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  uploadFileToS3() {
    // if (reset) return control.patchValue({ uploading: false, name: '', url: '' });
    if (!this.currentFile) return;
    const file = this.currentFile;

    // control.patchValue({ uploading: true });
    this.selectedRow.uploading = true;
    // this.progress = 20;
    this.uploadFolderName = `afs/uploads/${this.selectedRow.ulbCode}/`;
    this.fileService.newGetURLForFileUpload(file.name, file.type, this.uploadFolderName).subscribe({
      next: (s3Response: any) => {
        // if (this.s3Subscribe) {
        //   this.s3Subscribe.unsubscribe();
        // }
        const { url, path } = s3Response.data[0];
        // this.progress = 80;
        this.fileService.newUploadFileToS3(file, url).subscribe((res) => {
          if (res.type !== HttpEventType.Response) return;
          const formData = {
            pdfUrl: path,
            ulb: this.selectedRow.ulb,
            year: this.filters().yearId,
            auditType: this.filters().auditType,
            docType: this.filters().docType,
            uploadedBy: 'AFS',
          };
          this.afsService.uploadAfsFile(formData).subscribe((response) => {
            this.selectedRow.uploading = false;
            // this.progress = 100;
            const fileData: any = { name: file.name, url: path, size: this.formatBytes(file.size) };
          });


          // this.group.get('file')?.patchValue(fileData);
        });
      },
      error: (err) => console.log(err),
    });
    return;
  }



  async handleFileUpload(event: Event, row: RawRow) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input?.files?.[0];

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    this.currentFile = selectedFile;

    this.isTableLoading = true;

    this.selectedRow = row;

    this.uploadFolderName = 'afs/uploads/';

    this.uploadFileToS3();

    try {
      // Extract page count
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Build formData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('ulbId', row.ulb);
      formData.append('financialYear', row.year);
      formData.append('auditType', this.filters().auditType);

      const docTypeName = this.filters().docType;
      // const docTypeName =  this.filters.documentTypes
      //     .flatMap(group => group.items)
      //     .find(doc => doc.key === this.selectedDocType)?.name || '';
      formData.append('docType', docTypeName);

      // const url = `${environment.api.url}afs-digitization/afs-file`;
      // const response: any = await this.http.post(url, formData).toPromise();

      // this.afsService.uploadAfsFile(formData).subscribe(async (response) => {
      //   if (response.success && response.file?.fileUrl) {
      //     console.log('File uploaded successfully:', response);

      //     // === overwrite or insert file entry ===
      //     row.extraFiles = row.extraFiles || [];

      //     const existingIndex = row.extraFiles.findIndex(
      //       (ef: any) =>
      //         ef.docType?.trim().toLowerCase() ===
      //         (response.file.docType || docTypeName).trim().toLowerCase()
      //     );

      //     const newEntry = {
      //       docType: response.file.docType || docTypeName,
      //       fileName: this.updateFileName(selectedFile.name, 'AFS_UPLOADED'),
      //       fileUrl: response.file.fileUrl,
      //       uploadedAt: response.file.uploadedAt,
      //       pageCount
      //     };

      //     if (existingIndex >= 0) {
      //       row.extraFiles[existingIndex] = newEntry;
      //     } else {
      //       row.extraFiles.push(newEntry);
      //     }

      //     row.hasAFS = true;

      //     // ✅ Auto-refresh that ULB’s file info
      //     await this.refreshULBRow(row);
      //   } else {
      //     alert('Upload failed: ' + (response.message || 'Unknown error'));
      //   }
      // });


    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Upload failed. Please try again.');
    } finally {
      this.isTableLoading = false;
    }
  }

  private updateFileName(originalName: string, suffix: string): string {
    if (!originalName) return '';

    // Strip extension
    const parts = originalName.split('.');
    const ext = parts.length > 1 ? '.' + parts.pop() : '';
    const base = parts.join('.');

    // Always remove any old suffix (_ULB_UPLOADED / _AFS_UPLOADED)
    const cleanedBase = base.replace(/_(ULB_UPLOADED|AFS_UPLOADED)$/i, '');

    return `${cleanedBase}_${suffix}.pdf`;
  }

  async refreshULBRow(row: RawRow) {
    try {
      const financialYear = this.filters().yearId;
      const auditType = this.filters().auditType;
      const docTypeName = this.filters().docType;
      // const docTypeName =
      //  this.filters.documentTypes
      //   .flatMap(group => group.items)
      //   .find(doc => doc.key === this.selectedDocType)?.name || '';

      // const afsUrl = `http://localhost:8080/api/v1/afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
      // const afsUrl = `${environment.api.url}afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
      // const afsResponse: any = await this.http.get(afsUrl).toPromise();

      const params = { ulbId: row.ulb, financialYear, auditType, docType: docTypeName };
      const afsResponse: any = await this.afsService.getAfsFile(params).toPromise();

      const target = row;
      if (afsResponse.success && afsResponse.file?.fileUrl && target) {
        const afsFile = afsResponse.file;
        const fullUrl = afsFile.fileUrl;
        const pageCount = await this.getPdfPageCount(fullUrl);

        target.extraFiles = [
          {
            docType: afsFile.docType,
            fileName: this.updateFileName(afsFile.docType, 'AFS_UPLOADED'),
            fileUrl: afsFile.fileUrl,
            uploadedAt: afsFile.uploadedAt,
            pageCount
          }
        ];
      }
    } catch (error) {
      console.error('Error refreshing ULB row:', error);
    }
  }



  async getPdfPageCount(url: string): Promise<number> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      return pdfDoc.getPageCount();
    } catch (err) {
      console.error('Failed to load PDF for page count:', err);
      return 0;
    }
  }

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  triggerFileInput(file: any) {
    const identifier = file.cityName + file.ulbCode;
    const inputElement = this.fileInputs.find(ref => ref.nativeElement.getAttribute('data-id') === identifier);
    if (inputElement) {
      inputElement.nativeElement.click();
    }
  }

  // storageBaseUrl = environment.STORAGE_BASEURL;

  storageBaseUrl = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com';
  getFullExcelUrl(excel: any): string {
    return `${environment.STORAGE_BASEURL}${excel.fileUrl}`;
  }

  digitizeSelected() {
    const selectedRows = this.selection.selected;
    console.log('Digitize selected rows:', selectedRows);
    // Implement digitization logic here

    const dialogRef = this.dialog.open(DigitizationModalComponent, { data: { selectedRows } });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Dialog result: ${result}`);
    });
  }



  @Output() showSideBar = new EventEmitter<boolean>(false);
  applyFilter() {
    this.showSideBar.emit(true);
  }
}