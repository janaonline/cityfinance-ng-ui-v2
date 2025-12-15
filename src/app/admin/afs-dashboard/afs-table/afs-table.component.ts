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


interface Years {
  name: string;
  _id: string;
}


interface State {
  _id: string;
  name: string;
}

interface City {
  name: string;
  stateId: string;
  populationCategory: string;
}

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

  readonly dialog = inject(MatDialog);
  readonly afsService = inject(AfsService);

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

  getAfsList(): void {
    this.isTableLoading = true;
    this.afsService.getAfsList(this.filters()).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.isTableLoading = false;
      },
      error: (err) => {
        console.error('Failed to load AFS list:', err);
      }
    });
  }

  getStatusText(doc: any, index: number): string {
    let digitizedFiles = null;
    if (index === 0) {
      digitizedFiles =
        doc.afsexcelfiles?.files && doc.afsexcelfiles.files.length !== 0 ? doc.afsexcelfiles.files[0] : null;
    } else {
      digitizedFiles =
        doc.afsexcelfiles?.files && doc.afsexcelfiles.files.length === 2 ? doc.afsexcelfiles.files[1] : null;
    }
    const digitizedStatus = digitizedFiles
      ? digitizedFiles.fileUrl === 'https://placeholder-link.com/none'
        ? 'Failed'
        : 'Digitized'
      : 'Not-Digitized';

    return digitizedStatus;
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
  async handleFileUpload(event: Event, row: RawRow) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input?.files?.[0];

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    this.isTableLoading = true;

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

      this.afsService.uploadAfsFile(formData).subscribe(async (response) => {
        if (response.success && response.file?.fileUrl) {
          console.log('File uploaded successfully:', response);

          // === overwrite or insert file entry ===
          row.extraFiles = row.extraFiles || [];

          const existingIndex = row.extraFiles.findIndex(
            (ef: any) =>
              ef.docType?.trim().toLowerCase() ===
              (response.file.docType || docTypeName).trim().toLowerCase()
          );

          const newEntry = {
            docType: response.file.docType || docTypeName,
            fileName: this.updateFileName(selectedFile.name, 'AFS_UPLOADED'),
            fileUrl: response.file.fileUrl,
            uploadedAt: response.file.uploadedAt,
            pageCount
          };

          if (existingIndex >= 0) {
            row.extraFiles[existingIndex] = newEntry;
          } else {
            row.extraFiles.push(newEntry);
          }

          row.hasAFS = true;

          // ✅ Auto-refresh that ULB’s file info
          await this.refreshULBRow(row);
        } else {
          alert('Upload failed: ' + (response.message || 'Unknown error'));
        }
      });


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

  dashboardCards = [
    {
      id: 1,
      icon: "bi bi-people",
      label: "1,234",
      desc: "Active Users",
    },
    {
      id: 2,
      icon: "bi bi-star",
      label: "4.8",
      desc: "Average Rating",
    },
    {
      id: 3,
      icon: "bi bi-graph-up",
      label: "56%",
      desc: "Growth Rate",
    },
    {
      id: 4,
      icon: "bi bi-people",
      label: "1,234",
      desc: "Active Users",
    },
    {
      id: 5,
      icon: "bi bi-clock-history",
      label: "98.3%",
      desc: "Uptime",
    },
  ];

  @Output() showSideBar = new EventEmitter<boolean>(true);
  applyFilter() {
    this.showSideBar.emit(true);
  }
}