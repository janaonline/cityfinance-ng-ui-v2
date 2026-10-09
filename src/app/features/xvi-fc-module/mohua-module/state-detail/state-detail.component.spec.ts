import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MohuaStateDetailService } from './mohua-state-detail.service';
import { MohuaStateUlbsService } from './mohua-state-ulbs.service';
import { StateDetailComponent } from './state-detail.component';
import { StateDetailData, StateUlbsPage } from './state-detail.models';

const detail: StateDetailData = {
  year: { id: 'year-1', label: '2026-27' },
  state: { id: 'state-1', code: 'TR', name: 'Tripura', status: 'progress' },
  allocation: 130,
  formsDone: 1,
  forms: [
    {
      key: 'SFC_STATUS',
      label: 'SFC Status',
      statusCode: 5,
      statusLabel: 'Under Review by MoHUA',
      completed: true,
      canView: true,
    },
    {
      key: 'GTC',
      label: 'Grant Transfer Certificate',
      statusCode: 0,
      statusLabel: 'Not Started',
      completed: false,
      canView: false,
    },
    {
      key: 'DEVOLUTION',
      label: 'Devolution',
      statusCode: 2,
      statusLabel: 'In Progress',
      completed: false,
      canView: true,
    },
  ],
  ulbForms: {
    totalUlbs: 21,
    items: [
      { key: 'AUDITED', label: 'Annual Accounts', completed: 0 },
      { key: 'DUR', label: 'DUR', completed: 20 },
    ],
  },
};

const ulbs: StateUlbsPage = {
  items: [
    {
      ulbId: 'ulb-1',
      name: 'Agartala Municipal Corporation',
      censusCode: '800001',
      allocation: 12.5,
      electedBody: 'Constituted',
      forms: { audited: false, unaudited: false, pfms: true, slb: false, dur: true },
    },
  ],
  pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
};

describe('StateDetailComponent', () => {
  let detailService: { getDetail: jasmine.Spy };
  let ulbsService: { getUlbs: jasmine.Spy };

  const create = () => {
    const paramMap = convertToParamMap({ stateId: 'state-1', yearId: 'year-1' });
    TestBed.configureTestingModule({
      imports: [StateDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MohuaStateDetailService, useValue: detailService },
        { provide: MohuaStateUlbsService, useValue: ulbsService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap, parent: null }, paramMap: of(paramMap), parent: null },
        },
      ],
    });
    const fixture = TestBed.createComponent(StateDetailComponent);
    fixture.detectChanges();
    return fixture;
  };

  beforeEach(() => {
    detailService = { getDetail: jasmine.createSpy('getDetail').and.returnValue(of(detail)) };
    ulbsService = { getUlbs: jasmine.createSpy('getUlbs').and.returnValue(of(ulbs)) };
  });

  it('loads the state and its first page of ULBs for the ids in the route', () => {
    const fixture = create();

    expect(detailService.getDetail).toHaveBeenCalledOnceWith('state-1', 'year-1');
    expect(ulbsService.getUlbs).toHaveBeenCalledOnceWith('state-1', 'year-1', {
      page: 1,
      limit: 15,
      search: '',
      sortBy: 'ulbName',
      sortDir: 'asc',
    });
    expect(fixture.componentInstance.stateName()).toBe('Tripura');
    expect(fixture.componentInstance.ulbs().length).toBe(1);
    expect(fixture.componentInstance.ulbTotal()).toBe(1);
  });

  it('shows the real allocation, "--" for eligible, and "Coming soon" for every claim figure', () => {
    const stats = create().componentInstance.stats();

    expect(stats.map((stat) => [stat.label, stat.value])).toEqual([
      ['Annual Allocation', '₹130 cr'],
      ['Eligible Amount', '--'],
      ['Under Review by MoHUA', 'Coming soon'],
      ['Returned by MoHUA', 'Coming soon'],
      ['Approved by MoHUA', 'Coming soon'],
      ['Recommended to DoE', 'Coming soon'],
    ]);
  });

  it('links a state form to its read-only screen only when the API says MoHUA can open it', () => {
    const fixture = create();
    const conditions = fixture.componentInstance.conditions();

    expect(conditions[0].viewLink).toEqual(['review-state-submissions', 'state-1', 'sfc-status']);
    expect(conditions[1].viewLink).toBeNull();
    expect(conditions[2].viewLink).toEqual(['review-state-submissions', 'state-1', 'devolution-formula', '1']);
    expect(fixture.nativeElement.querySelectorAll('.sd-cond__pdf').length).toBe(2);
  });

  it('shows the status of a form that is not submitted instead of a tick', () => {
    const text: string = create().nativeElement.querySelector('.sd-cond')?.textContent ?? '';

    expect(text).toContain('Not Started');
    expect(text).toContain('In Progress');
  });

  it('sorts and pages through the API, always from page 1 after a sort', () => {
    const fixture = create();
    ulbsService.getUlbs.calls.reset();

    fixture.componentInstance.onPage({ pageIndex: 2, pageSize: 15, length: 50 });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(jasmine.objectContaining({ page: 3 }));

    fixture.componentInstance.onSort({ active: 'allocation', direction: 'desc' });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ page: 1, sortBy: 'allocation', sortDir: 'desc' }),
    );

    fixture.componentInstance.onSort({ active: 'allocation', direction: '' });
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ sortBy: 'ulbName', sortDir: 'asc' }),
    );
  });

  it('waits for a pause in typing before searching', fakeAsync(() => {
    const fixture = create();
    ulbsService.getUlbs.calls.reset();

    const type = (value: string) => fixture.componentInstance.onSearch({ target: { value } } as unknown as Event);
    type('chi');
    tick(100);
    type('chirala');
    tick(299);
    expect(ulbsService.getUlbs).not.toHaveBeenCalled();

    tick(1);
    expect(ulbsService.getUlbs).toHaveBeenCalledTimes(1);
    expect(ulbsService.getUlbs.calls.mostRecent().args[2]).toEqual(
      jasmine.objectContaining({ search: 'chirala', page: 1 }),
    );
  }));
});
