import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MATERIAL_THEME_CLASS } from '../../../../../core/theming/material-theme.providers';
import { UtilityService } from '../../../../../core/services/utility.service';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AdcService, IAdcRow } from '../../../shared/adc/adc.service';
import { adcDeleteBlockedReason, canDeleteAdc } from '../dialogs/adc-dialog.utils';
import { AdcFormDialogComponent } from '../dialogs/adc-form-dialog/adc-form-dialog.component';
import { ChangeAdminDialogComponent } from '../dialogs/change-admin-dialog/change-admin-dialog.component';
import { AdcActionsMenuComponent } from './adc-actions-menu.component';

const row = (overrides: Partial<IAdcRow> = {}): IAdcRow => ({
  _id: 'a1',
  name: 'Bodoland',
  state: { _id: 's1', name: 'Assam' },
  ulbCount: 0,
  memberCount: 1,
  admin: { _id: 'u1', name: 'A. Das', email: 'a@x.gov.in', isXVIFCProfileVerified: true },
  ...overrides,
});

describe('AdcActionsMenuComponent', () => {
  let fixture: ComponentFixture<AdcActionsMenuComponent>;
  let component: AdcActionsMenuComponent;
  let adcService: jasmine.SpyObj<AdcService>;
  let confirmDialog: jasmine.SpyObj<ConfirmDialogService>;
  let utility: jasmine.SpyObj<UtilityService>;

  function setup(adc: IAdcRow = row()): void {
    adcService = jasmine.createSpyObj<AdcService>('AdcService', ['remove']);
    confirmDialog = jasmine.createSpyObj<ConfirmDialogService>('ConfirmDialogService', ['confirm']);
    utility = jasmine.createSpyObj<UtilityService>('UtilityService', ['triggerSnackbar']);
    TestBed.configureTestingModule({
      imports: [AdcActionsMenuComponent, NoopAnimationsModule],
      providers: [
        { provide: AdcService, useValue: adcService },
        { provide: ConfirmDialogService, useValue: confirmDialog },
        { provide: UtilityService, useValue: utility },
        { provide: MATERIAL_THEME_CLASS, useValue: 'xvifc-theme' },
      ],
    });
    fixture = TestBed.createComponent(AdcActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('adc', adc);
    fixture.detectChanges();
  }

  /** Opens the menu; its panel renders in the overlay container, outside the component. */
  function openMenu(): HTMLElement {
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-test="adc-menu"]')!.click();
    fixture.detectChanges();
    return document.querySelector('.mat-mdc-menu-panel') as HTMLElement;
  }

  it('names the ADC on the menu button for screen readers', () => {
    setup();
    const button = (fixture.nativeElement as HTMLElement).querySelector('[data-test="adc-menu"]');
    expect(button?.getAttribute('aria-label')).toBe('More actions for Bodoland');
  });

  it('lists Rename, Change Admin (or Set Admin) and Delete', () => {
    setup();
    let panel = openMenu();
    expect(panel.querySelector('[data-test="rename"]')?.textContent).toContain('Rename');
    expect(panel.querySelector('[data-test="change-admin"]')?.textContent).toContain('Change Admin');
    expect(panel.querySelector('[data-test="delete"]')).not.toBeNull();
    expect(panel.querySelector('[data-test="delete-reason"]')).toBeNull();

    TestBed.resetTestingModule();
    setup(row({ admin: null, memberCount: 0 }));
    panel = openMenu();
    expect(panel.querySelector('[data-test="change-admin"]')?.textContent).toContain('Set Admin');
  });

  it('shows why Delete is blocked as text, linked to the item, and does nothing on click', () => {
    setup(row({ ulbCount: 4, memberCount: 3 }));
    const panel = openMenu();
    const reason = panel.querySelector('[data-test="delete-reason"]')!;
    const item = panel.querySelector<HTMLButtonElement>('[data-test="delete"]')!;

    expect(reason.textContent?.trim()).toBe('Has 4 ULBs and 2 other members');
    // Still focusable, so a keyboard user can reach and hear the reason.
    expect(item.disabled).toBeFalse();
    expect(item.getAttribute('aria-describedby')).toBe(reason.id);

    item.click();
    expect(confirmDialog.confirm).not.toHaveBeenCalled();
  });

  it('confirms the delete naming the Admin, in the XVI-FC theme, then emits deleted', () => {
    setup();
    confirmDialog.confirm.and.returnValue(of(true));
    adcService.remove.and.returnValue(of({}));
    const deleted = jasmine.createSpy('deleted');
    component.deleted.subscribe(deleted);

    component.confirmDelete();

    const [data, config] = confirmDialog.confirm.calls.mostRecent().args;
    expect(data?.message).toBe(
      'Delete Bodoland (Assam)? Its Admin, A. Das (a@x.gov.in), will lose access. This cannot be undone.',
    );
    expect(config?.panelClass).toBe('xvifc-theme');
    expect(adcService.remove).toHaveBeenCalledWith('a1');
    expect(deleted).toHaveBeenCalled();
  });

  it("shows the server's message when the delete is refused, and does not emit", () => {
    setup();
    confirmDialog.confirm.and.returnValue(of(true));
    adcService.remove.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Move its 2 ULBs first.' } })),
    );
    const deleted = jasmine.createSpy('deleted');
    component.deleted.subscribe(deleted);

    component.confirmDelete();

    expect(utility.triggerSnackbar).toHaveBeenCalledWith('Move its 2 ULBs first.', 'snackbar-danger');
    expect(deleted).not.toHaveBeenCalled();
    expect(component.isDeleting()).toBeFalse();
  });

  it('opens Rename and Change Admin in the XVI-FC theme and emits changed only after a save', () => {
    setup();
    const dialog = (component as unknown as { dialog: MatDialog }).dialog;
    const open = spyOn(dialog, 'open').and.returnValues(
      { afterClosed: () => of(true) } as never,
      { afterClosed: () => of(false) } as never,
    );
    const changed = jasmine.createSpy('changed');
    component.changed.subscribe(changed);

    component.rename();
    component.changeAdmin();

    expect(open.calls.argsFor(0)[0]).toBe(AdcFormDialogComponent as never);
    expect(open.calls.argsFor(0)[1]?.data).toEqual({ mode: 'edit', adc: row() });
    expect(open.calls.argsFor(1)[0]).toBe(ChangeAdminDialogComponent as never);
    open.calls.all().forEach((c) => expect(c.args[1]).toEqual(jasmine.objectContaining({ panelClass: 'xvifc-theme' })));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it('the delete rule: any ULB, or a member besides the Admin, blocks it', () => {
    expect(canDeleteAdc({ ulbCount: 0, memberCount: 1, admin: row().admin })).toBeTrue();
    expect(canDeleteAdc({ ulbCount: 0, memberCount: 0, admin: null })).toBeTrue();
    expect(canDeleteAdc({ ulbCount: 0, memberCount: 1, admin: null })).toBeFalse();
    expect(adcDeleteBlockedReason({ ulbCount: 1, memberCount: 1, admin: row().admin })).toBe('Has 1 ULB');
    expect(adcDeleteBlockedReason({ ulbCount: 0, memberCount: 2, admin: row().admin })).toBe('Has 1 other member');
  });
});
