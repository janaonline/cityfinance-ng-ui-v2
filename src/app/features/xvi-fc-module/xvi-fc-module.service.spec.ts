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

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);
    mockAuthService = {
      logout: jasmine.createSpy('logout'),
      loginLogoutCheck: new Subject<boolean>(),
    };

    TestBed.configureTestingModule({ imports: [HttpClientTestingModule, RouterTestingModule], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        XvifcModuleService,
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: XviFcSideMenuApiService,
          useValue: {
            getSideMenu: ({ role, yearId }: { role: keyof typeof SIDE_MENU_ITEMS; yearId: string }) =>
              of(SIDE_MENU_ITEMS[role](yearId as any)),
          },
        },
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
    expect(service.availableYearIds).toEqual(['2026-27', '2027-28', '2028-29', '2029-30']);
  });

  it('should sync the deepest valid role and yearId from the route tree', async () => {
    const child = createRouteSnapshot({ role: 'STATE', yearId: '2027-28' });
    const root = createRouteSnapshot({ role: 'ULB', yearId: '2026-27', firstChild: child });

    service.syncContextFromRoute(root);
    (TestBed as any).flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.role()).toBe('STATE');
    expect(service.yearId()).toBe('2027-28');
    expect(service.sideMenuModel()).toEqual(SIDE_MENU_ITEMS.STATE('2027-28'));
  });

  it('should keep DOE as a supported role for future routes', async () => {
    const snapshot = createRouteSnapshot({ role: 'DOE', yearId: '2028-29' });

    service.syncContextFromRoute(snapshot);
    (TestBed as any).flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    expect(service.role()).toBe('DOE');
    expect(service.yearId()).toBe('2028-29');
    expect(service.sideMenuModel()).toEqual(SIDE_MENU_ITEMS.DOE('2028-29'));
  });

  it('should clear stale context, clear auth details, and redirect when role is missing', () => {
    const logoutEventSpy = spyOn(Login_Logout, 'logout');
    const loginLogoutNextSpy = spyOn(mockAuthService.loginLogoutCheck, 'next');
    const sessionStorageClearSpy = spyOn(sessionStorage, 'clear');

    service.syncContextFromRoute(createRouteSnapshot({ role: 'ULB', yearId: '2026-27' }));
    service.syncContextFromRoute(createRouteSnapshot({ yearId: '2026-27' }));

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

    service.syncContextFromRoute(createRouteSnapshot({ role: 'NOT_A_ROLE', yearId: '2026-27' }));

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
    service.syncContextFromRoute(createRouteSnapshot({ role: 'STATE', yearId: '2029-30' }));

    service.clearResolvedContext();

    expect(service.role()).toBeNull();
    expect(service.yearId()).toBeNull();
    expect(service.sideMenuModel()).toEqual({ topModel: [], bottomModel: [] });
  });
});
