import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppMenuComponent } from './app-menu.component';
import { SideBarModel } from '../../models/menu.model';

// ---------------------------------------------------------------------------
// Test host
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'xvifc.sidebar.expanded';

const STUB_MODEL: SideBarModel = {
  topModel: [{ label: 'Home', routerLink: ['/home'], icon: 'bi bi-house' }],
  bottomModel: [{ label: 'Sign out', command: () => undefined, icon: 'bi bi-box-arrow-right' }],
};

@Component({
  template: `<app-menu [model]="model()"></app-menu>`,
  imports: [AppMenuComponent],
})
class TestHostComponent {
  model = signal<SideBarModel>(STUB_MODEL);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockMatchMedia(matches: boolean) {
  spyOn(window, 'matchMedia').and.returnValue({
    matches,
    media: '',
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  } as MediaQueryList);
}

function getComponent(fixture: ComponentFixture<TestHostComponent>): AppMenuComponent {
  return fixture.debugElement.query(By.directive(AppMenuComponent)).componentInstance as AppMenuComponent;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AppMenuComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: AppMenuComponent;

  function build(isOverlay = false, storedExpanded?: 'true' | 'false') {
    localStorage.clear();
    if (storedExpanded !== undefined) {
      localStorage.setItem(STORAGE_KEY, storedExpanded);
    }
    mockMatchMedia(isOverlay);

    fixture = TestBed.createComponent(TestHostComponent);
    component = getComponent(fixture);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  // ── 1. Restore collapsed from localStorage ────────────────────────────────

  it('desktop: restores collapsed state when localStorage stores "false" (not expanded)', () => {
    build(false, 'false');

    expect(component.isDesktopCollapsed()).toBeTrue();
    expect(component.effectiveCollapsed()).toBeTrue();
  });

  // ── 2. Restore expanded from localStorage ─────────────────────────────────

  it('desktop: restores expanded state when localStorage stores "true"', () => {
    build(false, 'true');

    expect(component.isDesktopCollapsed()).toBeFalse();
    expect(component.effectiveCollapsed()).toBeFalse();
  });

  // ── 3. Desktop toggle persists to localStorage ────────────────────────────

  it('desktop: toggleDesktopCollapsed() persists the new state to localStorage', () => {
    build(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    component.toggleDesktopCollapsed(); // collapse

    expect(localStorage.getItem(STORAGE_KEY)).toBe('false'); // expanded = false → collapsed

    component.toggleDesktopCollapsed(); // expand again

    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  // ── 4. Mobile drawer state not persisted ──────────────────────────────────

  it('mobile: opening and closing the drawer does not write to localStorage', () => {
    build(true);
    localStorage.clear(); // reset any writes from init

    component.openMobileDrawer();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    component.closeMobileDrawer();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  // ── 5. Backdrop renders only when overlay + drawer open ───────────────────

  it('mobile: backdrop is rendered only when overlay mode and drawer is open', () => {
    build(true);

    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeNull();

    component.openMobileDrawer();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeTruthy();
  });

  it('desktop: backdrop is never rendered', () => {
    build(false);

    component.isDesktopCollapsed.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeNull();
  });

  // ── 6. Backdrop click closes drawer ───────────────────────────────────────

  it('mobile: clicking the backdrop closes the drawer', () => {
    build(true);
    component.openMobileDrawer();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.sidebar-backdrop') as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(component.isMobileDrawerOpen()).toBeFalse();
    expect(fixture.nativeElement.querySelector('.sidebar-backdrop')).toBeNull();
  });

  // ── 7. Escape key closes drawer ───────────────────────────────────────────

  it('mobile: Escape key closes the drawer', () => {
    build(true);
    component.openMobileDrawer();
    fixture.detectChanges();

    expect(component.isMobileDrawerOpen()).toBeTrue();

    component.onEscapeKey();

    expect(component.isMobileDrawerOpen()).toBeFalse();
  });

  it('desktop: Escape key does nothing', () => {
    build(false);
    component.isDesktopCollapsed.set(false);

    component.onEscapeKey();

    expect(component.isDesktopCollapsed()).toBeFalse();
  });

  // ── 8. Desktop collapsed shows icon rail (sidebar--collapsed class) ───────

  it('desktop: collapsed state adds sidebar--collapsed class and keeps panel visible', fakeAsync(() => {
    build(false);
    component.isDesktopCollapsed.set(true);
    fixture.detectChanges();
    tick();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.classList).toContain('sidebar--collapsed');
    expect(nav.classList).not.toContain('sidebar--overlay');
    // Panel must remain in the DOM (icon rail visible).
    expect(fixture.nativeElement.querySelector('.layout-menu')).toBeTruthy();
  }));

  // ── 9. Mobile closed hides drawer (no overlay-open class) ─────────────────

  it('mobile: closed drawer has sidebar--overlay but not sidebar--overlay-open', () => {
    build(true);

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.classList).toContain('sidebar--overlay');
    expect(nav.classList).not.toContain('sidebar--overlay-open');
  });

  it('mobile: open drawer adds sidebar--overlay-open class', () => {
    build(true);
    component.openMobileDrawer();
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.classList).toContain('sidebar--overlay');
    expect(nav.classList).toContain('sidebar--overlay-open');
  });

  // ── 10. Menu item activation closes drawer in overlay mode ────────────────

  it('mobile: onMenuItemActivated() closes the open drawer', () => {
    build(true);
    component.openMobileDrawer();
    expect(component.isMobileDrawerOpen()).toBeTrue();

    component.onMenuItemActivated();

    expect(component.isMobileDrawerOpen()).toBeFalse();
  });

  it('desktop: onMenuItemActivated() does not alter desktop collapsed state', () => {
    build(false);
    component.isDesktopCollapsed.set(false);

    component.onMenuItemActivated();

    expect(component.isDesktopCollapsed()).toBeFalse();
  });

  // ── 11. Command item execution still works ────────────────────────────────

  it('command item: clicking the button calls the item command', () => {
    const commandSpy = jasmine.createSpy('signOut');
    const model: SideBarModel = {
      topModel: [],
      bottomModel: [{ label: 'Sign out', command: commandSpy, icon: 'bi bi-box-arrow-right' }],
    };

    localStorage.clear();
    mockMatchMedia(false);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.model.set(model);
    component = getComponent(fixture);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();

    expect(commandSpy).toHaveBeenCalled();
  });

  it('mobile: clicking a command button closes the drawer', () => {
    const commandSpy = jasmine.createSpy('signOut');
    const model: SideBarModel = {
      topModel: [],
      bottomModel: [{ label: 'Sign out', command: commandSpy, icon: 'bi bi-box-arrow-right' }],
    };

    localStorage.clear();
    mockMatchMedia(true);
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.model.set(model);
    component = getComponent(fixture);
    fixture.detectChanges();

    component.openMobileDrawer();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    btn.click();
    fixture.detectChanges();

    expect(commandSpy).toHaveBeenCalled();
    expect(component.isMobileDrawerOpen()).toBeFalse();
  });
});
