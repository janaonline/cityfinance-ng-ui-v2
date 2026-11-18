import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../../core/theming/material-theme.providers';
import { UlbMasterService } from '../../../state-module/ulb-list/ulb-master.service';
import { AdcService, IAdcDetail, IAdcMember, IAdcUlb, IPage } from '../../../shared/adc/adc.service';
import { AdcDetailComponent } from './adc-detail.component';

@Component({ template: 'ADC list' })
class ListStubComponent {}

const detail: IAdcDetail = {
  _id: 'a1',
  name: 'Assam ADC',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 4,
  memberCount: 3,
  admin: { _id: 'u1', name: 'Vijay C', email: 'v@x.gov.in', isXVIFCProfileVerified: false },
  createdAt: '2026-10-30T00:00:00.000Z',
};

const emptyPage = <T>(): IPage<T> => ({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

describe('AdcDetailComponent', () => {
  let harness: RouterTestingHarness;
  let component: AdcDetailComponent;
  let adcService: jasmine.SpyObj<AdcService>;

  async function open(url: string, detail$ = of(detail)): Promise<void> {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['detail', 'members', 'ulbs', 'remove']);
    adcService.detail.and.returnValue(detail$);
    adcService.members.and.returnValue(of(emptyPage<IAdcMember>()));
    adcService.ulbs.and.returnValue(of(emptyPage<IAdcUlb>()));
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'adc', component: ListStubComponent },
          { path: 'adc/:id', component: AdcDetailComponent },
        ]),
        { provide: AdcService, useValue: adcService },
        { provide: UlbMasterService, useValue: { getTypes: () => of({ data: [] }) } },
        { provide: MATERIAL_THEME_CLASS, useValue: 'xvifc-theme' },
      ],
    });
    harness = await RouterTestingHarness.create();
    component = await harness.navigateByUrl(url, AdcDetailComponent);
    harness.detectChanges();
  }

  const el = (): HTMLElement => harness.routeNativeElement as HTMLElement;

  it('shows the header: name, state, Admin with its status, created date and the counts', async () => {
    await open('/adc/a1');

    expect(adcService.detail).toHaveBeenCalledWith('a1');
    const text = el().textContent ?? '';
    expect(text).toContain('Assam ADC');
    expect(text).toContain('Assam');
    expect(el().querySelector('[data-test="admin"]')?.textContent).toContain('Invited');
    expect(text).toContain('30 Oct 2026');
    expect(el().querySelector('[data-test="ulbs-chip"]')?.textContent).toContain('4 ULBs');
    expect(el().querySelector('[data-test="members-chip"]')?.textContent).toContain('3 Members');
    expect(el().querySelector('app-adc-actions-menu')).not.toBeNull();
    expect(el().querySelector('app-xvifc-breadcrumb')?.textContent).toContain('Assam ADC');
  });

  it('opens the tab named in the URL and loads only that tab', async () => {
    await open('/adc/a1?tab=ulbs');

    expect(component.tabIndex()).toBe(1);
    expect(adcService.ulbs).toHaveBeenCalled();
    expect(adcService.members).not.toHaveBeenCalled();
  });

  it('defaults to Members for a missing or unknown tab', async () => {
    await open('/adc/a1?tab=history');
    expect(component.tabIndex()).toBe(0);
    expect(adcService.members).toHaveBeenCalled();
  });

  it('writes the chosen tab to the URL without a new history entry', async () => {
    await open('/adc/a1');
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    component.selectTab('ulbs');

    expect(component.tabIndex()).toBe(1);
    expect(navigate.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ queryParams: { tab: 'ulbs' }, replaceUrl: true }),
    );
  });

  it('shows "ADC not found" with a link to the list for an unknown ADC', async () => {
    await open('/adc/a1', throwError(() => new HttpErrorResponse({ status: 404 })));

    expect(component.status()).toBe('not-found');
    expect(el().textContent).toContain('ADC not found');
    expect(el().querySelector('[data-test="not-found-back"]')?.getAttribute('href')).toBe('/adc');
  });

  it('shows a retryable error when the header fails to load', async () => {
    await open('/adc/a1', throwError(() => new HttpErrorResponse({ status: 500 })));
    expect(component.status()).toBe('error');

    adcService.detail.and.returnValue(of(detail));
    component.loadDetail();
    expect(component.status()).toBe('ready');
  });

  it('goes back in history when it came from the list, so the list keeps its filters', async () => {
    await open('/adc/a1');
    const location = TestBed.inject(Location);
    spyOn(location, 'getState').and.returnValue({ fromAdcList: true });
    const back = spyOn(location, 'back');

    // cameFromList is read when the component is created: leave and re-open it with the list's state.
    await harness.navigateByUrl('/adc');
    component = await harness.navigateByUrl('/adc/a1', AdcDetailComponent);
    component.backToList();

    expect(back).toHaveBeenCalled();
  });

  it('opens the list fresh when it was reached directly', async () => {
    await open('/adc/a1');
    const back = spyOn(TestBed.inject(Location), 'back');

    component.backToList();
    await harness.fixture.whenStable();

    expect(back).not.toHaveBeenCalled();
    expect(TestBed.inject(Router).url).toBe('/adc');
  });

  it('reloads the header after a change and returns to the list after a delete', async () => {
    await open('/adc/a1');
    adcService.detail.calls.reset();

    component.onChanged();
    expect(adcService.detail).toHaveBeenCalledWith('a1');
    expect(component.membersVersion()).toBe(1);

    component.onDeleted();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/adc');
  });
});
