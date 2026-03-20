import { Component, Input } from '@angular/core';
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
import { XvifcModuleService } from './xvifc-module.service';
import { Roles } from './xvifc-side-menu.config';

// Fake app-menu component.
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
  let mockXvifcService: jasmine.SpyObj<XvifcModuleService>;

  let routerEvent$: Subject<unknown>;
  let mockRouter: { events: Subject<unknown> };
  let mockActivatedRoute: { snapshot: ActivatedRouteSnapshot };

  const resolvedRouteData: { role: Roles; yearId: string } = {
    role: 'STATE',
    yearId: '2025',
  };
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

    mockXvifcService = jasmine.createSpyObj<XvifcModuleService>('XvifcModuleService', [
      'resolveRoleAndYearFromRoute',
      'getSideMenuItems',
    ]);

    mockXvifcService.resolveRoleAndYearFromRoute.and.returnValue(resolvedRouteData);
    mockXvifcService.getSideMenuItems.and.returnValue(sidebarModel);

    await TestBed.configureTestingModule({
      imports: [XviFcModuleComponent, AppMenuStubComponent, RouterOutlet],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: XvifcModuleService, useValue: mockXvifcService },
      ],
    })
      .overrideComponent(XviFcModuleComponent, {
        set: { imports: [AppMenuStubComponent, RouterOutlet] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(XviFcModuleComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => routerEvent$.complete());

  it('should create component', () => {
    // Arrange
    // done in beforeEach

    // Act
    fixture.detectChanges();

    // Assert
    expect(component).toBeTruthy();
  });

  it('should sync the menu once on init', () => {
    expect(mockXvifcService.resolveRoleAndYearFromRoute).not.toHaveBeenCalled();
    expect(mockXvifcService.getSideMenuItems).not.toHaveBeenCalled();

    fixture.detectChanges();

    expect(mockXvifcService.resolveRoleAndYearFromRoute).toHaveBeenCalledTimes(1);
    expect(mockXvifcService.getSideMenuItems).toHaveBeenCalledTimes(1);
  });

  it('should call resolveRoleAndYearFromRoute with current route snapshot', () => {
    const snapshot = mockActivatedRoute.snapshot;
    fixture.detectChanges();
    expect(mockXvifcService.resolveRoleAndYearFromRoute).toHaveBeenCalledWith(snapshot);
  });

  it('should call getSideMenuItems with the resolved role and yearId', () => {
    fixture.detectChanges();
    expect(mockXvifcService.getSideMenuItems).toHaveBeenCalledWith('STATE', '2025');
  });

  it('should store the returned sidebar model in the signal', () => {
    fixture.detectChanges();
    expect(component.model()).toEqual(sidebarModel);
  });

  it('should sync the menu again when a NavigationEnd event occurs', () => {
    // Arrange
    fixture.detectChanges();
    mockXvifcService.resolveRoleAndYearFromRoute.calls.reset();
    mockXvifcService.getSideMenuItems.calls.reset();

    // Act
    routerEvent$.next(new NavigationEnd(1, '/from', '/to'));

    // Assert
    expect(mockXvifcService.resolveRoleAndYearFromRoute).toHaveBeenCalledTimes(1);
    expect(mockXvifcService.getSideMenuItems).toHaveBeenCalledTimes(1);
  });

  it('should ignore router events that are not NavidationEnd', () => {
    fixture.detectChanges();
    mockXvifcService.resolveRoleAndYearFromRoute.calls.reset();
    mockXvifcService.getSideMenuItems.calls.reset();

    routerEvent$.next({ type: 'something' });

    expect(mockXvifcService.resolveRoleAndYearFromRoute).not.toHaveBeenCalled();
    expect(mockXvifcService.getSideMenuItems).not.toHaveBeenCalled();
  });

  it('should render the app-menu stub component', () => {
    fixture.detectChanges();

    const menuEl = fixture.nativeElement.querySelector('[data-testid="app-menu-stub"]');
    expect(menuEl).toBeTruthy();
  });

  it('should pass the current model to app-menu', () => {
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
});
