import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { AdcService, IAdcManageQuery, IAdcPage, IAdcRow } from '../../shared/adc/adc.service';
import { AdcListComponent } from './adc-list.component';
import { AdcFormDialogComponent } from './dialogs/adc-form-dialog/adc-form-dialog.component';

const S1 = 'aaaaaaaaaaaaaaaaaaaaaaaa';

const row = (overrides: Partial<IAdcRow> = {}): IAdcRow => ({
  _id: 'a1',
  name: 'Bodoland Territorial Council',
  state: { _id: S1, name: 'Assam' },
  ulbCount: 0,
  memberCount: 1,
  admin: { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', isXVIFCProfileVerified: true },
  ...overrides,
});

const pageOf = (rows: IAdcRow[], total = rows.length): IAdcPage => ({
  data: rows,
  total,
  page: 1,
  limit: 20,
  totalPages: 1,
});

const defaults: IAdcManageQuery = {
  page: 1,
  limit: 20,
  stateId: undefined,
  search: undefined,
  adminStatus: undefined,
  sortBy: 'name',
  sortDir: 1,
};

describe('AdcListComponent', () => {
  let harness: RouterTestingHarness;
  let component: AdcListComponent;
  let adcService: jasmine.SpyObj<AdcService>;
  let navigate: jasmine.Spy;

  /** Opens /adc with the given query through the real router (the rows' RouterLinks need a real route). */
  async function setup(rows: IAdcRow[] = [row()], query: Record<string, string> = {}): Promise<void> {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['manage', 'remove']);
    adcService.manage.and.returnValue(of(pageOf(rows)));

    TestBed.configureTestingModule({
      imports: [AdcListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'adc', component: AdcListComponent }]),
        { provide: AdcService, useValue: adcService },
        { provide: StateService, useValue: { getStates: () => of({ data: [{ _id: S1, name: 'Assam' }] }) } },
        { provide: UtilityService, useValue: jasmine.createSpyObj('UtilityService', ['triggerSnackbar']) },
        { provide: MATERIAL_THEME_CLASS, useValue: 'xvifc-theme' },
      ],
    });
    // writeUrl() uses navigate(); the harness opens the page with navigateByUrl().
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    harness = await RouterTestingHarness.create();
    const search = new URLSearchParams(query).toString();
    component = await harness.navigateByUrl(`/adc${search ? '?' + search : ''}`, AdcListComponent);
  }

  const el = (): HTMLElement => harness.routeNativeElement as HTMLElement;
  const detectChanges = (): void => harness.detectChanges();
  const lastQueryParams = (): Record<string, unknown> =>
    (navigate.calls.mostRecent().args[1] as { queryParams: Record<string, unknown> }).queryParams;

  it('loads page 1 of 20, sorted by name, and shows the rows and the size options', async () => {
    await setup();

    expect(adcService.manage).toHaveBeenCalledWith(defaults);
    expect(component.pageSizeOptions).toEqual([10, 20]);
    expect(el().textContent).toContain('Bodoland Territorial Council');
    expect(el().textContent).toContain('A. Das');
  });

  it('gives each row a View link and one actions menu, not three buttons', async () => {
    await setup([row(), row({ _id: 'a2', name: 'Dima Hasao' })]);

    expect(el().querySelectorAll('[data-test="view"]').length).toBe(2);
    expect(el().querySelectorAll('app-adc-actions-menu').length).toBe(2);
    expect(el().querySelector('[data-test="view"]')?.getAttribute('href')).toContain('/a1');
  });

  it('links a non-zero ULB or member count to the matching tab, and leaves a 0 as text', async () => {
    await setup([row({ ulbCount: 4, memberCount: 3 }), row({ _id: 'a2', ulbCount: 0, memberCount: 0, admin: null })]);

    const ulbLinks = el().querySelectorAll<HTMLAnchorElement>('[data-test="ulb-count-link"]');
    const memberLinks = el().querySelectorAll<HTMLAnchorElement>('[data-test="member-count-link"]');
    expect(ulbLinks.length).toBe(1);
    expect(memberLinks.length).toBe(1);
    expect(ulbLinks[0].getAttribute('href')).toContain('tab=ulbs');
    expect(memberLinks[0].getAttribute('href')).toContain('tab=members');
  });

  it('marks an unverified Admin as Invited and a missing one as Not set', async () => {
    await setup([
      row({ admin: { _id: 'u1', name: 'S. Teron', email: 's@x.gov.in', isXVIFCProfileVerified: false } }),
      row({ _id: 'a2', name: 'Dima Hasao', memberCount: 0, admin: null }),
    ]);
    expect(el().textContent).toContain('Invited');
    expect(el().textContent).toContain('Not set');
  });

  it('reloads from page 1 on a filter change and on the debounced search', fakeAsync(() => {
    void setup();
    tick();
    component.page.set(3);

    component.filterForm.controls.stateId.setValue(S1);
    expect(adcService.manage).toHaveBeenCalledWith({ ...defaults, stateId: S1 });

    component.filterForm.controls.adminStatus.setValue('INVITED');
    expect(adcService.manage).toHaveBeenCalledWith({ ...defaults, stateId: S1, adminStatus: 'INVITED' });

    component.filterForm.controls.search.setValue('  das@  ');
    tick(400);
    expect(adcService.manage).toHaveBeenCalledWith({
      ...defaults,
      stateId: S1,
      adminStatus: 'INVITED',
      search: 'das@',
    });
  }));

  it('sorts on the server, back on page 1', async () => {
    await setup();
    component.page.set(2);

    component.onSortChange({ active: 'ulbCount', direction: 'desc' });

    expect(adcService.manage).toHaveBeenCalledWith({ ...defaults, sortBy: 'ulbCount', sortDir: -1 });
    expect(lastQueryParams()).toEqual(jasmine.objectContaining({ sortBy: 'ulbCount', sortDir: -1, page: null }));
  });

  it('keeps filters, sort and page in the URL, leaving defaults out', async () => {
    await setup();
    expect(lastQueryParams()).toEqual({
      state: null,
      search: null,
      adminStatus: null,
      sortBy: null,
      sortDir: null,
      page: null,
      limit: null,
    });
    expect(navigate.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ replaceUrl: true }));

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
    expect(lastQueryParams()).toEqual(jasmine.objectContaining({ page: 2, limit: 10 }));
  });

  it('opens with the filters, sort and page from the URL', async () => {
    await setup([row()], { state: S1, search: 'bodo', adminStatus: 'NOT_SET', sortBy: 'memberCount', sortDir: '-1', page: '2', limit: '10' });

    expect(adcService.manage).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      stateId: S1,
      search: 'bodo',
      adminStatus: 'NOT_SET',
      sortBy: 'memberCount',
      sortDir: -1,
    });
    expect(component.filterForm.getRawValue()).toEqual({ stateId: S1, search: 'bodo', adminStatus: 'NOT_SET' });
  });

  it('ignores bad URL values and clamps a page size over 20', async () => {
    await setup([row()], { state: 'x', adminStatus: 'NOPE', sortBy: 'admin', page: '-3', limit: '50' });
    expect(adcService.manage).toHaveBeenCalledWith(defaults);

    TestBed.resetTestingModule();
    await setup([row()], { limit: 'abc' });
    expect(adcService.manage).toHaveBeenCalledWith(defaults);
  });

  it('shows Clear while a filter is set, and Clear resets everything with one reload', async () => {
    await setup([row()], { search: 'bodo', adminStatus: 'ACTIVE' });
    expect(el().querySelector('[data-test="clear-filters"]')).not.toBeNull();
    adcService.manage.calls.reset();

    component.clearFilters();
    detectChanges();

    expect(adcService.manage).toHaveBeenCalledOnceWith(defaults);
    expect(el().querySelector('[data-test="clear-filters"]')).toBeNull();
  });

  it('tells "no ADCs yet" apart from "no match for these filters"', async () => {
    await setup([]);
    expect(el().querySelector('[data-test="empty"]')).not.toBeNull();

    TestBed.resetTestingModule();
    await setup([], { search: 'zzz' });
    expect(el().querySelector('[data-test="empty-filtered"]')?.textContent).toContain('No ADCs match these filters');
  });

  it('steps back to the last page when the page asked for is past the end', async () => {
    await setup();
    adcService.manage.and.returnValues(of(pageOf([], 21)), of(pageOf([row()], 21)));
    component.page.set(5);
    component.loadRows();
    expect(adcService.manage.calls.mostRecent().args[0].page).toBe(2);
  });

  it('shows the error with a Retry when the list fails', async () => {
    await setup();
    adcService.manage.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.loadRows();
    detectChanges();
    expect(component.loadError()).toBe('Unable to load ADCs. Please try again.');
    expect(el().textContent).toContain('Retry');
  });

  it('opens Add ADC in the XVI-FC theme and reloads after a save', async () => {
    await setup();
    const dialog = (component as unknown as { dialog: MatDialog }).dialog;
    const open = spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as never);
    adcService.manage.calls.reset();

    component.openAdd();

    expect(open.calls.mostRecent().args[0]).toBe(AdcFormDialogComponent as never);
    expect(open.calls.mostRecent().args[1]).toEqual(
      jasmine.objectContaining({ data: { mode: 'create' }, panelClass: 'xvifc-theme', disableClose: true }),
    );
    expect(adcService.manage).toHaveBeenCalledTimes(1);
  });
});
