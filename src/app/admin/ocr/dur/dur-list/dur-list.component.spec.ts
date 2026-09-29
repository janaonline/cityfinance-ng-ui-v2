import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { environment } from '../../../../../environments/environment';
import { UtilityService } from '../../../../core/services/utility.service';
import { DurListComponent } from './dur-list.component';
import { DurJobListResponse } from '../dur-models';

const BASE_URL = environment.api.url3;
const JOBS_URL = `${BASE_URL}dur-validation/jobs`;

/** The jobs list endpoint always carries query params (skip/limit/sort_order),
 * so matching must compare `req.url` (path only), not the full url+query string. */
function expectJobsListRequest(httpMock: HttpTestingController) {
  return httpMock.expectOne((r) => r.url === JOBS_URL);
}

const emptyResponse: DurJobListResponse = { jobs: [], total: 0, skip: 0, limit: 10, total_pages: 0 };

describe('DurListComponent', () => {
  let component: DurListComponent;
  let fixture: ComponentFixture<DurListComponent>;
  let httpMock: HttpTestingController;
  let utilitySpy: jasmine.SpyObj<UtilityService>;

  beforeEach(async () => {
    utilitySpy = jasmine.createSpyObj('UtilityService', ['swalPopup']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule, DurListComponent],
      providers: [{ provide: UtilityService, useValue: utilitySpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DurListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges(); // triggers ngOnInit -> initial loadJobs()
    expectJobsListRequest(httpMock).flush(emptyResponse);
  });

  afterEach(() => httpMock.verify());

  it('should create and load an empty job list initially', () => {
    expect(component).toBeTruthy();
    expect(component.dataSource.data).toEqual([]);
    expect(component.totalItems).toBe(0);
  });

  it('populates the table from the jobs list response', () => {
    component.refresh();

    const req = expectJobsListRequest(httpMock);
    req.flush({
      jobs: [
        {
          job_id: 'job-1',
          status: 'completed',
          filename: 'dur.pdf',
          model: 'gemini-3.1-pro-preview',
          expected: { ulb_name: 'Karad Municipality', financial_year: '2026-27', grant_type: 'untied' },
          progress_step: 'completed',
          error_message: null,
          checks: {
            ulb_name_match: true,
            financial_year_match: true,
            grant_type_match: false,
            format_valid: true,
            signature_present: true,
            overall_valid: true,
          },
          created_at: '2026-01-15T10:00:00Z',
          updated_at: null,
          started_at: null,
          completed_at: null,
          message: 'Job completed successfully.',
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
      total_pages: 1,
    });

    expect(component.totalItems).toBe(1);
    expect(component.dataSource.data.length).toBe(1);
    const row = component.dataSource.data[0];
    expect(row.jobId).toBe('job-1');
    expect(row.ulbName).toBe('Karad Municipality');
    expect(row.financialYear).toBe('2026-27');
    expect(row.grantType).toBe('untied');
    expect(row.grantTypeMatch).toBeFalse();
    expect(row.overallValid).toBeTrue();
  });

  it('applyFilters() sends the filter form values as query params and resets to the first page', () => {
    component.pageIndex = 2;
    component.filterForm.setValue({
      status: 'failed',
      filename: 'report',
      ulbName: 'Karad',
      financialYear: '2026-27',
      grantType: 'tied',
      dateFrom: null,
      dateTo: null,
    });

    component.applyFilters();

    const req = httpMock.expectOne(
      (r) =>
        r.url === JOBS_URL &&
        r.params.get('status') === 'failed' &&
        r.params.get('filename') === 'report' &&
        r.params.get('ulb_name') === 'Karad' &&
        r.params.get('financial_year') === '2026-27' &&
        r.params.get('grant_type') === 'tied',
    );
    expect(component.pageIndex).toBe(0);
    req.flush(emptyResponse);
  });

  it('resetFilters() clears the form and reloads with no filters', () => {
    component.filterForm.patchValue({ status: 'completed', ulbName: 'Karad' });

    component.resetFilters();

    const req = expectJobsListRequest(httpMock);
    expect(req.request.params.has('status')).toBeFalse();
    expect(req.request.params.has('ulb_name')).toBeFalse();
    expect(component.filterForm.value.status).toBe('');
    req.flush(emptyResponse);
  });

  it('toggleSortOrder() flips between desc and asc and re-requests with the new sort_order', () => {
    expect(component.sortOrder()).toBe('desc');

    component.toggleSortOrder();

    const req = expectJobsListRequest(httpMock);
    expect(component.sortOrder()).toBe('asc');
    expect(req.request.params.get('sort_order')).toBe('asc');
    req.flush(emptyResponse);
  });

  it('shows an error popup and clears the table when the request fails', () => {
    component.refresh();

    const req = expectJobsListRequest(httpMock);
    req.flush({ detail: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(component.dataSource.data).toEqual([]);
    expect(component.totalItems).toBe(0);
    expect(utilitySpy.swalPopup).toHaveBeenCalledWith('Failed to load DUR validation jobs', 'boom', 'error');
  });

  describe('pure display helpers', () => {
    it('getStatusClass maps each status to its badge class', () => {
      expect(component.getStatusClass('completed')).toBe('status-badge--completed');
      expect(component.getStatusClass('failed')).toBe('status-badge--failed');
      expect(component.getStatusClass('processing')).toBe('status-badge--processing');
      expect(component.getStatusClass('queued')).toBe('status-badge--queued');
    });

    it('matchChipClass maps true/false/null to good/bad/neutral chips', () => {
      expect(component.matchChipClass(true)).toBe('chip chip--good');
      expect(component.matchChipClass(false)).toBe('chip chip--bad');
      expect(component.matchChipClass(null)).toBe('chip chip--neutral');
    });

    it('truncate() shortens long values but leaves short ones and dashes untouched', () => {
      expect(component.truncate('—')).toBe('—');
      expect(component.truncate('short')).toBe('short');
      expect(component.truncate('a'.repeat(40))).toContain('...');
    });
  });
});
