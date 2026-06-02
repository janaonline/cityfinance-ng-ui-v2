import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { OldDashboardComponent } from './old-dashboard.component';
import { environment } from '../../../../environments/environment';

describe('OldDashboardComponent', () => {
  let component: OldDashboardComponent;
  let fixture: ComponentFixture<OldDashboardComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }], imports: [HttpClientTestingModule, RouterTestingModule, OldDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OldDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('stores filter changes, removes search-only fields, and closes the side bar', () => {
    component.toggleSideBar(true);
    const filters: any = {
      docType: '16th_fc',
      yearId: '2024-25',
      auditType: 'audited',
      populationCategory: 'All',
      stateId: ['s1'],
      ulbId: ['u1'],
      citySearch: 'city',
      stateSearch: 'state',
    };

    component.onFiltersChanged(filters);

    expect(component.filtersObj()).toEqual({
      docType: '16th_fc',
      yearId: '2024-25',
      auditType: 'audited',
      populationCategory: 'All',
      stateId: ['s1'],
      ulbId: ['u1'],
    } as any);
    expect(component.showSideBar()).toBeFalse();
  });

  it('copies emitted filter values into the selected filter state before applying filters', () => {
    spyOn(component, 'applyFilters');

    component.onFiltersChanged1({
      stateId: 's1',
      populationCategory: '1M-4M',
      cities: ['City A'],
      year: '2024-25',
      docType: 'bal_sheet',
      isAudited: 'audited',
    });

    expect(component.selectedState).toBe('s1');
    expect(component.selectedPopulation).toBe('1M-4M');
    expect(component.selectedCities).toEqual(['City A']);
    expect(component.selectedYear).toBe('2024-25');
    expect(component.selectedDocType).toBe('bal_sheet');
    expect(component.isAudited).toBe('audited');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('filters files by digitization status and clears date filters', () => {
    component.allFilteredFiles = [
      { cityName: 'Digitized', excelFiles: [{ uploadedBy: 'ULB', fileUrl: 'valid.xlsx' }] },
      { cityName: 'Failed', excelFiles: [{ uploadedBy: 'AFS', fileUrl: 'placeholder-link.com/x' }] },
      { cityName: 'Pending', excelFiles: [] },
    ] as any;
    component.filteredFiles = [...component.allFilteredFiles];
    component.selectedDigitizeStatus = 'FAILED';
    component.digitizedStartDate = new Date(2024, 0, 1);
    component.uploadedStartDate = new Date(2024, 0, 1);

    component.filterByDigitizeStatus();

    expect(component.filteredFiles.map((file) => file.cityName)).toEqual(['Failed']);
    expect(component.digitizedStartDate).toBeNull();
    expect(component.uploadedStartDate).toBeNull();

    component.selectedDigitizeStatus = '';
    component.filterByDigitizeStatus();
    expect(component.filteredFiles.length).toBe(3);
  });

  it('applies and resets digitized date ranges', () => {
    spyOn(window, 'alert');
    component.allFilteredFiles = [
      { cityName: 'Inside', excelFiles: [{ uploadedAt: '2024-02-10T10:00:00Z' }] },
      { cityName: 'Outside', excelFiles: [{ uploadedAt: '2024-03-10T10:00:00Z' }] },
    ] as any;
    component.digitizedStartDate = new Date('2024-02-01T00:00:00Z');
    component.digitizedEndDate = new Date('2024-02-28T00:00:00Z');
    component.selectedDigitizeStatus = 'DIGITIZED';
    component.uploadedStartDate = new Date();

    component.applyDateRange();

    expect(component.filteredFiles.map((file) => file.cityName)).toEqual(['Inside']);
    expect(component.selectedDigitizeStatus).toBe('');
    expect(component.uploadedStartDate).toBeNull();

    component.resetDateRange();
    expect(component.filteredFiles).toEqual(component.allFilteredFiles as any);

    component.digitizedStartDate = new Date('2024-03-01T00:00:00Z');
    component.digitizedEndDate = new Date('2024-02-01T00:00:00Z');
    component.applyDateRange();
    expect(window.alert).toHaveBeenCalled();
  });

  it('applies and resets uploaded date ranges', () => {
    spyOn(window, 'alert');
    component.allFilteredFiles = [
      { cityName: 'Submitted', ulbSubmit: '2024-02-10T10:00:00Z' },
      { cityName: 'Uploaded', uploadedAt: '2024-02-12T10:00:00Z' },
      { cityName: 'Outside', uploadedAt: '2024-03-10T10:00:00Z' },
    ] as any;
    component.uploadedStartDate = new Date('2024-02-01T00:00:00Z');
    component.uploadedEndDate = new Date('2024-02-28T00:00:00Z');
    component.digitizedStartDate = new Date();
    component.selectedDigitizeStatus = 'FAILED';

    component.applyUploadedDateRange();

    expect(component.filteredFiles.map((file) => file.cityName)).toEqual(['Submitted', 'Uploaded']);
    expect(component.digitizedStartDate).toBeNull();
    expect(component.selectedDigitizeStatus).toBe('');

    component.resetUploadedDateRange();
    expect(component.filteredFiles).toEqual(component.allFilteredFiles as any);

    component.uploadedStartDate = new Date('2024-03-01T00:00:00Z');
    component.uploadedEndDate = new Date('2024-02-01T00:00:00Z');
    component.applyUploadedDateRange();
    expect(window.alert).toHaveBeenCalled();
  });

  it('loads user details and metrics/filter data during init', () => {
    localStorage.setItem(
      'userData',
      JSON.stringify({
        name: 'Finance User',
        email: 'finance@example.com',
        role: 'ADMIN',
        designation: 'Analyst',
        updatedAt: '2024-01-01T00:00:00Z',
      }),
    );
    spyOn(component, 'loadGlobalMetrics').and.returnValue(Promise.resolve());

    component.ngOnInit();

    httpMock.expectOne(`${environment.api.url}afs-digitization/afs-metrics`).flush({
      success: true,
      global: { digitizedFiles: 4, digitizedPages: 30, failedFiles: 1, updatedAt: 'now' },
    });
    httpMock.expectOne(`${environment.api.url}afs-digitization/afs-filters`).flush({
      success: true,
      filters: {
        states: [{ _id: 's1', name: 'State A' }],
        populationCategories: ['All', '1M-4M'],
        cities: [{ _id: 'u1', name: 'City A', stateId: 's1', populationCategory: '1M-4M' }],
        years: [{ _id: 'y1', name: '2024-25' }],
        documentTypes: [{ heading: 'Docs', items: [{ key: 'bal_sheet', name: 'Balance Sheet' }] }],
      },
    });

    expect(component.fullName).toBe('Finance User');
    expect(component.email).toBe('finance@example.com');
    expect(component.role).toBe('ADMIN');
    expect(component.filters.states.length).toBe(1);
    expect(component.globalMetrics.digitizedFiles).toBe(4);
  });

  it('detects usable, failed, and matching Excel files by uploader', () => {
    const file = {
      excelFiles: [
        { uploadedBy: 'ULB', fileUrl: 'valid.xlsx' },
        { uploadedBy: 'ULB', fileUrl: 'https://placeholder-link.com/none' },
        { uploadedBy: 'AFS', fileUrl: 'afs.xlsx' },
      ],
    };

    expect(component.hasExcelFile(file, 'ULB')).toBeTrue();
    expect(component.hasFailedExcelFile(file, 'ULB')).toBeTrue();
    expect(component.getExcelFiles(file, 'ULB')).toEqual([{ uploadedBy: 'ULB', fileUrl: 'valid.xlsx' }]);
    expect(component.hasExcelFile({}, 'ULB')).toBeFalse();
    expect(component.getExcelFiles({}, 'ULB')).toEqual([]);
  });

  it('updates city lists and selections when population or state changes', () => {
    component.filters.allCities = [
      { name: 'Alpha', stateId: 's1', populationCategory: '1M-4M' },
      { name: 'Beta', stateId: 's1', populationCategory: '500K-1M' },
      { name: 'Gamma', stateId: 's2', populationCategory: '1M-4M' },
    ];
    component.filters.populationCategories = ['All', '1M-4M'];
    component.filters.states = [{ _id: 's1', name: 'State One' }] as any;

    component.selectedPopulation = '1M-4M';
    component.selectedCities = ['Beta'];
    component.onPopulationCategoryChange();
    expect(component.filters.cities.map((city) => city.name)).toEqual(['Alpha', 'Gamma']);
    expect(component.selectedCities).toEqual([]);

    component.selectState({ _id: 's1', name: 'State One' });
    expect(component.selectedState).toBe('s1');
    expect(component.selectedCities).toEqual(['Alpha']);
    expect(component.filters.cities.map((city) => city.name)).toEqual(['Alpha', 'Beta']);
  });

  it('sorts and searches filtered city/state lists with selected cities first', () => {
    component.filters.cities = [
      { name: 'Beta' },
      { name: 'Alpha' },
      { name: 'Gamma' },
    ] as any;
    component.selectedCities = ['Gamma'];
    component.citySearchText = 'a';
    component.filters.states = [
      { _id: 's1', name: 'Kerala' },
      { _id: 's2', name: 'Karnataka' },
    ] as any;
    component.stateSearchText = 'kar';

    expect(component.filteredCities.map((city) => city.name)).toEqual(['Gamma', 'Beta', 'Alpha']);
    expect(component.filteredStates.map((state) => state.name)).toEqual(['All', 'Karnataka']);
  });

  it('sorts table rows by city and ULB code in both directions', () => {
    component.filteredFiles = [
      { cityName: 'Beta', ulbCode: '002' },
      { cityName: 'Alpha', ulbCode: '001' },
    ] as any;

    component.sortByCity('asc');
    expect(component.filteredFiles.map((file) => file.cityName)).toEqual(['Alpha', 'Beta']);

    component.sortByULBCode('desc');
    expect(component.filteredFiles.map((file) => file.ulbCode)).toEqual(['002', '001']);
  });

  it('resets filters, toggles popups, computes success rate, and handles doc type selection', () => {
    component.selectedState = 's1';
    component.selectedPopulation = 'All';
    component.selectedCities = ['City A'];
    component.filtersApplied = true;
    component.globalMetrics = { digitizedFiles: 9, failedFiles: 1, digitizedPages: 10, updatedAt: '' };

    component.resetFilters();
    expect(component.selectedState).toBe('');
    expect(component.selectedCities).toEqual([]);
    expect(component.filtersApplied).toBeFalse();

    component.togglePopup();
    component.toggleMetricsPopup();
    expect(component.showPopup).toBeTrue();
    expect(component.showMetricsPopup).toBeTrue();
    expect(component.getGlobalSuccessRate()).toBe(90);

    component.globalMetrics = { digitizedFiles: 0, failedFiles: 0, digitizedPages: 0, updatedAt: '' };
    expect(component.getGlobalSuccessRate()).toBe(0);

    component.onDocTypeChange('16th_fc');
    expect(component.isAudited).toBe('audited');
    component.onDocTypeChange('bal_sheet');
    expect(component.isAudited).toBeNull();
  });

  it('updates selected file and page totals and toggles all rows', () => {
    component.filteredFiles = [
      {
        selected: true,
        pageCount: 2,
        extraFiles: [{ pageCount: 3 }],
      },
      {
        selected: false,
        pageCount: 5,
      },
    ] as any;

    component.updateSelection();
    expect(component.selectedFilesCount).toBe(2);
    expect(component.totalSelectedPages).toBe(5);
    expect(component.selectAll).toBeFalse();

    component.selectAll = true;
    component.activeRow = component.filteredFiles[0];
    component.toggleSelectAll();
    expect(component.filteredFiles.every((file) => file.selected)).toBeTrue();
    expect(component.activeRow).toBeNull();
  });

  it('builds the digitization popup message for already digitized selections', () => {
    component.filteredFiles = [
      {
        selected: true,
        pageCount: 2,
        extraFiles: [{ pageCount: 3 }],
        excelFiles: [{ fileUrl: 'valid.xlsx' }],
      },
    ] as any;
    component.selectedFilesCount = 2;
    component.totalSelectedPages = 5;

    component.openDigitizePopup();

    expect(component.showDigitizePopup).toBeTrue();
    expect(component.digitizePopupMessage).toContain('already digitized PDFs');

    component.closeDigitizePopup();
    expect(component.showDigitizePopup).toBeFalse();
    expect(component.digitizeStatus).toBe('');
  });

  it('opens and closes log details for empty and successful request ids', () => {
    component.filteredFiles = [
      { excelFiles: [{ requestId: 'req-1', digitizedAt: null }] },
    ] as any;

    component.openLogs('');
    expect(component.logsData).toEqual({ Message: 'No logs available for this file' });

    component.openLogs('req-1');
    httpMock.expectOne(`${environment.api.url}afs-digitization/fetchRequestLogs?requestId=req-1`).flush({
      success: true,
      logs: [{ Timestamp: '2024-01-01T00:00:00Z' }],
    });

    expect(component.logsData).toEqual({ Timestamp: '2024-01-01T00:00:00Z' });
    expect(component.filteredFiles[0].excelFiles?.[0].digitizedAt).toBe('2024-01-01T00:00:00Z');

    component.closeLogs();
    expect(component.showLogsPopup).toBeFalse();
    expect(component.selectedRequestId).toBeNull();
  });

  it('fetches digitized timestamps while tolerating missing request ids and failed lookups', async () => {
    component.filteredFiles = [];
    const promise = component.fetchDigitizedTimestamps([
      {
        excelFiles: [
          { requestId: 'req-1' },
          { requestId: '' },
          { requestId: 'req-2' },
        ],
      },
    ] as any);

    httpMock.expectOne(`${environment.api.url}afs-digitization/fetchRequestLogs?requestId=req-1`).flush({
      success: true,
      logs: [{ Timestamp: '2024-01-01T00:00:00Z' }],
    });
    httpMock
      .expectOne(`${environment.api.url}afs-digitization/fetchRequestLogs?requestId=req-2`)
      .flush({}, { status: 500, statusText: 'Server error' });

    const result = await promise;

    expect(result[0].excelFiles[0].digitizedAt).toBe('2024-01-01T00:00:00Z');
    expect(result[0].excelFiles[1].digitizedAt).toBeUndefined();
    expect(result[0].excelFiles[2].digitizedAt).toBeNull();
  });

  it('logs out by clearing storage and navigating to login', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    localStorage.setItem('token', 'value');

    component.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
