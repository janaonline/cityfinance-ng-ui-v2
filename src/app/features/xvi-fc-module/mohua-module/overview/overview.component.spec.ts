import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { XVIFC_LS_KEYS } from '../../shared/years-selection/years-selection.component';
import { MohuaOverviewService } from './mohua-overview.service';
import { OverviewData } from './overview.models';
import { MohuaOverviewComponent } from './overview.component';

const data: OverviewData = {
  year: { id: 'year-1', label: '2026-27' },
  totals: { stateCount: 1, ulbsCovered: 30, allocation: 37272, instalment1: 18636 },
  rows: [
    {
      stateId: 'state-1',
      code: 'AP',
      name: 'Andhra Pradesh',
      status: 'review',
      underReviewSince: null,
      allocation: 1562,
      eligible: null,
      ulbsDone: 3,
      ulbsTotal: 30,
      formsDone: 5,
      forms: [],
    },
  ],
};

describe('MohuaOverviewComponent', () => {
  let service: { getOverview: jasmine.Spy };

  const create = (params: Record<string, string>) => {
    const paramMap = convertToParamMap(params);
    TestBed.configureTestingModule({
      imports: [MohuaOverviewComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MohuaOverviewService, useValue: service },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap, parent: null }, paramMap: of(paramMap), parent: null },
        },
      ],
    });
    const fixture = TestBed.createComponent(MohuaOverviewComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    localStorage.removeItem(XVIFC_LS_KEYS.selectedYearId);
    service = { getOverview: jasmine.createSpy('getOverview').and.returnValue(of(data)) };
  });

  it('loads the overview for the year in the route and shows it', () => {
    const fixture = create({ yearId: 'year-1' });

    expect(service.getOverview).toHaveBeenCalledOnceWith('year-1');
    expect(fixture.componentInstance.loading()).toBeFalse();
    expect(fixture.componentInstance.error()).toBeNull();
    expect(fixture.componentInstance.rows().length).toBe(1);
    expect(fixture.nativeElement.querySelector('.ov-message')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-ov-briefing')).not.toBeNull();
  });

  it('falls back to the year stored by the year picker when the route has none', () => {
    localStorage.setItem(XVIFC_LS_KEYS.selectedYearId, 'stored-year');

    create({});

    expect(service.getOverview).toHaveBeenCalledOnceWith('stored-year');
    localStorage.removeItem(XVIFC_LS_KEYS.selectedYearId);
  });

  it('asks for a year instead of calling the API when there is none', () => {
    const fixture = create({});

    expect(service.getOverview).not.toHaveBeenCalled();
    expect(fixture.componentInstance.error()).toBe('Select a financial year to view the overview.');
    expect(fixture.nativeElement.querySelector('.ov-message')?.textContent).toContain('Select a financial year');
  });

  it("shows the API's message when the request fails, and Try again loads it again", () => {
    service.getOverview.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'Year not found' } })),
    );
    const fixture = create({ yearId: 'year-1' });

    expect(fixture.componentInstance.error()).toBe('Year not found');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('Year not found');

    service.getOverview.and.returnValue(of(data));
    fixture.componentInstance.load();
    fixture.detectChanges();

    expect(service.getOverview).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.error()).toBeNull();
    expect(fixture.componentInstance.rows().length).toBe(1);
  });

  it('uses a generic message for a failure that is not an HTTP error', () => {
    service.getOverview.and.returnValue(throwError(() => new Error('network')));

    const fixture = create({ yearId: 'year-1' });

    expect(fixture.componentInstance.error()).toBe('Could not load the overview. Please try again.');
  });
});
