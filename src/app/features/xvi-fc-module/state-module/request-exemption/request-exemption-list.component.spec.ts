import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { UtilityService } from '../../../../core/services/utility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { getRequestExemptionStatusBadgeClass, RequestExemptionListComponent } from './request-exemption-list.component';
import { RequestExemptionListItem, RequestExemptionListResponseData } from './request-exemption.models';
import { RequestExemptionService } from './request-exemption.service';

const sampleItem: RequestExemptionListItem = {
  _id: 'req-1_23',
  requestId: 'req-1',
  formId: 23,
  ulb: { _id: 'ulb-1', name: 'Agra', censusCode: 'CC-1' },
  reasonForExemptionLabel: 'Election / duly constituted ULB exemption',
  currentFormStatus: 5,
  currentFormStatusLabel: 'Under Review by MoHUA',
  submittedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-07-30T00:00:00.000Z',
};

function buildListResponse(
  overrides: Partial<RequestExemptionListResponseData> = {},
): RequestExemptionListResponseData {
  return {
    stateName: 'Test State',
    items: [sampleItem],
    page: 1,
    limit: 10,
    total: 1,
    pages: 1,
    canCreate: true,
    ...overrides,
  };
}

describe('RequestExemptionListComponent', () => {
  let fixture: ComponentFixture<RequestExemptionListComponent>;
  let component: RequestExemptionListComponent;
  let requestExemptionService: RequestExemptionService;
  let utilityService: jasmine.SpyObj<UtilityService>;
  let router: Router;
  let listSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.setItem('userData', JSON.stringify({ state: 'state-test-id' }));

    const moduleService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', ['yearId']);
    moduleService.yearId.and.returnValue('year-test-id');
    utilityService = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, RequestExemptionListComponent],
      providers: [
        { provide: XvifcModuleService, useValue: moduleService },
        { provide: UtilityService, useValue: utilityService },
      ],
    }).compileComponents();

    requestExemptionService = TestBed.inject(RequestExemptionService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    listSpy = spyOn(requestExemptionService, 'list').and.returnValue(of(buildListResponse()));
  });

  afterEach(() => {
    localStorage.removeItem('userData');
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(RequestExemptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads the first page and shows the table when there are existing requests', () => {
    createComponent();

    expect(listSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id', { page: 1, limit: 10 });
    expect(component.stateName()).toBe('Test State');
    expect(component.items()).toEqual([sampleItem]);
    expect(component.isLoading()).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects straight to the fill-in form when the state has zero requests, without rendering a table', () => {
    listSpy.and.returnValue(of(buildListResponse({ items: [], total: 0, pages: 0 })));

    createComponent();

    expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'request-exemption', 'new'], {
      replaceUrl: true,
    });
    expect(component.isLoading()).toBeTrue();
  });

  it('shows a retry option when the list fails to load', () => {
    listSpy.and.returnValue(throwError(() => new Error('network error')));

    createComponent();

    expect(component.loadError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
    expect(utilityService.triggerSnackbar).toHaveBeenCalledWith(
      'Unable to load Exemption Status. Please try again.',
      'snackbar-danger',
    );
  });

  it('navigates to the fill-in form when "Request Exemption" is clicked', () => {
    createComponent();

    component.createNewRequest();

    expect(router.navigate).toHaveBeenCalledWith(['/xvifc', 'year-test-id', 'request-exemption', 'new']);
  });

  it('does not navigate when creating a new request is disabled', () => {
    listSpy.and.returnValue(of(buildListResponse({ canCreate: false })));

    createComponent();
    component.createNewRequest();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('fetches the next page on goToPage', () => {
    listSpy.and.returnValue(of(buildListResponse({ total: 25, pages: 3 })));
    createComponent();

    listSpy.and.returnValue(of(buildListResponse({ page: 2, total: 25, pages: 3 })));
    component.goToPage(2);

    expect(listSpy).toHaveBeenCalledWith('state-test-id', 'year-test-id', { page: 2, limit: 10 });
    expect(component.page()).toBe(2);
  });

  it('ignores an out-of-range goToPage call', () => {
    createComponent();
    listSpy.calls.reset();

    component.goToPage(0);
    component.goToPage(99);

    expect(listSpy).not.toHaveBeenCalled();
  });

  it('renders the Census Code column, falling back to sbCode-derived value or a dash', () => {
    listSpy.and.returnValue(
      of(
        buildListResponse({
          items: [
            { ...sampleItem, _id: 'a', ulb: { _id: 'ulb-1', name: 'Agra', censusCode: 'CC-1' } },
            { ...sampleItem, _id: 'b', ulb: { _id: 'ulb-2', name: 'Kanpur', censusCode: null } },
          ],
        }),
      ),
    );

    createComponent();
    const cells: HTMLTableCellElement[] = Array.from(fixture.nativeElement.querySelectorAll('tbody tr td:nth-child(2)'));

    expect(cells[0].textContent?.trim()).toBe('CC-1');
    expect(cells[1].textContent?.trim()).toBe('-');
  });
});

describe('getRequestExemptionStatusBadgeClass', () => {
  it('maps UNDER_REVIEW_BY_MOHUA to warning', () => {
    expect(getRequestExemptionStatusBadgeClass(5)).toBe('text-bg-warning');
  });

  it('maps RETURNED_BY_MOHUA to danger', () => {
    expect(getRequestExemptionStatusBadgeClass(6)).toBe('text-bg-danger');
  });

  it('maps SUBMISSION_ACKNOWLEDGED_BY_MOHUA to primary', () => {
    expect(getRequestExemptionStatusBadgeClass(7)).toBe('text-bg-primary');
  });

  it('falls back to secondary for any other status', () => {
    expect(getRequestExemptionStatusBadgeClass(1)).toBe('text-bg-secondary');
  });
});
