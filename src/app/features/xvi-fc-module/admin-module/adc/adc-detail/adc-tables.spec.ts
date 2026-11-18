import { Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { UlbMasterService } from '../../../state-module/ulb-list/ulb-master.service';
import { AdcService, IAdcMember, IAdcUlb, IPage } from '../../../shared/adc/adc.service';
import { AdcMembersTableComponent } from './adc-members-table/adc-members-table.component';
import { AdcUlbsTableComponent } from './adc-ulbs-table/adc-ulbs-table.component';

const pageOf = <T>(data: T[], total = data.length): IPage<T> => ({ data, total, page: 1, limit: 20, totalPages: 1 });

const member: IAdcMember = {
  _id: 'u1',
  name: 'R. Basumatary',
  designation: 'Nodal Officer',
  email: 'r@x.gov.in',
  mobile: '9876543222',
  subRole: 'EDITOR',
  isXVIFCProfileVerified: false,
  lastActive: '2026-11-12T10:00:00.000Z',
};

const ulb: IAdcUlb = {
  _id: 'l1',
  name: 'Kokrajhar Municipal Board',
  code: 'AS012',
  ulbTypeName: 'Municipality',
  district: 'Kokrajhar',
  isActive: true,
  approvalStatus: 'APPROVED',
};

describe('ADC detail tables', () => {
  let adcService: jasmine.SpyObj<AdcService>;

  function configure(): void {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['members', 'ulbs']);
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        { provide: AdcService, useValue: adcService },
        {
          provide: UlbMasterService,
          useValue: { getTypes: () => of({ data: [{ _id: 't1', name: 'Municipality' }] }) },
        },
      ],
    });
  }

  function create<C>(type: Type<C>): ComponentFixture<C> {
    const fixture = TestBed.createComponent(type);
    fixture.componentRef.setInput('adcId', 'a1');
    fixture.detectChanges();
    return fixture;
  }

  const el = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

  describe('Members', () => {
    let fixture: ComponentFixture<AdcMembersTableComponent>;
    let component: AdcMembersTableComponent;

    beforeEach(() => {
      configure();
      adcService.members.and.returnValue(of(pageOf([member])));
      fixture = create(AdcMembersTableComponent);
      component = fixture.componentInstance;
    });

    it('loads page 1 of 20 by name and shows name, designation, level, status and last active', () => {
      expect(adcService.members).toHaveBeenCalledWith('a1', {
        page: 1,
        limit: 20,
        search: undefined,
        level: undefined,
        status: undefined,
        sortBy: 'name',
        sortDir: 1,
      });
      const text = el(fixture).textContent ?? '';
      expect(text).toContain('R. Basumatary');
      expect(text).toContain('Nodal Officer');
      expect(text).toContain('Reviewer');
      expect(text).toContain('Invited');
      expect(text).toContain('12 Nov 2026');
    });

    it('filters by level and status at once, and searches after 400 ms, from page 1', fakeAsync(() => {
      component.page.set(3);
      component.filterForm.controls.level.setValue('EDITOR');
      expect(adcService.members.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ page: 1, level: 'EDITOR' }),
      );
      component.filterForm.controls.status.setValue('INVITED');
      component.filterForm.controls.search.setValue(' 98765 ');
      tick(400);
      expect(adcService.members.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ level: 'EDITOR', status: 'INVITED', search: '98765' }),
      );
    }));

    it('sorts by last active on the server', () => {
      component.onSortChange({ active: 'lastActive', direction: 'desc' });
      expect(adcService.members.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ sortBy: 'lastActive', sortDir: -1, page: 1 }),
      );
    });

    it('pages with the chosen size', () => {
      component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
      expect(adcService.members.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ page: 2, limit: 10 }));
    });

    it('tells "no members" apart from "no match", and Clear resets with one reload', () => {
      adcService.members.and.returnValue(of(pageOf<IAdcMember>([])));
      component.load();
      fixture.detectChanges();
      expect(el(fixture).querySelector('[data-test="empty"]')).not.toBeNull();

      component.filterForm.controls.level.setValue('VIEWER');
      fixture.detectChanges();
      expect(el(fixture).querySelector('[data-test="empty-filtered"]')).not.toBeNull();

      adcService.members.calls.reset();
      component.clearFilters();
      fixture.detectChanges();
      expect(adcService.members).toHaveBeenCalledTimes(1);
      expect(component.filterForm.getRawValue()).toEqual({ search: '', level: '', status: '' });
      expect(el(fixture).querySelector('[data-test="empty"]')).not.toBeNull();
    });

    it('shows an error with Retry', () => {
      adcService.members.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
      component.load();
      fixture.detectChanges();
      expect(component.loadError()).toBe('Unable to load members. Please try again.');
      expect(el(fixture).textContent).toContain('Retry');
    });

    it('reloads in place, keeping its filters, when refreshKey changes', () => {
      component.filterForm.controls.level.setValue('ADMIN');
      adcService.members.calls.reset();
      fixture.componentRef.setInput('refreshKey', 1);
      fixture.detectChanges();
      expect(adcService.members).toHaveBeenCalledOnceWith('a1', jasmine.objectContaining({ level: 'ADMIN' }));
    });
  });

  describe('ULBs', () => {
    let fixture: ComponentFixture<AdcUlbsTableComponent>;
    let component: AdcUlbsTableComponent;

    beforeEach(() => {
      configure();
      adcService.ulbs.and.returnValue(of(pageOf([ulb])));
      fixture = create(AdcUlbsTableComponent);
      component = fixture.componentInstance;
    });

    it('loads by name and shows the ULB, code, type, district, registration and active', () => {
      expect(adcService.ulbs).toHaveBeenCalledWith('a1', {
        page: 1,
        limit: 20,
        search: undefined,
        ulbType: undefined,
        approvalStatus: undefined,
        isActive: undefined,
        sortBy: 'name',
        sortDir: 1,
      });
      const text = el(fixture).textContent ?? '';
      for (const value of ['Kokrajhar Municipal Board', 'AS012', 'Municipality', 'Kokrajhar', 'Approved', 'Yes']) {
        expect(text).toContain(value);
      }
      expect(component.ulbTypes().map((t) => t.name)).toEqual(['Municipality']);
    });

    it('sends type, registration and Active = No as a real false', () => {
      component.filterForm.controls.ulbType.setValue('t1');
      component.filterForm.controls.approvalStatus.setValue('PENDING');
      component.filterForm.controls.isActive.setValue('false');
      expect(adcService.ulbs.calls.mostRecent().args[1]).toEqual(
        jasmine.objectContaining({ ulbType: 't1', approvalStatus: 'PENDING', isActive: false, page: 1 }),
      );
    });

    it('searches by code after 400 ms and sorts by code', fakeAsync(() => {
      component.filterForm.controls.search.setValue('AS01');
      tick(400);
      expect(adcService.ulbs.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ search: 'AS01' }));

      component.onSortChange({ active: 'code', direction: 'asc' });
      expect(adcService.ulbs.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ sortBy: 'code', sortDir: 1 }));
    }));

    it('shows a no-match state with Clear when filters hide everything', () => {
      adcService.ulbs.and.returnValue(of(pageOf<IAdcUlb>([])));
      component.filterForm.controls.isActive.setValue('false');
      fixture.detectChanges();
      expect(el(fixture).querySelector('[data-test="empty-filtered"]')?.textContent).toContain('No ULBs match');
    });
  });
});
