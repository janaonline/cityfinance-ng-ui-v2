import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterOutlet,
} from '@angular/router';
import { Subject } from 'rxjs';
import { MenuItem, SideBarModel } from '../../shared/components/side-menu/interface';
import { XviFcModuleComponent } from './xvi-fc-module.component';
import { XvifcModuleService } from './xvi-fc-module.service';
import { Roles, XvifcYearId } from './xvi-fc-side-menu.config';

@Component({
  selector: 'app-menu',
  standalone: true,
  template: '<div data-testid="app-menu-stub"></div>',
})
class AppMenuStubComponent {
  @Input() model!: SideBarModel;
}

describe('XviFcModuleComponent', () => {
  let fixture: ComponentFixture<XviFcModuleComponent>;
  let component: XviFcModuleComponent;
  let mockXvifcService: {
    syncContextFromRoute: jasmine.Spy;
    role: ReturnType<typeof signal<Roles | null>>;
    yearId: ReturnType<typeof signal<XvifcYearId | null>>;
    sideMenuModel: ReturnType<typeof signal<SideBarModel>>;
  };

  let routerEvent$: Subject<unknown>;
  let mockRouter: { events: Subject<unknown> };
  let mockActivatedRoute: { snapshot: ActivatedRouteSnapshot };

  const sidebarModel: SideBarModel = {
    topModel: [{ label: 'Dashboard', routerLink: ['/dashboard'] }] as MenuItem[],
    bottomModel: [{ label: 'Logout', routerLink: ['/logout'] }] as MenuItem[],
  };

  beforeEach(async () => {
    routerEvent$ = new Subject<unknown>();
    mockRouter = { events: routerEvent$ };
    mockActivatedRoute = {
      snapshot: { some: 'snapshot' } as unknown as ActivatedRouteSnapshot,
    };

    mockXvifcService = {
      syncContextFromRoute: jasmine.createSpy('syncContextFromRoute'),
      role: signal<Roles | null>('STATE'),
      yearId: signal<XvifcYearId | null>('2026-27'),
      sideMenuModel: signal<SideBarModel>(sidebarModel),
    };

    await TestBed.configureTestingModule({ imports: [HttpClientTestingModule, XviFcModuleComponent, AppMenuStubComponent, RouterOutlet], providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }, { provide: MAT_DIALOG_DATA, useValue: {} }, 
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        {
          provide: XvifcModuleService,
          useValue: mockXvifcService as unknown as XvifcModuleService,
        },
      ],
    })
      .overrideComponent(XviFcModuleComponent, {
        set: { imports: [HttpClientTestingModule, AppMenuStubComponent, RouterOutlet] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(XviFcModuleComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => routerEvent$.complete());

  it('should create component', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should sync the service context once on init', () => {
    expect(mockXvifcService.syncContextFromRoute).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(mockXvifcService.syncContextFromRoute).toHaveBeenCalledTimes(1);
  });

  it('should call syncContextFromRoute with the current route snapshot', () => {
    const snapshot = mockActivatedRoute.snapshot;

    fixture.detectChanges();

    expect(mockXvifcService.syncContextFromRoute).toHaveBeenCalledWith(snapshot);
  });

  it('should read role, yearId, and menu model from the service signals', () => {
    fixture.detectChanges();

    expect(component.role()).toBe('STATE');
    expect(component.yearId()).toBe('2026-27');
    expect(component.model()).toEqual(sidebarModel);
  });

  it('should sync the service context again on NavigationEnd', () => {
    fixture.detectChanges();
    mockXvifcService.syncContextFromRoute.calls.reset();

    routerEvent$.next(new NavigationEnd(1, '/from', '/to'));

    expect(mockXvifcService.syncContextFromRoute).toHaveBeenCalledTimes(1);
  });

  it('should ignore router events that are not NavigationEnd', () => {
    fixture.detectChanges();
    mockXvifcService.syncContextFromRoute.calls.reset();

    routerEvent$.next({ type: 'something' });

    expect(mockXvifcService.syncContextFromRoute).not.toHaveBeenCalled();
  });

  it('should render the app-menu stub component', () => {
    fixture.detectChanges();

    const menuEl = fixture.nativeElement.querySelector('[data-testid="app-menu-stub"]');
    expect(menuEl).toBeTruthy();
  });

  it('should pass the current service-owned model to app-menu', () => {
    fixture.detectChanges();

    const menuDebugEl = fixture.debugElement.query(By.directive(AppMenuStubComponent));
    const menuComponent = menuDebugEl.componentInstance as AppMenuStubComponent;

    expect(menuComponent.model).toEqual(sidebarModel);
  });

  it('should render a router-outlet', () => {
    fixture.detectChanges();

    const outlet = fixture.nativeElement.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should add the XVIFC theme class to the host element', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.classList.contains('xvifc-theme')).toBeTrue();
  });
});
