import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppMenuItemComponent } from './app-menu-item.component';
import { MenuItem } from '../../models/menu.model';

// ---------------------------------------------------------------------------
// Minimal dummy page for router test routes
// ---------------------------------------------------------------------------

@Component({ template: '' })
class DummyPageComponent {}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setItem(
  fixture: ComponentFixture<AppMenuItemComponent>,
  item: MenuItem,
  extras: { collapsed?: boolean; root?: boolean } = {},
) {
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('collapsed', extras.collapsed ?? false);
  fixture.componentRef.setInput('root', extras.root ?? false);
  fixture.detectChanges();
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('AppMenuItemComponent', () => {
  let fixture: ComponentFixture<AppMenuItemComponent>;
  let component: AppMenuItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppMenuItemComponent,
        RouterTestingModule.withRoutes([{ path: 'home', component: DummyPageComponent }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppMenuItemComponent);
    component = fixture.componentInstance;
  });

  // ── 1. Disabled command item does not execute ─────────────────────────────

  it('disabled command item: does not call the command', () => {
    const commandSpy = jasmine.createSpy('command');
    setItem(fixture, { label: 'Sign out', command: commandSpy, disabled: true });

    component.executeCommand();

    expect(commandSpy).not.toHaveBeenCalled();
  });

  it('disabled command button: native disabled attribute is set', () => {
    setItem(fixture, { label: 'Sign out', command: () => undefined, disabled: true });

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  // ── 2. Disabled item does not emit itemActivated ───────────────────────────

  it('disabled router link: does not emit itemActivated', () => {
    const emitSpy = spyOn(component.itemActivated, 'emit');
    setItem(fixture, { label: 'Home', routerLink: ['/home'], disabled: true });

    component.onLinkActivated();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('disabled external link: does not emit itemActivated and calls preventDefault', () => {
    const emitSpy = spyOn(component.itemActivated, 'emit');
    setItem(fixture, { label: 'Docs', url: 'https://example.com', disabled: true });

    const fakeEvent = {
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as MouseEvent;
    component.onExternalLinkActivated(fakeEvent);

    expect(emitSpy).not.toHaveBeenCalled();
    expect(fakeEvent.preventDefault).toHaveBeenCalled();
  });

  it('disabled command item: does not emit itemActivated', () => {
    const emitSpy = spyOn(component.itemActivated, 'emit');
    setItem(fixture, { label: 'Sign out', command: () => undefined, disabled: true });

    component.executeCommand();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  // ── 3. Disabled item is not focusable ─────────────────────────────────────

  it('disabled router link: has tabindex="-1" and aria-disabled="true"', () => {
    setItem(fixture, { label: 'Home', routerLink: ['/home'], disabled: true });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.getAttribute('aria-disabled')).toBe('true');
  });

  it('disabled external link: has tabindex="-1" and aria-disabled="true"', () => {
    setItem(fixture, { label: 'Docs', url: 'https://example.com', disabled: true });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('tabindex')).toBe('-1');
    expect(a.getAttribute('aria-disabled')).toBe('true');
  });

  it('enabled router link: does not have tabindex or aria-disabled', () => {
    setItem(fixture, { label: 'Home', routerLink: ['/home'] });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('tabindex')).toBeNull();
    expect(a.getAttribute('aria-disabled')).toBeNull();
  });

  // ── 4. Active link gets aria-current="page" ────────────────────────────────

  it('active router link: has aria-current="page"', fakeAsync(() => {
    setItem(fixture, { label: 'Home', routerLink: ['/home'], exact: false });
    const router = TestBed.inject(Router);

    router.navigate(['/home']);
    tick();
    fixture.detectChanges();

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('aria-current')).toBe('page');
  }));

  it('inactive router link: does not have aria-current', fakeAsync(() => {
    setItem(fixture, { label: 'Home', routerLink: ['/home'] });
    tick();
    fixture.detectChanges();

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('aria-current')).toBeNull();
  }));

  // ── 5. Parent menu button has aria-expanded ────────────────────────────────

  it('parent toggle button: has aria-expanded reflecting expanded state', () => {
    setItem(fixture, {
      label: 'Section',
      items: [{ label: 'Child', routerLink: ['/child'] }],
    });

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('true');

    component.toggle();
    fixture.detectChanges();

    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  // ── 6. Parent menu button has aria-controls matching submenu id ────────────

  it('parent toggle button: aria-controls matches the submenu ul id', () => {
    setItem(fixture, {
      label: 'My Section',
      items: [{ label: 'Child', routerLink: ['/child'] }],
    });

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    const ul = fixture.nativeElement.querySelector('ul.submenu-item') as HTMLUListElement;

    expect(btn.getAttribute('aria-controls')).toBeTruthy();
    expect(btn.getAttribute('aria-controls')).toBe(ul.id);
    expect(ul.id).toBe('submenu-my-section');
  });

  // ── 7. Icons have aria-hidden="true" ──────────────────────────────────────

  it('router link icon: has aria-hidden="true"', () => {
    setItem(fixture, { label: 'Home', routerLink: ['/home'], icon: 'bi bi-house' });

    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('parent toggle chevron icon: has aria-hidden="true"', () => {
    setItem(fixture, {
      label: 'Section',
      items: [{ label: 'Child', routerLink: ['/child'] }],
    });

    const icons = fixture.nativeElement.querySelectorAll('i') as NodeListOf<HTMLElement>;
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  // ── 8. Collapsed icon-only item retains accessible label ──────────────────

  it('collapsed router link: still has title and aria-label', () => {
    setItem(
      fixture,
      { label: 'Dashboard', routerLink: ['/dashboard'], icon: 'bi bi-speedometer' },
      { collapsed: true },
    );

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('title')).toBe('Dashboard');
    expect(a.getAttribute('aria-label')).toBe('Dashboard');
    expect(fixture.nativeElement.querySelector('.menu-label')).toBeNull();
  });

  it('collapsed command button: still has title and aria-label', () => {
    setItem(
      fixture,
      { label: 'Sign out', command: () => undefined, icon: 'bi bi-box-arrow-right' },
      { collapsed: true },
    );

    const btn = fixture.nativeElement.querySelector('button.menu-item--command') as HTMLButtonElement;
    expect(btn.getAttribute('title')).toBe('Sign out');
    expect(btn.getAttribute('aria-label')).toBe('Sign out');
    expect(fixture.nativeElement.querySelector('.menu-label')).toBeNull();
  });

  // ── 9. External _blank link uses rel="noopener noreferrer" ────────────────

  it('external _blank link: has rel="noopener noreferrer"', () => {
    setItem(fixture, { label: 'Docs', url: 'https://example.com', target: '_blank' });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('external _self link: does not have a rel attribute', () => {
    setItem(fixture, { label: 'Docs', url: 'https://example.com', target: '_self' });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('rel')).toBeNull();
  });

  it('external link without explicit target: does not have a rel attribute', () => {
    setItem(fixture, { label: 'Docs', url: 'https://example.com' });

    const a = fixture.nativeElement.querySelector('a.menu-item') as HTMLAnchorElement;
    expect(a.getAttribute('rel')).toBeNull();
  });
});
