import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Login_Logout } from '../../core/util/logout.util';
import { SIDE_MENU_ITEMS } from './temp';
import { XvifcModuleService } from './xvi-fc-module.service';
import { XviFcSideMenuApiService } from './xvi-fc-side-menu.service';
import { XVIFC_LANDING_ROUTE } from './xvi-fc-side-menu.config';

describe('XvifcModuleService', () => {
  let service: XvifcModuleService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: { logout: jasmine.Spy; loginLogoutCheck: Subject<boolean> };
  let getSideMenuSpy: jasmine.Spy;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);
    mockAuthService = {
      logout: jasmine.createSpy('logout'),
      loginLogoutCheck: new Subject<boolean>(),
    };
    // Default behavior matches the pre-existing tests below (resolves immediately); individual
    // tests may override with `.and.returnValue(...)` to control response timing (see the
    // "exactly once" regression test, which needs a genuinely pending response to reproduce the
    // race a synchronous `of(...)` response can't).
    getSideMenuSpy = jasmine
      .createSpy('getSideMenu')
      .and.callFake(({ role, yearId }: { role: keyof typeof SIDE_MENU_ITEMS; yearId: string }) =>
        of(SIDE_MENU_ITEMS[role](yearId as any)),
      );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: { close: () => undefined } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        XvifcModuleService,
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        { provide: XviFcSideMenuApiService, useValue: { getSideMenu: getSideMenuSpy } },
      ],
    });

    service = TestBed.inject(XvifcModuleService);
  });

  function createRouteSnapshot(options?: {
    role?: unknown;
    yearId?: string | null;
    firstChild?: ActivatedRouteSnapshot | null;
  }): ActivatedRouteSnapshot {
    const data = options?.role !== undefined ? { role: options.role } : {};
    const paramMap = convertToParamMap(
      options?.yearId !== undefined && options?.yearId !== null ? { yearId: options.yearId } : {},
    );

    return {
      data,
      paramMap,
      firstChild: options?.firstChild ?? null,
    } as ActivatedRouteSnapshot;
  }

  it('should expose the configured list of year options', () => {
    expect(service.availableYearIds).toEqual([
      '67d7d136d3d038946a5239e9',
      '69de2593f75f68f3bda51421',
      '69de2593f75f68f3bda51422',
      '69de2593f75f68f3bda51423',
      '69de2593f75f68f3bda51424',
    ]);
  });

  it('should sync the deepest valid role and yearId from the route tree', async () => {
    const child = createRouteSnapshot({ role: 'STATE', yearId: '69de2593f75f68f3bda51421' });
    const root = createRouteSnapshot({ role: 'ULB', yearId: '67d7d136d3d038946a5239e9', firstChild: child });

    service.syncContextFromRoute(root);
    (TestBed as any).flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.role()).toBe('STATE');
    expect(service.yearId()).toBe('69de2593f75f68f3bda51421');
    // Service currently overrides bottomModel to [] — check topModel directly.
    expect(service.sideMenuModel().topModel).toEqual(SIDE_MENU_ITEMS.STATE('69de2593f75f68f3bda51421').topModel);
    expect(service.sideMenuModel().bottomModel).toEqual([]);
  });

  it('should call the side-menu API exactly once per context, even while the response is still pending', async () => {
    // A synchronous `of(...)` response (the default mock, and the other tests below) can't
    // reproduce this race: `loadSideMenu`'s dedupe guard only blocks a repeat call once
    // `sideMenuModel().topModel.length > 0`, which is only true after this response resolves. A
    // pending Subject keeps that window open long enough to catch a regression of the effect
    // re-triggering itself before the first response lands (see xvi-fc-module.service.ts's
    // `untracked(...)` call and its doc comment for the mechanism this guards against).
    const response$ = new Subject<ReturnType<(typeof SIDE_MENU_ITEMS)['STATE']>>();
    getSideMenuSpy.and.returnValue(response$);

    service.syncContextFromRoute(createRouteSnapshot({ role: 'STATE', yearId: '69de2593f75f68f3bda51421' }));
    (TestBed as any).flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(getSideMenuSpy).toHaveBeenCalledTimes(1);

    response$.next(SIDE_MENU_ITEMS.STATE('69de2593f75f68f3bda51421'));
    response$.complete();
    await Promise.resolve();
    await Promise.resolve();

    expect(getSideMenuSpy).toHaveBeenCalledTimes(1);
    expect(service.sideMenuModel().topModel).toEqual(SIDE_MENU_ITEMS.STATE('69de2593f75f68f3bda51421').topModel);
  });

  it('should keep DOE as a supported role for future routes', async () => {
    const snapshot = createRouteSnapshot({ role: 'DOE', yearId: '69de2593f75f68f3bda51422' });

    service.syncContextFromRoute(snapshot);
    (TestBed as any).flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.role()).toBe('DOE');
    expect(service.yearId()).toBe('69de2593f75f68f3bda51422');
    expect(service.sideMenuModel()).toEqual(SIDE_MENU_ITEMS.DOE('69de2593f75f68f3bda51422'));
  });

  it('should clear stale context, clear auth details, and redirect when role is missing', () => {
    const logoutEventSpy = spyOn(Login_Logout, 'logout');
    const loginLogoutNextSpy = spyOn(mockAuthService.loginLogoutCheck, 'next');
    const sessionStorageClearSpy = spyOn(sessionStorage, 'clear');

    service.syncContextFromRoute(createRouteSnapshot({ role: 'ULB', yearId: '67d7d136d3d038946a5239e9' }));
    service.syncContextFromRoute(createRouteSnapshot({ yearId: '67d7d136d3d038946a5239e9' }));

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(service.sideMenuModel()).toEqual({ topModel: [], bottomModel: [] });
    expect(loginLogoutNextSpy).toHaveBeenCalledWith(false);
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(sessionStorageClearSpy).toHaveBeenCalled();
    expect(logoutEventSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([...XVIFC_LANDING_ROUTE], {
      replaceUrl: true,
    });
  });

  it('should redirect when role is malformed', () => {
    const logoutEventSpy = spyOn(Login_Logout, 'logout');

    service.syncContextFromRoute(createRouteSnapshot({ role: 'NOT_A_ROLE', yearId: '67d7d136d3d038946a5239e9' }));

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(logoutEventSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([...XVIFC_LANDING_ROUTE], {
      replaceUrl: true,
    });
  });

  it('should redirect when yearId is malformed', () => {
    const logoutEventSpy = spyOn(Login_Logout, 'logout');

    service.syncContextFromRoute(createRouteSnapshot({ role: 'ULB', yearId: '2025' }));

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(logoutEventSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([...XVIFC_LANDING_ROUTE], {
      replaceUrl: true,
    });
  });

  it('should redirect when yearId is missing', () => {
    const logoutEventSpy = spyOn(Login_Logout, 'logout');

    service.syncContextFromRoute(createRouteSnapshot({ role: 'MOHUA' }));

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(logoutEventSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([...XVIFC_LANDING_ROUTE], {
      replaceUrl: true,
    });
  });

  it('should allow consumers to clear the resolved context explicitly', () => {
    service.syncContextFromRoute(createRouteSnapshot({ role: 'STATE', yearId: '69de2593f75f68f3bda51423' }));

    service.clearResolvedContext();

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(service.sideMenuModel()).toEqual({ topModel: [], bottomModel: [] });
  });
});
