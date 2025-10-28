import { Component, HostListener, OnInit } from '@angular/core';
// import { RouterModule } from '@angular/router';

import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ElementRef, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../src/environments/environment';

import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { IState } from '../../core/models/state/state';
import { IULB } from '../../core/models/ulb';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';


interface Years {
  name: string;
  _id: string;
}

@Component({
  standalone: true,
  selector: 'app-afs-dashboard',
  imports: [CommonModule, HttpClientModule, FormsModule, MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,

  ],
  templateUrl: './afs-dashboard.component.html',
  styleUrl: './afs-dashboard.component.scss'
})

export class AfsDashboardComponent implements OnInit {
  // username = localStorage.getItem('loggedInUser') || 'User';
  // fullName = localStorage.getItem('userFullName') || '';
  // email = localStorage.getItem('userEmail') || '';
  // role = localStorage.getItem('userRole') || '';
  // lastLoginTime = localStorage.getItem('lastLoginTime') || '';

  fullName = '';
  email = '';
  role = '';
  designation = '';
  lastLoginTime: string | null = null;
  
  showPopup = false;
  showMetricsPopup = false;
  showDatePopup = false;
  //userMetrics = { digitizedFiles: 0, digitizedPages: 0, failedFiles: 0 ,updatedAt: '' };
  globalMetrics = { digitizedFiles: 0, digitizedPages: 0, failedFiles: 0, updatedAt: '' };


  constructor(private router: Router, private http: HttpClient,) { }

  filters = {
    states: [] as IState[],
    populationCategories: [] as string[],
    allCities: [] as any[],

    cities: [] as any[],
    years: [] as Years[],
    // documentTypes: [] as { key: string, name: string }[]
    documentTypes: [] as {
      heading: string;
      items: { key: string; name: string }[];
    }[]

  };

  selectedState = '';
  selectedPopulation = '';
  selectedCities: string[] = [];
  selectedYear = '';
  selectedDocType = '';
  // isAudited = false;
  isAudited: string | null = null;
  isLoading = false;
  allFilteredFiles: any[] = []; // stores results from applyFilters()

  showCalendar = false;
  // digitizedStartDate: string = '';
  // digitizedEndDate: string = '';
  digitizedStartDate: Date | null = null;
  digitizedEndDate: Date | null = null;
  today = new Date();

  
 

 

  selectedDigitizeStatus: string = '';
filterByDigitizeStatus(): void {
  if (!this.selectedDigitizeStatus) {
    this.filteredFiles = [...this.allFilteredFiles];
    return;
  }
  this.digitizedStartDate = null;
    this.digitizedEndDate = null;
    this.showDatePopup = false;

    this.uploadedStartDate = null;
    this.uploadedEndDate = null;
    this.showUploadedDatePopup = false;


  this.filteredFiles = this.allFilteredFiles.filter(file => {
    const hasUlbExcel = file.excelFiles?.some((f: any) =>
      f.uploadedBy === 'ULB' && f.fileUrl && !f.fileUrl.includes('placeholder-link.com')
    );
    const hasUlbFailed = file.excelFiles?.some((f: any) =>
      f.uploadedBy === 'ULB' && f.fileUrl && f.fileUrl.includes('placeholder-link.com')
    );

    const hasAfsExcel = file.excelFiles?.some((f: any) =>
      f.uploadedBy === 'AFS' && f.fileUrl && !f.fileUrl.includes('placeholder-link.com')
    );
    const hasAfsFailed = file.excelFiles?.some((f: any) =>
      f.uploadedBy === 'AFS' && f.fileUrl && f.fileUrl.includes('placeholder-link.com')
    );

    let status = 'NOT DIGITIZED';
    if (hasUlbExcel || hasAfsExcel) {
      status = 'DIGITIZED';
    } else if (hasUlbFailed || hasAfsFailed) {
      status = 'FAILED';
    } else if (!file.excelFiles || file.excelFiles.length === 0) {
      status = 'NOT DIGITIZED';
    }

    return status === this.selectedDigitizeStatus;
  });
}

  openDatePopup() {
    this.showDatePopup = true;
  }

  closeDatePopup() {
    this.showDatePopup = false;
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  applyDateRange(): void {

    if (!this.digitizedStartDate || !this.digitizedEndDate) {
      alert("⚠️ Please select both start and end dates");
      return;
    }

    if (!this.isDateRangeValid()) {
      alert("⚠️ Start date cannot be after End date");
      return;
    }
     this. selectedDigitizeStatus = '';


    this.uploadedStartDate = null;
    this.uploadedEndDate = null;
    this.showUploadedDatePopup = false;
    this.showCalendar = false;
    this.showDatePopup = false;

    if (this.digitizedStartDate && this.digitizedEndDate) {
      console.log('📅 Selected range:', this.digitizedStartDate, 'to', this.digitizedEndDate);

      const start = new Date(this.digitizedStartDate);
      const end = new Date(this.digitizedEndDate);
      end.setHours(23, 59, 59, 999);

      const dateFiltered = this.allFilteredFiles.filter(file =>
        file.excelFiles?.some((excel: any) => {
          const uploaded = new Date(excel.uploadedAt);
          return uploaded >= start && uploaded <= end;
        })
      );

      //  keep only filtered results (no fallback)
      this.filteredFiles = dateFiltered;
    }
  }




  resetDateRange(): void {
    this.digitizedStartDate = null;
    this.digitizedEndDate = null;
    this.showCalendar = false;
    this.showDatePopup = false;
    console.log(' Date range cleared → showing all files');
    this.filteredFiles = [...this.allFilteredFiles];
  }

 

  // Disable selecting future dates
  disableFutureDates = (d: Date | null): boolean => {
    const date = d || new Date();
    return date <= this.today;
  };

  // Check if date range is valid
  isDateRangeValid(): boolean {
    if (!this.digitizedStartDate || !this.digitizedEndDate) return true;
    return this.digitizedStartDate <= this.digitizedEndDate;
  }

  // Variables for Uploaded Date picker
uploadedStartDate: Date | null = null;
uploadedEndDate: Date | null = null;
showUploadedDatePopup = false;

// Open/Close popup
openUploadedDatePopup() { this.showUploadedDatePopup = true; }
closeUploadedDatePopup() { this.showUploadedDatePopup = false; }

// Validate uploaded date range
isUploadedDateRangeValid(): boolean {
  if (!this.uploadedStartDate || !this.uploadedEndDate) return true;
  return this.uploadedStartDate <= this.uploadedEndDate;
}

// Apply date filter
applyUploadedDateRange(): void {
  if (!this.uploadedStartDate || !this.uploadedEndDate) return;
  if (!this.isUploadedDateRangeValid()) {
    alert("⚠️ Start date cannot be after End date");
    return;
  }

   this. selectedDigitizeStatus = '';


  

  this.digitizedStartDate = null;
  this.digitizedEndDate = null;
  this.showDatePopup = false;

  const start = new Date(this.uploadedStartDate);
  const end = new Date(this.uploadedEndDate);
  end.setHours(23, 59, 59, 999);

  // Filter based on ulbSubmit or uploadedAt
  this.filteredFiles = this.allFilteredFiles.filter(file => {
    const ulbDate = file.ulbSubmit ? new Date(file.ulbSubmit) : null;
    const afsDate = file.uploadedAt ? new Date(file.uploadedAt) : null;

    return (
      (ulbDate && ulbDate >= start && ulbDate <= end) ||
      (afsDate && afsDate >= start && afsDate <= end)
    );
  });

  this.showUploadedDatePopup = false;
}


// Reset date filter
resetUploadedDateRange(): void {
  this.uploadedStartDate = null;
  this.uploadedEndDate = null;
  this.filteredFiles = [...this.allFilteredFiles];
  this.showUploadedDatePopup = false;
}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // if click is NOT inside table, clear all highlights
    if (!target.closest('table.afs-table')) {
      this.activeRow = null;
    }
  }



  ngOnInit(): void {
    // const token = localStorage.getItem('token');
    // const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // if (!token || !isLoggedIn) {
    //   this.router.navigate(['/login']);
    //   return;
    // }
    this.getAFSMetrics();
    this.loadFilters();
    this.loadGlobalMetrics();

   const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.fullName = user.name || 'N/A';
      this.email = user.email || 'N/A';
      this.role = user.role || 'N/A';
      this.designation = user.designation || 'N/A';
      this.lastLoginTime = user.updatedAt || user.lastLoginTime || null;
    }

   
    // Load filters when component initializes
  }


  async loadGlobalMetrics() {
    try {
      const resp: any = await this.http
        .get(environment.api.url + 'afs-digitization/afs-metrics')
        .subscribe();

      if (resp.success) {
        this.globalMetrics = resp.global;
      }
    } catch (err) {
      console.error('Failed to load global metrics:', err);
    }
  }
  activeRow: any = null;

  setActiveRow(file: any) {
    this.activeRow = file;
  }



  loadFilters() {
    // const url = `http://localhost:8080/api/v1/afs-digitization/afs-filters`;
    const url = `${environment.api.url}afs-digitization/afs-filters`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) {
          this.filters.states = res.filters.states;
          this.filters.populationCategories = res.filters.populationCategories;
          this.filters.allCities = res.filters.cities; // Store full list
          this.filters.cities = res.filters.cities;     // Default: show all
          this.filters.years = res.filters.years;
          this.filters.documentTypes = res.filters.documentTypes;


          // if (this.filters.years.length > 0) {
          //   this.selectedYear = this.filters.years[0].name;
          // }
        }
      },
      error: (err) => {
        console.error('Failed to load filters:', err);
      }
    });
  }

  filtersApplied = false;

  //filteredFiles: { name: string; url: string }[] = [];
  filteredFiles: {
    [x: string]: any;
    stateName: string;
    cityName: string;
    ulbCode: string;
    fileName: string;
    fileUrl: string;
    statusText?: string;
    ulbSubmit?: string;
    uploadedAt?: string;
    localFile?: File;
    previewUrl?: string;
    pageCount?: number;
    selected?: boolean;
    docType?: string;
     extraFiles?: { fileName: string; fileUrl: string; docType?: string; pageCount?: number; previewUrl?: string; originalFile?: File; uploadedAt?: string }[];
    excelFiles?: { _id: string; s3Key: string; fileUrl: string; requestId: string; uploadedAt: string; uploadedBy: string; digitizedAt?: string; }[];

  }[] = [];

  hasExcelFile(file: any, uploadedBy: string): boolean {
  return !!file.excelFiles?.some(
    (f: any) =>
      f.uploadedBy === uploadedBy &&
      f.fileUrl &&
      !f.fileUrl.includes('placeholder-link.com')
  );
}

hasFailedExcelFile(file: any, uploadedBy: string): boolean {
  return !!file.excelFiles?.some(
    (f: any) =>
      f.uploadedBy === uploadedBy &&
      f.fileUrl &&
      f.fileUrl.includes('placeholder-link.com')
  );
}


  getExcelFiles(file: any, uploadedBy: string) {
    return (
      file.excelFiles?.filter(
        (f: any) =>
          f.uploadedBy === uploadedBy &&
          f.fileUrl &&
          !f.fileUrl.includes('placeholder-link.com')
      ) || []
    );
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



  // async handleFileUpload(event: any, file: any) {
  //   const selectedFile = event.target.files[0];

  //   if (!selectedFile || selectedFile.type !== 'application/pdf') {
  //     alert('Please upload a valid PDF file.');
  //     return;
  //   }

  //   file.localFile = selectedFile;
  //   file.previewUrl = URL.createObjectURL(selectedFile);
  //   // file.fileName = selectedFile.name;
  //    file.fileName = this.updateFileName(selectedFile.name, 'AFS_UPLOADED');

  //   // Extract page count from local file
  //   const arrayBuffer = await selectedFile.arrayBuffer();
  //   const pdfDoc = await PDFDocument.load(arrayBuffer);
  async handleFileUpload(event: Event, file: any) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input?.files?.[0];

    if (!selectedFile || selectedFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }

    this.isLoading = true;

    try {
      // Extract page count
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      // Build formData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('ulbId', file.ulbId);
      formData.append('financialYear', this.selectedYear);
      formData.append('auditType', this.isAudited ? 'audited' : 'unAudited');

      const docTypeName =
        this.filters.documentTypes
          .flatMap(group => group.items)
          .find(doc => doc.key === this.selectedDocType)?.name || '';
      formData.append('docType', docTypeName);

      // const url = `http://localhost:8080/api/v1/afs-digitization/afs-file`;
      const url = `${environment.api.url}afs-digitization/afs-file`;
      const response: any = await this.http.post(url, formData).toPromise();

      if (response.success && response.file?.fileUrl) {
        console.log('File uploaded successfully:', response);

        // === overwrite or insert file entry ===
        file.extraFiles = file.extraFiles || [];

        const existingIndex = file.extraFiles.findIndex(
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
          file.extraFiles[existingIndex] = newEntry;
        } else {
          file.extraFiles.push(newEntry);
        }

        file.hasAFS = true;

        // ✅ Auto-refresh that ULB’s file info
        await this.refreshULBRow(file.ulbId);
      } else {
        alert('Upload failed: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Upload failed. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  async refreshULBRow(ulbId: string) {
    try {
      const financialYear = this.selectedYear;
      const auditType = this.isAudited ? 'audited' : 'unAudited';

      const docTypeName =
        this.filters.documentTypes
          .flatMap(group => group.items)
          .find(doc => doc.key === this.selectedDocType)?.name || '';

      // const afsUrl = `http://localhost:8080/api/v1/afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
      const afsUrl = `${environment.api.url}afs-digitization/afs-file?ulbId=${ulbId}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(docTypeName)}`;
      const afsResponse: any = await this.http.get(afsUrl).toPromise();

      const target = this.filteredFiles.find(f => f['ulbId'] === ulbId);
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

storageBaseUrl =  'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com'



getFullExcelUrl(excel: any): string {
  return `${environment.STORAGE_BASEURL}${excel.fileUrl}`;
}



  //for loading cities based on state
  // applyFilters() {
  //   this.filtersApplied = true;
  //   this.filteredFiles = [];

  //   const baseUrl = 'http://localhost:8080/api/v1/ledger/ulb-financial-data/files';
  //   const financialYear = this.selectedYear;
  //   const auditType = this.isAudited ? 'audited' : 'unAudited';

  //   //const selectedDocName = this.filters.documentTypes.find(d => d.key === this.selectedDocType)?.name || '';
  //   const selectedDocName =
  //   this.filters.documentTypes
  //     .flatMap(group => group.items)
  //     .find(doc => doc.key === this.selectedDocType)?.name || '';


  //   const requests = this.selectedCities.map(cityName => {
  //     const city = this.filters.allCities.find(c => c.name === cityName);
  //     if (!city) return of([]); // if city not found, skip it

  //     const stateName = this.filters.states.find(s => s._id === city.stateId)?.name || '';

  //     const url = `${baseUrl}/${city._id}?financialYear=${financialYear}&auditType=${auditType}`;

  //     return this.http.get<any>(url).pipe(
  //       map(res => {
  //         const matchedPdfs = (res.success && res.data.pdf)
  //           ? res.data.pdf.filter((file: any) => file.name?.trim() === selectedDocName?.trim())
  //           : [];

  //         if (!matchedPdfs || matchedPdfs.length === 0) {
  //           // return fallback row
  //           return [{
  //             stateName,
  //             cityName: city.name,
  //             ulbCode: city.code || '',
  //             fileName: 'No data available',
  //             fileUrl: ''
  //           }];
  //         }

  //         // return real files
  //         return matchedPdfs.map((file: any) => ({
  //           stateName,
  //           cityName: city.name,
  //           ulbCode: city.code || '',
  //           fileName: file.name,
  //           fileUrl: file.url,
  //           timestamp: res.timestamp


  //         }));
  //       }),
  //       catchError(err => {
  //         // also return fallback row if API fails
  //         return of([{
  //           stateName,
  //           cityName: city.name,
  //           ulbCode: city.code || '',
  //           fileName: 'Error loading data',
  //           fileUrl: ''
  //         }]);
  //       })
  //     );
  //   });

  //   forkJoin(requests).subscribe((results: any[]) => {
  //     this.filteredFiles = results.flat()
  //     .filter(file => file.fileName !== 'No data available' && file.fileName !== 'Error loading data');

  //     this.filteredFiles.forEach(file => {
  //   if (file.fileUrl) {
  //     const fullUrl = this.storageBaseUrl + file.fileUrl;
  //     this.getPdfPageCount(fullUrl).then(pageCount => {
  //       file.pageCount = pageCount;
  //     });
  //   }
  // });
  // });
  // }



  applyFilters() {

    if (!this.selectedState) {
      alert("⚠️ Please select a state");   // simple browser popup
      return;
    }
    if (!this.selectedPopulation) {
      alert("⚠️ Please select a population category");   // simple browser popup
      return;
    }
    if (!this.selectedYear) {
      alert("⚠️ Please select a year");   // simple browser popup
      return;
    }
    if (!this.selectedDocType) {
      alert("⚠️ Please select Document type");   // simple browser popup
      return;
    }
    if (this.selectedDocType !== '16th_fc' && !this.isAudited) {
      alert("⚠️ Please select Audit Status");
      return;
    }
    this.filtersApplied = true;
    this.filteredFiles = [];
    this.isLoading = true;   // 👈 start loader
    this.loadGlobalMetrics();

    this.selectedFilesCount = 0;
    this.totalSelectedPages = 0;
    this.selectAll = false;
    this.selectedDigitizeStatus = '';

    // const baseUrl = 'http://localhost:8080/api/v1/ledger/ulb-financial-data/files';
    // const statusUrlBase = 'http://localhost:8080/api/v1/afs-digitization/afs-form-status-by-ulb';
    // const afsUrlBase = 'http://localhost:8080/api/v1/afs-digitization/afs-file';
    // const excelUrlBase = 'http://localhost:8080/api/v1/afs-digitization/afs-excel-file';

    const baseUrl = environment.api.url +'ledger/ulb-financial-data/files';
    const statusUrlBase = environment.api.url +'afs-digitization/afs-form-status-by-ulb';
    const afsUrlBase = environment.api.url +'afs-digitization/afs-file';
    const excelUrlBase = environment.api.url +'afs-digitization/afs-excel-file';

    const financialYear = this.selectedYear;
    const auditType = this.isAudited;

    const selectedDocName =
      this.filters.documentTypes
        .flatMap(group => group.items)
        .find(doc => doc.key === this.selectedDocType)?.name || '';

    const requests = this.selectedCities.map(cityName => {
      const city = this.filters.allCities.find(c => c.name === cityName);
      if (!city) return of([]);

      const stateName = this.filters.states.find(s => s._id === city.stateId)?.name || '';

      const fileUrl = `${baseUrl}/${city._id}?financialYear=${financialYear}&auditType=${auditType}`;
      const statusUrl = `${statusUrlBase}/${city._id}?financialYear=${financialYear}&auditType=${auditType}`;
      const afsUrl = `${afsUrlBase}?ulbId=${city._id}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(selectedDocName)}`;
      const excelUrl = `${excelUrlBase}?ulbId=${city._id}&financialYear=${financialYear}&auditType=${auditType}&docType=${encodeURIComponent(selectedDocName)}`;

      return forkJoin({
        files: this.http.get<any>(fileUrl).pipe(catchError(() => of(null))),
        status: this.http.get<any>(statusUrl).pipe(catchError(() => of(null))),
        afs: this.http.get<any>(afsUrl).pipe(catchError(() => of(null))),
        excel: this.http.get<any>(excelUrl).pipe(catchError(() => of(null)))
      }).pipe(
        map(({ files, status, afs, excel }) => {
          const matchedPdfs = (files?.success && files.data?.pdf)
            ? files.data.pdf.filter((f: any) => f.name?.trim() === selectedDocName?.trim())
            : [];

          const statusText = status?.data?.statusText || 'No Status';
          const ulbSubmit = status?.data?.ulbSubmit || null;

          if (!matchedPdfs || matchedPdfs.length === 0) {
            return [{
              stateName,
              cityName: city.name,
              ulbCode: city.code || '',
              ulbId: city._id,
              fileName: 'No data available',
              fileUrl: '',
              statusText,
              ulbSubmit,
              excelFiles: excel?.fileGroup?.files || []
            }];
          }

          const rows = matchedPdfs.map((file: any) => ({
            docType: this.selectedDocType,
            stateName,
            cityName: city.name,
            ulbCode: city.code || '',
            ulbId: city._id,
            fileName: this.updateFileName(file.name, 'ULB_UPLOADED'),
            fileUrl: file.url,
            timestamp: files.timestamp,
            statusText,
            ulbSubmit,
            extraFiles: [] as any[],
            excelFiles: (excel?.fileGroup?.files || []).map((f: any) => ({
              _id: f._id,
              s3Key: f.s3Key,
              fileUrl: f.fileUrl,
              requestId: f.requestId,   // 👈 add requestId
              uploadedAt: f.uploadedAt,
              uploadedBy: f.uploadedBy
            }))
          }));

          if (afs?.success && afs.file?.fileUrl) {
            rows.forEach((r: any) => {
              r.extraFiles.push({
                fileName: this.updateFileName(afs.file.docType || 'afs.pdf', 'AFS_UPLOADED'),
                fileUrl: afs.file.fileUrl,
                uploadedAt: afs.file.uploadedAt
              });
              r.uploadedAt = afs.file.uploadedAt;
            });
          }

          return rows;
        })
      );
    });

     forkJoin(requests).subscribe({
      next: async (results: any[]) => {
        let mergedFiles = results.flat()
          .filter((file: any) => file.fileName !== 'No data available' && file.fileName !== 'Error loading data');
        mergedFiles = await this.fetchDigitizedTimestamps(mergedFiles);
        this.allFilteredFiles = mergedFiles;   // backup copy
        this.filteredFiles = [...mergedFiles]; // working copy for display


        this.filteredFiles = mergedFiles;




        this.filteredFiles.forEach(file => {
          if (file.fileUrl) {
            const fullUrl = this.storageBaseUrl + file.fileUrl;
            this.getPdfPageCount(fullUrl).then(pageCount => {
              file.pageCount = pageCount;
            });
          }

          if (file.extraFiles?.length) {
            file.extraFiles.forEach((ef: any) => {
              const fullUrl = ef.fileUrl;
              this.getPdfPageCount(fullUrl).then(pageCount => {
                ef.pageCount = pageCount;
              });
            });
          }
        });
      },
      error: (err) => {
        console.error('Error fetching data:', err);
      },
      complete: () => {
        this.isLoading = false;   // 👈 stop loader
      }
    });
  }




  resetFilters() {
    this.selectedState = '';
    this.stateSearchText = '';
    this.stateDropdownOpen = false;
    this.selectedPopulation = '';
    this.selectedCities = [];
    this.selectedYear = '';
    this.selectedDocType = '';
    this.isAudited = null;

    this.digitizedStartDate = null;
    this.digitizedEndDate = null;
    this.uploadedStartDate = null;
    this.uploadedEndDate = null;
    // this.filteredFiles = [];
    // this.allFilteredFiles = [];
    this.filtersApplied = false;
  }


  toggleCitySelection(city: string, isChecked: boolean) {
    if (isChecked) {
      if (!this.selectedCities.includes(city)) {
        this.selectedCities.push(city);
      }
    } else {
      this.selectedCities = this.selectedCities.filter(c => c !== city);
    }
  }
  onPopulationCategoryChange() {
    if (this.selectedPopulation === 'All') {
      this.filters.cities = this.filters.allCities;
    } else {
      this.filters.cities = this.filters.allCities.filter(
        city => city.populationCategory === this.selectedPopulation
      );
    }

    // Optionally reset selectedCities if they are not part of the filtered list
    this.selectedCities = this.selectedCities.filter(city =>
      this.filters.cities.some(c => c.name === city)
    );
  }


  tableData: any[] = []; // your full table data

  sortByCity(order: 'asc' | 'desc') {
    this.filteredFiles.sort((a, b) => {
      const cityA = a.cityName?.toLowerCase() || '';
      const cityB = b.cityName?.toLowerCase() || '';

      if (order === 'asc') {
        return cityA.localeCompare(cityB);
      } else {
        return cityB.localeCompare(cityA);
      }
    });
  }

  sortByULBCode(order: 'asc' | 'desc') {
    this.filteredFiles.sort((a, b) => {
      const codeA = a.ulbCode?.toLowerCase() || '';
      const codeB = b.ulbCode?.toLowerCase() || '';

      if (order === 'asc') {
        return codeA.localeCompare(codeB);
      } else {
        return codeB.localeCompare(codeA);
      }
    });
  }



  onPopulationOrStateChange() {
    const selectedState = this.selectedState;
    const selectedPop = this.selectedPopulation;

    // Filter all cities of the selected state
    const stateCities = this.filters.allCities.filter(city =>
      !selectedState || city.stateId === selectedState
    );

    // Cities that match both state and population category
    const matchingCities = selectedPop === 'All'
      ? stateCities
      : stateCities.filter(city => city.populationCategory === selectedPop);

    // Cities from the state that do NOT match the selected population category
    const nonMatchingCities = selectedPop === 'All'
      ? []
      : stateCities.filter(city => city.populationCategory !== selectedPop);

    // Merge: matching cities (checked) first, then non-matching (unchecked)
    this.filters.cities = [...matchingCities, ...nonMatchingCities];

    // Update selectedCities with matching ones only (autocheck them)
    this.selectedCities = matchingCities.map(c => c.name);
  }

  //for loading cities based on state
  // onPopulationOrStateChange() {
  //   const selectedPop = this.selectedPopulation;

  //   const matchingCities = selectedPop === 'All' 
  //     ? this.filters.allCities 
  //     : this.filters.allCities.filter(city => city.populationCategory === selectedPop);

  //   const nonMatchingCities = selectedPop === 'All'
  //     ? []
  //     : this.filters.allCities.filter(city => city.populationCategory !== selectedPop);

  //   this.filters.cities = [...matchingCities, ...nonMatchingCities];
  //   this.selectedCities = matchingCities.map(c => c.name);
  // }


  citySearchText = '';

  get filteredCities() {
    let cities = this.filters.cities;

    // Apply search text filtering
    if (this.citySearchText.trim()) {
      const search = this.citySearchText.toLowerCase();
      cities = cities.filter(city =>
        city.name.toLowerCase().includes(search)
      );
    }

    // Sort: selected cities first, then others
    return [...cities].sort((a, b) => {
      const aSelected = this.selectedCities.includes(a.name);
      const bSelected = this.selectedCities.includes(b.name);
      return (aSelected === bSelected) ? 0 : (aSelected ? -1 : 1);
    });
  }



  stateSearchText = '';
  stateDropdownOpen = false;

  get filteredStates() {
    if (!this.stateSearchText.trim()) {
      return this.filters.states;
    }

    const search = this.stateSearchText.toLowerCase();
    return this.filters.states.filter(state =>
      state.name.toLowerCase().includes(search)
    );
  }
  selectState(state: any) {
    this.selectedState = state._id;
    this.stateSearchText = state.name; // display selected name
    this.onPopulationOrStateChange();
    this.stateDropdownOpen = false;


    //for loading cities based on state
    // Call backend again to load cities for selected state
    // const url = `http://localhost:8080/api/v1/afs-digitization/afs-filters?stateId=${this.selectedState}`;
    // this.http.get<any>(url).subscribe({
    //   next: (res) => {
    //     if (res.success) {
    //       this.filters.cities = res.filters.cities;
    //       this.filters.allCities = res.filters.cities; // update master list
    //       this.filters.populationCategories = res.filters.populationCategories;
    //       this.onPopulationOrStateChange();
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Failed to load state-specific cities:', err);
    //   }
    // });

  }




  togglePopup() {
    this.showPopup = !this.showPopup;
  }
  toggleMetricsPopup() {
    this.showMetricsPopup = !this.showMetricsPopup;
  }

  //   getUserSuccessRate(): number {
  //   const total = this.userMetrics.digitizedFiles + this.userMetrics.failedFiles;
  //   if (total === 0) return 0;
  //   return Math.round((this.userMetrics.digitizedFiles / total) * 100);
  // }

  getGlobalSuccessRate(): number {
    const total = this.globalMetrics.digitizedFiles + this.globalMetrics.failedFiles;
    if (total === 0) return 0;
    return Math.round((this.globalMetrics.digitizedFiles / total) * 100);
  }

logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  onDocTypeChange(selectedKey: string) {
    this.selectedDocType = selectedKey;

    // Auto-check "Audited" if selected document is 16th_fc
    if (selectedKey === '16th_fc') {
      this.isAudited = 'audited';   // 👈 force audited
    } else {
      this.isAudited = null;        // 👈 clear so user must select
    }
  }


  getAFSMetrics() {
    // const url = `http://localhost:8080/api/v1/afs-digitization/afs-metrics`;
    const url = `${environment.api.url}afs-digitization/afs-metrics`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success) {
          //this.userMetrics = res.user;
          this.globalMetrics = res.global;
        }
      },
      error: (err) => {
        console.error('Error fetching metrics:', err);
      }
    });
  }

  downloadExcel() {
    const STORAGE_BASEURL = 'https://jana-cityfinance-live.s3.ap-south-1.amazonaws.com';
    const PLACEHOLDER_URL = 'https://placeholder-link.com/none';
    

    const exportData: any[] = this.filteredFiles.map(file => {
      const ulbFile = file.excelFiles?.find((f: any) => f.uploadedBy === 'ULB');
      const afsFile = file.excelFiles?.find((f: any) => f.uploadedBy === 'AFS');

      // 🔹 AFS uploaded PDF (from extraFiles)
      const afsUploadedPdf = (file.extraFiles && file.extraFiles.length > 0)
        ? file.extraFiles.find((f: any) => f.fileUrl)?.fileUrl
        : null;

      // --- Determine digitization status (skip placeholders) ---
      const ulbStatus = ulbFile
        ? (ulbFile.fileUrl && ulbFile.fileUrl !== PLACEHOLDER_URL ? 'DIGITIZED' : 'FAILED')
        : 'NOT DIGITIZED';

      const afsStatus = afsFile
        ? (afsFile.fileUrl && afsFile.fileUrl !== PLACEHOLDER_URL ? 'DIGITIZED' : 'FAILED')
        : 'NOT DIGITIZED';

      // --- Handle timestamps safely ---
      const ulbDigitizedOn =
        ulbFile && ulbFile.fileUrl && ulbFile.fileUrl !== PLACEHOLDER_URL
          ? new Date(ulbFile.uploadedAt).toLocaleString()
          : 'N/A';

      const afsDigitizedOn =
        afsFile && afsFile.fileUrl && afsFile.fileUrl !== PLACEHOLDER_URL
          ? new Date(afsFile.uploadedAt).toLocaleString()
          : 'N/A';
      const auditStatus = String(this.isAudited).toLowerCase() === 'audited'
        ? 'Audited'
        : 'UnAudited';

      return {
        State: file.stateName,
        City: file.cityName,
        'ULB Code': file.ulbCode,
        Year: this.selectedYear || 'N/A',
        AuditStatus: auditStatus,


        'PDF Document ulb uploaded':
          file.fileUrl && file.fileUrl !== PLACEHOLDER_URL
            ? `${STORAGE_BASEURL}${file.fileUrl.startsWith('/') ? '' : '/'}${file.fileUrl}`
            : 'N/A',
        'PDF Document afs uploaded': afsUploadedPdf || 'N/A',

        // --- ULB details ---
        'Form Uploaded On': file.ulbSubmit ? new Date(file.ulbSubmit).toLocaleString() : 'Not Submitted',
        'ULB Digitize Status': ulbStatus,
        'ULB Excel Link': ulbFile?.fileUrl && ulbFile.fileUrl !== PLACEHOLDER_URL ? `${environment.STORAGE_BASEURL}/${ulbFile.fileUrl}` : 'N/A',
        'ULB Digitized On': ulbDigitizedOn,
        'ULB Request ID': ulbFile?.requestId || 'N/A',

        // --- AFS details ---
        'AFS Digitize Status': afsStatus,
        'AFS Excel Link': afsFile?.fileUrl && afsFile.fileUrl !== PLACEHOLDER_URL ? `${environment.STORAGE_BASEURL}/${afsFile.fileUrl}` : 'N/A',
        'AFS Digitized On': afsDigitizedOn,
        'AFS Request ID': afsFile?.requestId || 'N/A',

        // 'Page Count': file.pageCount || 'N/A',
        // _afsUploadedUrl: afsUploadedPdf,
      };
    });

    // ✅ Generate Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const headers = Object.keys(exportData[0] || {});
    const ulbPdfCol = headers.indexOf('PDF Document ulb uploaded') + 1;
    const afsPdfCol = headers.indexOf('PDF Document afs uploaded') + 1;
    const ulbCol = headers.indexOf('ULB Digitize Status') + 1;
    const afsCol = headers.indexOf('AFS Digitize Status') + 1;

    exportData.forEach((row, rowIndex) => {
      const excelRow = rowIndex + 2;
      const file = this.filteredFiles[rowIndex];

      // 🔹 ULB PDF hyperlink
      if (file.fileUrl) {
        const pdfUrl = file.fileUrl.startsWith('http')
          ? file.fileUrl
          : `${STORAGE_BASEURL}${file.fileUrl.startsWith('/') ? '' : '/'}${file.fileUrl}`;
        const pdfColLetter = XLSX.utils.encode_col(ulbPdfCol - 1);
        ws[`${pdfColLetter}${excelRow}`] = {
          t: 's',
          f: `HYPERLINK("${pdfUrl}", "${row['PDF Document ulb uploaded']}")`
        };
      }

      // 🔹 AFS PDF hyperlink
      if (row._afsUploadedUrl) {
        const afsUrl = row._afsUploadedUrl.startsWith('http')
          ? row._afsUploadedUrl
          : `${STORAGE_BASEURL}${row._afsUploadedUrl.startsWith('/') ? '' : '/'}${row._afsUploadedUrl}`;
        const afsPdfColLetter = XLSX.utils.encode_col(afsPdfCol - 1);
        ws[`${afsPdfColLetter}${excelRow}`] = {
          t: 's',
          f: `HYPERLINK("${afsUrl}", "${row['PDF Document afs uploaded']}")`
        };
      }

      // 🔹 ULB Excel hyperlink (only if valid)
      const ulbFile = file.excelFiles?.find((f: any) => f.uploadedBy === 'ULB');
      if (ulbFile?.fileUrl && ulbFile.fileUrl !== PLACEHOLDER_URL) {
        const colLetter = XLSX.utils.encode_col(ulbCol - 1);
        ws[`${colLetter}${excelRow}`] = {
          t: 's',
          f: `HYPERLINK("${ulbFile.fileUrl}", "DIGITIZED")`
        };
      }

      // 🔹 AFS Excel hyperlink (only if valid)
      const afsFile = file.excelFiles?.find((f: any) => f.uploadedBy === 'AFS');
      if (afsFile?.fileUrl && afsFile.fileUrl !== PLACEHOLDER_URL) {
        const colLetter = XLSX.utils.encode_col(afsCol - 1);
        ws[`${colLetter}${excelRow}`] = {
          t: 's',
          f: `HYPERLINK("${afsFile.fileUrl}", "DIGITIZED")`
        };
      }
    });

    // Auto column widths
    const colWidths = headers.map(key => ({
      wch: Math.max(key.length, ...exportData.map(r => String(r[key] || '').length)) + 2
    }));
    ws['!cols'] = colWidths;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Files');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    saveAs(data, `AvailableFiles_${new Date().toISOString().split('T')[0]}.xlsx`);
  }


  selectAll = false;
  selectedFilesCount = 0;
  totalSelectedPages = 0;

  updateSelection() {
    const selectedFiles = this.filteredFiles.filter(f => f.selected);

    let fileCount = 0;
    let pageCount = 0;

    selectedFiles.forEach(f => {
      // count main file
      if (f.pageCount) {
        pageCount += f.pageCount;
        fileCount += 1;
      }

      // count extra uploaded files
      if (f.extraFiles?.length) {
        f.extraFiles.forEach((ef: any) => {
          if (ef.pageCount) {
            pageCount += ef.pageCount;
            fileCount += 1;
          }
        });
      }
    });

    this.selectedFilesCount = fileCount;
    this.totalSelectedPages = pageCount;

    // Update "select all" state
    this.selectAll = selectedFiles.length === this.filteredFiles.length;
  }


  toggleSelectAll() {
    this.filteredFiles.forEach(f => (f.selected = this.selectAll));
    this.updateSelection();

    this.activeRow = null;
  }


  showDigitizePopup = false;
  digitizeStatus: string = '';
   digitizePopupMessage: string = '';
   
  openDigitizePopup() {
    this.showDigitizePopup = true;
    this.digitizeStatus = '';

    const PLACEHOLDER_URL = 'https://placeholder-link.com/none';
    let alreadyDigitizedFiles = 0;
    let alreadyDigitizedPages = 0;

    for (const f of this.filteredFiles.filter(f => f.selected)) {
      // filter out placeholder excel files
      const validExcelFiles = (f.excelFiles || []).filter(
        (ef: any) => ef.fileUrl && ef.fileUrl !== PLACEHOLDER_URL
      );

      if (validExcelFiles.length > 0) {
        alreadyDigitizedFiles += validExcelFiles.length;

        // sum up page counts from the main file
        if (f.pageCount) alreadyDigitizedPages += f.pageCount;

        // and from extra files (AFS PDFs etc.)
        if (f.extraFiles?.length) {
          for (const ef of f.extraFiles) {
            if (ef.pageCount) alreadyDigitizedPages += ef.pageCount;
          }
        }
      }
    }

    // --- build message ---
    if (alreadyDigitizedFiles > 0) {
      this.digitizePopupMessage = `Are you sure to digitize the selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files along with ${alreadyDigitizedFiles} already digitized PDFs with ${alreadyDigitizedPages} pages?`;
    } else {
      this.digitizePopupMessage = `You have selected ${this.totalSelectedPages} pages from ${this.selectedFilesCount} PDF files to digitize.`;
    }
  }


  closeDigitizePopup() {
    this.showDigitizePopup = false;
    this.digitizeStatus = '';
  }

  
  private async fetchPdfAsBlob(url: string): Promise<Blob> {
    if (!url) {
      throw new Error("Invalid file URL");
    }

    let fullUrl = url.trim();

    //  Fix malformed URLs like "https//"
    if (fullUrl.startsWith("https//")) {
      fullUrl = fullUrl.replace("https//", "https://");
    }

    //  Only prefix storageBaseUrl if the URL is relative (starts with "/")
    if (fullUrl.startsWith("/")) {
      fullUrl = this.storageBaseUrl + fullUrl;
    }

    console.log(" Fetching PDF from:", fullUrl);

    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  }



  private async fetchExcelAsBlob(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch Excel: ${response.status}`);
    return await response.blob();
  }


private normalizePdfUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let fullUrl = rawUrl.trim();
    if (fullUrl.startsWith('https//')) {
      fullUrl = fullUrl.replace('https//', 'https://');
    }
    if (fullUrl.startsWith('/')) {
      fullUrl = this.storageBaseUrl + fullUrl;
    }
    return fullUrl;
  }

 
 async proceedDigitization() {
    if (this.selectedFilesCount === 0) return;

    this.digitizeStatus = 'processing';

    for (const fileRow of this.filteredFiles.filter(f => f.selected)) {
      try {
        const excelLinks: any[] = [];

        // Combine ULB + AFS PDFs
        const pdfFiles = [fileRow, ...(fileRow.extraFiles || [])];

        for (const pdf of pdfFiles) {
          if (!pdf.fileUrl && !pdf.previewUrl && !pdf.originalFile) continue;

          const formData = new FormData();

          // Prepare file blob
          if (pdf.originalFile) {
            formData.append("file", pdf.originalFile, pdf.originalFile.name);
          } else {
            const blob = await this.fetchPdfAsBlob(pdf.fileUrl || pdf.previewUrl || '');
            formData.append("file", blob, "document.pdf");
          }

          const sourceType = pdf === fileRow ? 'ULB' : 'AFS';
          formData.append("Document_type_ID", fileRow.docType || "bal_sheet");

          let digitizeResp: any;
          try {
            // digitizeResp = await this.http.post(
            //   "http://3.109.105.81/AFS_Digitization",
            //   formData
            // ).toPromise();
            digitizeResp = await this.http.post(
              environment.api.url3 + "digitization/AFS_Digitization",
              formData
            ).toPromise();
          } catch (error: any) {
            digitizeResp = error?.error || {};
            console.warn(`⚠️ ${sourceType} Digitization failed:`, digitizeResp);
          }

          console.log(`📄 ${sourceType} Digitization API Response:`, digitizeResp);
           if (digitizeResp?.message) {
            alert(digitizeResp.message); 
           }
          // === CASE 1: Excel successfully generated ===
          if (digitizeResp?.S3_Excel_Storage_Link) {

            excelLinks.push({
              url: digitizeResp.S3_Excel_Storage_Link,
              requestId: digitizeResp.request_id,
              source: sourceType
            });
          }

          // === CASE 2: Failed but has requestId — save request only ===
          else if (digitizeResp?.request_id) {
            const metaBody = {
              ulbId: fileRow['ulbId'],
              financialYear: this.selectedYear,
              auditType: this.isAudited ?? '',
              docType: this.filters.documentTypes
                .flatMap(group => group.items)
                .find(doc => doc.key === this.selectedDocType)?.name || '',
              requestIds: [digitizeResp.request_id],
              failedSource: sourceType
            };

            console.log(`💾 Saving failed ${sourceType} requestId:`, metaBody);

            await this.http.post(
              environment.api.url +'afs-digitization/save-request-only',
              metaBody
            ).toPromise();

            console.log(`✅ Saved failed ${sourceType} requestId for ${fileRow['ulbId']}`);
          }
           if (digitizeResp?.S3_Excel_Storage_Link) {
            // ✅ Successful file

            const fullPdfUrl = this.normalizePdfUrl(pdf.fileUrl || pdf.previewUrl || '');
            const pagesCount = await this.getPdfPageCount(fullPdfUrl);

            // await this.http.get(
            //   `http://localhost:8080/api/v1/afs-digitization/afs-metrics?update=true&success=true&pages=${pagesCount}`
            // ).toPromise();
             await this.http.get(
              `${environment.api.url}afs-digitization/afs-metrics?update=true&success=true&pages=${pagesCount}`
            ).toPromise();
          } else {
            // ❌ Failed file
            const fullPdfUrl = this.normalizePdfUrl(pdf.fileUrl || pdf.previewUrl || '');

            const pagesCount = await this.getPdfPageCount(fullPdfUrl);

            // await this.http.get(
            //   `http://localhost:8080/api/v1/afs-digitization/afs-metrics?update=true&success=false&pages=${pagesCount}`
            // ).toPromise();
            await this.http.get(
              `${environment.api.url}afs-digitization/afs-metrics?update=true&success=false&pages=${pagesCount}`
            ).toPromise();
          }
        }

        // === Upload successful Excel(s) (if any) ===
        if (excelLinks.length > 0) {
          const backendForm = new FormData();
          backendForm.append('ulbId', fileRow['ulbId']);
          backendForm.append('financialYear', this.selectedYear);
          backendForm.append('auditType', this.isAudited ?? '');

          const docTypeName =
            this.filters.documentTypes
              .flatMap(group => group.items)
              .find(doc => doc.key === this.selectedDocType)?.name || '';
          backendForm.append('docType', docTypeName);

          for (const excel of excelLinks) {
            backendForm.append('excelLinks', JSON.stringify(excel));
          }
          //  await this.http.post(
          //   'http://localhost:8080/api/v1/afs-digitization/afs-excel-file',
          //   backendForm
          // ).toPromise();
          await this.http.post(
            environment.api.url +'afs-digitization/afs-excel-file',
            backendForm
          ).toPromise();

          console.log(`✅ Uploaded ${excelLinks.length} Excel(s) for ${fileRow['ulbId']}`);
        }

        console.log('Row processed successfully:', fileRow['ulbId']);
      } catch (err) {
        console.error('❌ Error digitizing row', fileRow['ulbId'], err);
      }
    }

    this.digitizeStatus = 'done';
    if (this.digitizeStatus === 'done') {
      this.applyFilters();
    }
  }




showLogsPopup = false;
selectedRequestId: string | null = null;
logsData: any = null;

 openLogs(requestId: string) {
    this.showLogsPopup = true;
    this.selectedRequestId = requestId;
    this.logsData = null; // reset while loading

    if (!requestId) {
      this.logsData = { Message: "No logs available for this file" };
      return;
    }

    const url = `${environment.api.url}afs-digitization/fetchRequestLogs?requestId=${requestId}`;
    // const url = `http://localhost:8080/api/v1/afs-digitization/fetchRequestLogs?requestId=${requestId}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        if (res.success && res.logs.length > 0) {
          this.logsData = res.logs[0];

          // ✅ Update the matching Excel file’s digitizedAt time
          const file = this.filteredFiles.find(f =>
            f.excelFiles?.some((ef: any) => ef.requestId === requestId)
          );

          const excel = file?.excelFiles?.find((ef: any) => ef.requestId === requestId);
          if (excel && this.logsData?.Timestamp) {
            excel.digitizedAt = this.logsData.Timestamp;
          }
        } else {
          this.logsData = { Message: "No logs found" };
        }
      },
      error: (err) => {
        console.error("Failed to fetch logs:", err);
        this.logsData = { Message: "Error fetching logs" };
      }
    });
  }


  closeLogs() {
    this.showLogsPopup = false;
    this.selectedRequestId = null;
    this.logsData = null;
  }

async fetchDigitizedTimestamps(files: any[]) {
    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.excelFiles?.length) {
          // Fetch logs for each excel file
          const updatedExcelFiles = await Promise.all(
            file.excelFiles.map(async (excel: any) => {
              try {
                if (!excel.requestId) return excel;

                const url = `${environment.api.url}afs-digitization/fetchRequestLogs?requestId=${excel.requestId}`;
                // const url = `http://localhost:8080/api/v1/afs-digitization/fetchRequestLogs?requestId=${excel.requestId}`;
                const res: any = await this.http.get(url).toPromise();

                if (res.success && res.logs?.length > 0) {
                  const log = res.logs[0];
                  return { ...excel, digitizedAt: log.Timestamp };
                } else {
                  return { ...excel, digitizedAt: null };
                }
              } catch (err) {
                console.error('Failed to fetch log for', excel.requestId, err);
                return { ...excel, digitizedAt: null };
              }
            })
          );
          file.excelFiles = updatedExcelFiles;
        }
        return file;
      })
    );

    return updatedFiles;
  }


  
  

}