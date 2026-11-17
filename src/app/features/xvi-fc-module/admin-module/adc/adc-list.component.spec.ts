import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../core/theming/material-theme.providers';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AdcService, IAdcPage, IAdcRow } from '../../shared/adc/adc.service';
import { AdcListComponent } from './adc-list.component';
import { AdcFormDialogComponent } from './dialogs/adc-form-dialog/adc-form-dialog.component';
import { ChangeAdminDialogComponent } from './dialogs/change-admin-dialog/change-admin-dialog.component';

const row = (overrides: Partial<IAdcRow> = {}): IAdcRow => ({
  _id: 'a1',
  name: 'Bodoland Territorial Council',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 0,
  memberCount: 1,
  admin: { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', isXVIFCProfileVerified: true },
  ...overrides,
});

const pageOf = (rows: IAdcRow[]): IAdcPage => ({ data: rows, total: rows.length, page: 1, limit: 20, totalPages: 1 });

describe('AdcListComponent', () => {
  let fixture: ComponentFixture<AdcListComponent>;
  let component: AdcListComponent;
  let adcService: jasmine.SpyObj<AdcService>;
  let confirmDialog: jasmine.SpyObj<ConfirmDialogService>;
  let utility: jasmine.SpyObj<UtilityService>;

  function setup(rows: IAdcRow[] = [row()]): void {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['manage', 'remove']);
    adcService.manage.and.returnValue(of(pageOf(rows)));
    confirmDialog = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    utility = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);

    TestBed.configureTestingModule({
      imports: [AdcListComponent, NoopAnimationsModule],
      providers: [
        { provide: AdcService, useValue: adcService },
        { provide: StateService, useValue: { getStates: () => of({ data: [{ _id: 's1', name: 'Assam' }] }) } },
        { provide: ConfirmDialogService, useValue: confirmDialog },
        { provide: UtilityService, useValue: utility },
        { provide: MATERIAL_THEME_CLASS, useValue: 'xvifc-theme' },
      ],
    });

    fixture = TestBed.createComponent(AdcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const text = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const dialogOf = (): MatDialog => (component as unknown as { dialog: MatDialog }).dialog;

  it('loads page 1 of 20 on open and shows the rows, states and paginator options', () => {
    setup();

    expect(adcService.manage).toHaveBeenCalledWith({ page: 1, limit: 20, stateId: undefined, search: undefined });
    expect(component.states().map((s) => s.name)).toEqual(['Assam']);
    expect(component.pageSizeOptions).toEqual([10, 20]);
    expect(text()).toContain('Bodoland Territorial Council');
    expect(text()).toContain('A. Das');
  });

  it('marks an unverified Admin as Invited, and offers Set Admin when there is no Admin', () => {
    setup([
      row({ _id: 'a1', admin: { _id: 'u1', name: 'S. Teron', email: 's@x.gov.in', isXVIFCProfileVerified: false } }),
      row({ _id: 'a2', name: 'Dima Hasao', memberCount: 0, admin: null }),
    ]);

    expect(text()).toContain('Invited');
    expect(text()).toContain('Not set');
    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[data-test="change-admin"]')).map(
      (b) => b.textContent?.trim(),
    );
    expect(labels).toEqual(['Change Admin', 'Set Admin']);
  });

  it('reloads from page 1 when the state filter or the debounced search changes', fakeAsync(() => {
    setup();
    component.page.set(3);

    component.filterForm.controls.stateId.setValue('s1');
    expect(adcService.manage).toHaveBeenCalledWith({ page: 1, limit: 20, stateId: 's1', search: undefined });

    component.filterForm.controls.search.setValue('  bodo  ');
    tick(400);
    expect(adcService.manage).toHaveBeenCalledWith({ page: 1, limit: 20, stateId: 's1', search: 'bodo' });
  }));

  it('asks for the next page with the chosen page size', () => {
    setup();
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
    expect(adcService.manage).toHaveBeenCalledWith({ page: 2, limit: 10, stateId: undefined, search: undefined });
  });

  it('shows the error with a Retry when the list fails', () => {
    setup();
    adcService.manage.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    component.loadRows();
    fixture.detectChanges();
    expect(component.loadError()).toBe('Unable to load ADCs. Please try again.');
    expect(text()).toContain('Retry');
  });

  it('allows Delete only while the ADC has no ULB and no member other than its Admin', () => {
    setup([row({ _id: 'a1' }), row({ _id: 'a2', ulbCount: 3 }), row({ _id: 'a3', memberCount: 2 })]);

    expect(component.canDelete(row({ memberCount: 0, admin: null }))).toBeTrue();
    expect(component.canDelete(row({ memberCount: 1, admin: null }))).toBeFalse();
    expect(component.deleteTooltip(row({ ulbCount: 12, memberCount: 4 }))).toBe(
      'Move or remove its 12 ULBs and 3 other members first.',
    );

    const disabled = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('[data-test="delete"]'),
    ).map((b) => b.disabled);
    expect(disabled).toEqual([false, true, true]);
  });

  it('confirms the delete naming the Admin, in the XVI-FC theme, then deletes and reloads', () => {
    setup();
    confirmDialog.confirm.and.returnValue(of(true));
    adcService.remove.and.returnValue(of({}));
    adcService.manage.calls.reset();

    component.confirmDelete(row());

    const [data, config] = confirmDialog.confirm.calls.mostRecent().args;
    expect(data?.message).toBe(
      'Delete Bodoland Territorial Council (Assam)? Its Admin, A. Das (a@x.gov.in), will lose access. This cannot be undone.',
    );
    expect(data?.confirmButtonColor).toBe('warn');
    expect(config?.panelClass).toBe('xvifc-theme');
    expect(adcService.remove).toHaveBeenCalledWith('a1');
    expect(adcService.manage).toHaveBeenCalled();
  });

  it('does nothing when the delete is cancelled', () => {
    setup();
    confirmDialog.confirm.and.returnValue(of(false));
    component.confirmDelete(row());
    expect(adcService.remove).not.toHaveBeenCalled();
  });

  it("shows the server's message as a toast when the delete is refused (409)", () => {
    setup();
    confirmDialog.confirm.and.returnValue(of(true));
    adcService.remove.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { code: 'ADC_IN_USE', message: 'Move its 2 ULBs first.' },
          }),
      ),
    );

    component.confirmDelete(row());

    expect(utility.triggerSnackbar).toHaveBeenCalledWith('Move its 2 ULBs first.', 'snackbar-danger');
    expect(component.deletingId()).toBeNull();
  });

  it('opens the Add, Edit and Change Admin dialogs in the XVI-FC theme and reloads after a save', () => {
    setup();
    const open = spyOn(dialogOf(), 'open').and.returnValue({ afterClosed: () => of(true) } as never);
    adcService.manage.calls.reset();

    component.openAdd();
    component.openEdit(row());
    component.openChangeAdmin(row());

    const calls = open.calls.all();
    expect(calls.map((c) => c.args[0])).toEqual([
      AdcFormDialogComponent,
      AdcFormDialogComponent,
      ChangeAdminDialogComponent,
    ] as never[]);
    calls.forEach((c) =>
      expect(c.args[1]).toEqual(jasmine.objectContaining({ panelClass: 'xvifc-theme', disableClose: true, width: '600px' })),
    );
    expect(calls[0].args[1]?.data).toEqual({ mode: 'create' });
    expect(adcService.manage).toHaveBeenCalledTimes(3);
  });
});
