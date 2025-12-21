import { SelectionModel } from '@angular/cdk/collections';
import { AsyncPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { AfterViewInit, Component, effect, ElementRef, EventEmitter, inject, input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';
import { PdfPageCountPipe } from '../../../core/pipes/pdf-page-count.pipe';
import { ToStorageUrlPipe } from "../../../core/pipes/to-storage-url.pipe";
import { FileService } from '../../../shared/dynamic-form/components/file/file.service';
import { FilterValues } from '../afs-filter/afs-filter.component';
import { AfsLogModalComponent } from '../afs-log-modal/afs-log-modal.component';
import { AfsService } from '../afs.service';
import { DigitizationModalComponent } from '../digitization-modal/digitization-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

// raw row interface
// {
//       "_id": "630085be29ef916762354bdc",
//       "ulb": "5dd24729437ba31f7eb42f46",
//       "actionTakenByRole": "STATE",
//       "isActive": true,
//       "isDraft": false,
//       "status": "APPROVED",
//       "afsexcelfiles": {
//         "_id": "69453b74559acb711f5d2a8a",
//         "year": "606aadac4dff55e6c075c507",
//         "docType": "bal_sheet_schedules",
//         "auditType": "audited",
//         "ulb": "5dd24729437ba31f7eb42f46",
//         "__v": 0,
//         "afsFile": {
//           "overallConfidenceScore": 99.39,
//           "digitizationStatus": "digitized",
//           "uploadedBy": "AFS",
//           "pdfUrl": "/afs/uploads/UP001//c908edc2-1b41-47e9-9a1e-62bc827d80c1_85c57f12-04ae-4157-8143-7ecbfa6dc208.pdf",
//           "queue": {
//             "jobId": "125",
//             "status": "completed",
//             "progress": 100,
//             "attemptsMade": 0,
//             "createdAt": "2025-12-19T12:56:34.411Z"
//           },
//           "createdAt": "2025-12-19T12:56:34.411Z",
//           "excelUrl": "afs/5dd24729437ba31f7eb42f46_606aadac4dff55e6c075c507_audited_bal_sheet_schedules_de6426c1-1889-4fa0-880a-7bfc766b0cfe.xlsx",
//           "requestId": "req-20251219-124e6c"
//         },
//         "annualAccountsId": "69453b740e6f43fea9af30b5",
//         "ulbFile": {
//           "overallConfidenceScore": 98.67,
//           "digitizationStatus": "digitized",
//           "uploadedBy": "ULB",
//           "pdfUrl": "/objects/c908edc2-1b41-47e9-9a1e-62bc827d80c1.pdf",
//           "queue": {
//             "jobId": "124",
//             "status": "completed",
//             "progress": 100,
//             "attemptsMade": 0,
//             "createdAt": "2025-12-19T12:56:34.323Z"
//           },
//           "createdAt": "2025-12-19T12:56:34.324Z",
//           "excelUrl": "afs/5dd24729437ba31f7eb42f46_606aadac4dff55e6c075c507_audited_bal_sheet_schedules_71dc59f9-6ad5-4142-ab71-55f5a986d5b4.xlsx",
//           "requestId": "req-20251219-c21774"
//         }
//       },
//       "year": "606aadac4dff55e6c075c507",
//       "bal_sheet_schedules": {
//         "url": "/objects/c908edc2-1b41-47e9-9a1e-62bc827d80c1.pdf",
//         "name": "SCHEDULE 20-21.pdf"
//       },
//       "ulbPopulation": 1585704,
//       "ulbName": "Agra Municipal Corporation",
//       "ulbCode": "UP001",
//       "stateId": "5dcf9d7516a06aed41c748fe",
//       "stateName": "Uttar Pradesh",
//       "doctType": "Schedules To Balance Sheet",
//       "yearLabel": "2020-21"
//     },

export interface AfsFile {
  overallConfidenceScore?: number;
  digitizationStatus?: string;
  uploadedBy?: string;
  pdfUrl?: string;
  queue?: {
    jobId: string;
    status: string;
    progress: number;
    attemptsMade: number;
    createdAt: string;
  };
  createdAt?: string;
  excelUrl?: string;
  requestId?: string;
}

export interface Afsexcelfiles {
  _id: string;
  year: string;
  docType: string;
  auditType: string;
  ulb: string;
  __v: number;
  afsFile?: AfsFile;
  annualAccountsId: string;
  ulbFile?: AfsFile;
}

// export interface FilterValues {
//   stateId?: string;
//   ulbId?: string;
//   populationCategory?: string;
//   yearId?: string;
//   auditType?: string;
//   docType?: string;

// }
export interface RawRow {
  _id: string;
  ulb: string;
  ulbCode: string;
  // cityName: string;
  formStatus: number;
  digitizeStatus: string;
  formUploadedOn: string;
  digitizedOn: string;
  afsexcelfiles: Afsexcelfiles;
  position: number;
  // city: string;
  state: string;
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
    DecimalPipe,
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
  private _snackBar = inject(MatSnackBar);
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
    };
    this.afsService.getAfsList(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.totalCount = res.totalCount;
        this.isTableLoading = false;
      },
      error: (err) => {
        this.dataSource.data = [];
        console.error('Failed to load AFS list:', err);
        this._snackBar.open('Failed to load AFS list', 'Close', { duration: 5000 });
        this.isTableLoading = false;
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
    // 'digitizedFile',
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
            this.selectedRow.afsexcelfiles = response.data;
            this.isTableLoading = false;
            // this.progress = 100;
            // const fileData: any = { name: file.name, url: path, size: this.formatBytes(file.size) };
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

    // this.selectedRow.afsexcelfiles.afsFile = {
    //   "overallConfidenceScore": 99.39,
    //   "digitizationStatus": "digitized",
    //   "uploadedBy": "AFS",
    //   "pdfUrl": "/afs/uploads/UP001//c908edc2-1b41-47e9-9a1e-62bc827d80c1_85c57f12-04ae-4157-8143-7ecbfa6dc208.pdf",
    //   "queue": {
    //     "jobId": "125",
    //     "status": "completed",
    //     "progress": 100,
    //     "attemptsMade": 0,
    //     "createdAt": "2025-12-19T12:56:34.411Z"
    //   },
    //   "createdAt": "2025-12-19T12:56:34.411Z",
    //   "excelUrl": "afs/5dd24729437ba31f7eb42f46_606aadac4dff55e6c075c507_audited_bal_sheet_schedules_de6426c1-1889-4fa0-880a-7bfc766b0cfe.xlsx",
    //   "requestId": "req-20251219-124e6c"
    // };
    // this.isTableLoading = false;

    this.uploadFolderName = 'afs/uploads/';
    this.uploadFileToS3();


  }

  // private updateFileName(originalName: string, suffix: string): string {
  //   if (!originalName) return '';

  //   // Strip extension
  //   const parts = originalName.split('.');
  //   const ext = parts.length > 1 ? '.' + parts.pop() : '';
  //   const base = parts.join('.');

  //   // Always remove any old suffix (_ULB_UPLOADED / _AFS_UPLOADED)
  //   const cleanedBase = base.replace(/_(ULB_UPLOADED|AFS_UPLOADED)$/i, '');

  //   return `${cleanedBase}_${suffix}.pdf`;
  // }

  // async refreshULBRow(row: RawRow) {
  //   try {
  //     const financialYear = this.filters().yearId;
  //     const auditType = this.filters().auditType;
  //     const docTypeName = this.filters().docType;
  //     // const docTypeName =
  //     //  this.filters.documentTypes
  //     //   .flatMap(group => group.items)
  //     //   .find(doc => doc.key === this.selectedDocType)?.name || '';

  //     // const afsUrl = `http://localhost:8080/api/v1/afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
  //     // const afsUrl = `${environment.api.url}afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
  //     // const afsResponse: any = await this.http.get(afsUrl).toPromise();

  //     const params = { ulbId: row.ulb, financialYear, auditType, docType: docTypeName };
  //     const afsResponse: any = await this.afsService.getAfsFile(params).toPromise();

  //     const target = row;
  //     if (afsResponse.success && afsResponse.file?.fileUrl && target) {
  //       const afsFile = afsResponse.file;
  //       const fullUrl = afsFile.fileUrl;
  //       const pageCount = await this.getPdfPageCount(fullUrl);

  //       target.extraFiles = [
  //         {
  //           docType: afsFile.docType,
  //           fileName: this.updateFileName(afsFile.docType, 'AFS_UPLOADED'),
  //           fileUrl: afsFile.fileUrl,
  //           uploadedAt: afsFile.uploadedAt,
  //           pageCount
  //         }
  //       ];
  //     }
  //   } catch (error) {
  //     console.error('Error refreshing ULB row:', error);
  //   }
  // }



  // async getPdfPageCount(url: string): Promise<number> {
  //   try {
  //     const response = await fetch(url);
  //     const arrayBuffer = await response.arrayBuffer();
  //     const pdfDoc = await PDFDocument.load(arrayBuffer);
  //     return pdfDoc.getPageCount();
  //   } catch (err) {
  //     console.error('Failed to load PDF for page count:', err);
  //     return 0;
  //   }
  // }

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef<HTMLInputElement>>;

  triggerFileInput(file: any) {
    const identifier = file.ulbName + file.ulbCode;
    const inputElement = this.fileInputs.find(ref => ref.nativeElement.getAttribute('data-id') === identifier);
    if (inputElement) {
      inputElement.nativeElement.click();
    }
  }

  digitizeSelected() {
    const selectedRows = this.selection.selected;
    console.log('Digitize selected rows:', selectedRows);
    // Implement digitization logic here

    const dialogRef = this.dialog.open(DigitizationModalComponent, { data: { selectedRows } });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (const row of selectedRows) {
          const ulbFile = row[`${this.filters().docType}`]?.url;
          if (ulbFile) {
            if (!row.afsexcelfiles?.ulbFile) {
              row.afsexcelfiles = row.afsexcelfiles || {};
              row.afsexcelfiles.ulbFile = {
                digitizationStatus: 'queued',
              };
            }
            else {
              row.afsexcelfiles.ulbFile.digitizationStatus = 'queued';
            }
          }
          if (row.afsexcelfiles?.afsFile) {
            row.afsexcelfiles.afsFile.digitizationStatus = 'queued';
          }
        }
      }
      // console.log(`Dialog result: ${result}`);
    });
  }



  @Output() showSideBar = new EventEmitter<boolean>(false);
  applyFilter() {
    this.showSideBar.emit(true);
  }
}