import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../../../../../environments/environment';
import { SignedUrlDirective } from '../../../../../core/directives/storage-url.directive';
import { IUlbMaster, IUlbYearAccess } from '../../../../../core/models/ulb-master';
import { UlbReviewDialogComponent, UlbReviewDialogData } from './ulb-review-dialog.component';

const YEAR_ACCESS_URL = `${environment.api.url2}master/ulb/ulb-1/year-access`;
const YEARS_URL = `${environment.api.url2}xvi-fc/years`;

const emptyYearAccess = (): IUlbYearAccess => ({
  startYear: null,
  yearAccess: {},
  exemptableForms: [
    { formId: 32, isApplicableForExemption: true, exemptionGraceYears: 1, submissionScope: 'PER_YEAR', label: 'SLB' },
  ],
});

describe('UlbReviewDialogComponent', () => {
  let fixture: ComponentFixture<UlbReviewDialogComponent>;
  let component: UlbReviewDialogComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Year Access is ADMIN-only (see showYearAccess) - default the logged-in user to ADMIN so
    // existing tests keep exercising that section; STATE-specific tests override this.
    localStorage.setItem('userData', JSON.stringify({ role: 'ADMIN' }));
  });

  function createUlb(overrides: Partial<IUlbMaster> = {}): IUlbMaster {
    return {
      _id: 'ulb-1',
      code: 'UB001',
      name: 'Test ULB',
      ulbType: 'municipality',
      state: 'state-1',
      isActive: true,
      isPublish: false,
      approval: { status: 'PENDING' },
      ...overrides,
    } as IUlbMaster;
  }

  async function setup(
    data: UlbReviewDialogData,
    options: { yearAccess?: IUlbYearAccess; years?: Array<{ _id: string; year: string }> } = {},
  ): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [UlbReviewDialogComponent, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UlbReviewDialogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    if (!component.showYearAccess) {
      httpMock.expectNone(YEAR_ACCESS_URL);
      httpMock.expectNone(YEARS_URL);
      return;
    }

    httpMock
      .expectOne(YEAR_ACCESS_URL)
      .flush({ success: true, data: options.yearAccess ?? emptyYearAccess(), timestamp: 'now' });
    httpMock.expectOne(YEARS_URL).flush({
      success: true,
      data: options.years ?? [
        { _id: 'year-2026-27', year: '2026-27' },
        { _id: 'year-2027-28', year: '2027-28' },
      ],
    });
    fixture.detectChanges();
  }

  it('renders the gazette file link from the canonical path', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          originalName: 'gazette.pdf',
          path: '/state/gazette.pdf',
          mimeType: 'application/pdf',
          sizeKb: 12,
          pageCount: 2,
        },
      }),
    });

    expect(component.gazetteFile?.path).toBe('/state/gazette.pdf');
    const link = fixture.debugElement.query(By.directive(SignedUrlDirective));
    expect(link).toBeTruthy();
    // Raw storage path: the signed-url directive resolves it on click, so no direct href is rendered.
    expect(link.injector.get(SignedUrlDirective).appSignedUrl()).toBe('/state/gazette.pdf');
    expect((link.nativeElement as HTMLAnchorElement).getAttribute('href')).toBeNull();
  });

  it('links an absolute https gazette URL directly without signing', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          originalName: 'gazette.pdf',
          path: 'https://signed.example.com/state/gazette.pdf',
          mimeType: 'application/pdf',
          sizeKb: 12,
          pageCount: 2,
        },
      }),
    });

    const link = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://signed.example.com/state/gazette.pdf');
  });

  it('normalizes a pre-canonical gazette record (fileName/fileUrl) for display', async () => {
    await setup({
      ulb: createUlb({
        gazetteNotificationFile: {
          fileName: 'old-gazette.pdf',
          fileUrl: '/state/old-gazette.pdf',
          fileSize: 1024,
        } as unknown as IUlbMaster['gazetteNotificationFile'],
      }),
    });

    expect(component.gazetteFile).toEqual({
      originalName: 'old-gazette.pdf',
      path: '/state/old-gazette.pdf',
      mimeType: '',
      sizeKb: 1,
      pageCount: null,
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('a')).toBeTruthy();
  });

  it('hides the gazette file block when no file is present', async () => {
    await setup({ ulb: createUlb({ gazetteNotificationFile: null }) });

    expect(component.gazetteFile).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Gazette Notification File');
  });

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  describe('xvi-fc dynamic year access', () => {
    it('defaults startYear to the earliest open design year and checks every exemptable form for a brand-new ULB', async () => {
      await setup({ ulb: createUlb() });

      expect(component.selectedYearId).toBe('year-2026-27');
      expect(component.isExemptChecked(32)).toBeTrue();
    });

    it('pre-fills from the existing seed entry instead of defaulting to fully-checked', async () => {
      await setup(
        { ulb: createUlb() },
        {
          yearAccess: {
            startYear: 2026,
            yearAccess: { '2026-27': { yearEnabled: true, yearId: 'year-2026-27', disabledFormIds: [] } },
            exemptableForms: [
              {
                formId: 32,
                isApplicableForExemption: true,
                exemptionGraceYears: 1,
                submissionScope: 'PER_YEAR',
                label: 'SLB',
              },
            ],
          },
        },
      );

      // Seed entry exists and explicitly lists no disabled forms - reflect that, not the fully-checked default.
      expect(component.selectedYearId).toBe('year-2026-27');
      expect(component.isExemptChecked(32)).toBeFalse();
    });

    it('toggleExempt flips membership', async () => {
      await setup({ ulb: createUlb() });

      expect(component.isExemptChecked(32)).toBeTrue();
      component.toggleExempt(32);
      expect(component.isExemptChecked(32)).toBeFalse();
      component.toggleExempt(32);
      expect(component.isExemptChecked(32)).toBeTrue();
    });

    it('saveYearAccess sends the selected startYear and current disabledFormIds', async () => {
      await setup({ ulb: createUlb() });
      component.selectedYearId = 'year-2027-28';
      component.toggleExempt(32); // uncheck

      component.saveYearAccess();

      const req = httpMock.expectOne(YEAR_ACCESS_URL);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ startYear: 2027, disabledFormIds: [] });
      req.flush({ success: true, data: createUlb(), timestamp: 'now' });

      expect(component.yearAccessSaved).toBeTrue();
      expect(component.yearAccessSaving).toBeFalse();
    });

    it('falls back to a generic message when saving fails with no structured backend reason', async () => {
      await setup({ ulb: createUlb() });

      component.saveYearAccess();
      httpMock
        .expectOne(YEAR_ACCESS_URL)
        .flush(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(component.yearAccessError).toBe('Unable to save year access. Please try again.');
      expect(component.yearAccessSaved).toBeFalse();
    });

    it('surfaces the backend rejection reason (e.g. exemption blocked by an existing real submission)', async () => {
      await setup({ ulb: createUlb() });

      component.saveYearAccess();
      httpMock.expectOne(YEAR_ACCESS_URL).flush(
        { message: 'This ULB already has SLB data submitted for 2026-27 - exemption cannot be applied retroactively.' },
        { status: 400, statusText: 'Bad Request' },
      );

      expect(component.yearAccessError).toBe(
        'This ULB already has SLB data submitted for 2026-27 - exemption cannot be applied retroactively.',
      );
      expect(component.yearAccessSaved).toBeFalse();
    });

    it('is available in read-only mode too, independent of Approve/Reject', async () => {
      await setup({ ulb: createUlb(), readOnly: true });

      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Year Access (16th FC)');
    });

    it('is hidden for an "Existing ULB" record, and never fetches its data', async () => {
      await setup({ ulb: createUlb({ isExistingUser: true }) });

      expect(component.showYearAccess).toBeFalse();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Year Access (16th FC)');
    });

    it('is hidden for a STATE user, and never calls the ADMIN-only endpoints (would 403 otherwise)', async () => {
      localStorage.setItem('userData', JSON.stringify({ role: 'STATE' }));

      await setup({ ulb: createUlb(), readOnly: true });

      expect(component.showYearAccess).toBeFalse();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Year Access (16th FC)');
    });
  });
});
