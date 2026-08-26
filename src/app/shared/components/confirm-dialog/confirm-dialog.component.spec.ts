import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { MATERIAL_THEME_CLASS } from '../../../core/theming/material-theme.providers';
import {
  CANCEL_CONFIRM_DIALOG_DEFAULTS,
  ConfirmDialogComponent,
  ConfirmDialogData,
  resolveThemeClass,
  themedDialogConfig,
} from './confirm-dialog.component';

function setup(data: ConfirmDialogData): {
  fixture: ComponentFixture<ConfirmDialogComponent>;
  component: ConfirmDialogComponent;
  dialogRef: jasmine.SpyObj<MatDialogRef<ConfirmDialogComponent, boolean>>;
} {
  const dialogRef = jasmine.createSpyObj<MatDialogRef<ConfirmDialogComponent, boolean>>('MatDialogRef', ['close']);

  TestBed.configureTestingModule({
    imports: [ConfirmDialogComponent],
    providers: [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, dialogRef };
}

/** Returns the confirm button element from the dialog actions. */
function getConfirmButton(fixture: ComponentFixture<ConfirmDialogComponent>): HTMLButtonElement {
  const buttons = fixture.debugElement.queryAll(By.css('mat-dialog-actions button'));
  return buttons.find((b) =>
    (b.nativeElement as HTMLButtonElement).textContent?.includes(CANCEL_CONFIRM_DIALOG_DEFAULTS.confirmText),
  )!.nativeElement as HTMLButtonElement;
}

describe('ConfirmDialogComponent', () => {
  describe('default content', () => {
    it('renders default title, message, and button text when no data is provided', () => {
      const { fixture } = setup({});
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.title);
      expect(text).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.message);
      expect(text).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.cancelText);
      expect(text).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.confirmText);
    });

    it('applies warn as the default confirmButtonColor', () => {
      const { component } = setup({});
      expect(component.resolved.confirmButtonColor).toBe('warn');
    });

    it('does not render confirmButtonColor value as visible text', () => {
      const { fixture } = setup({});
      const actionsText = (
        fixture.nativeElement.querySelector('mat-dialog-actions') as HTMLElement
      ).textContent?.trim();

      // Only button labels should appear — no raw 'warn' string
      expect(actionsText).not.toContain('warn');
      expect(actionsText).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.cancelText);
      expect(actionsText).toContain(CANCEL_CONFIRM_DIALOG_DEFAULTS.confirmText);
    });
  });

  describe('custom content', () => {
    it('renders custom title, message, and button text when data is provided', () => {
      const { fixture } = setup({
        title: 'Delete record?',
        message: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep it',
      });
      const text = fixture.nativeElement.textContent as string;

      expect(text).toContain('Delete record?');
      expect(text).toContain('This action cannot be undone.');
      expect(text).toContain('Keep it');
      expect(text).toContain('Delete');
    });

    it('applies custom confirmButtonColor to resolved config', () => {
      const { component } = setup({ confirmButtonColor: 'primary' });
      expect(component.resolved.confirmButtonColor).toBe('primary');
    });
  });

  describe('icon rendering', () => {
    it('renders a Bootstrap icon element when icon is provided', () => {
      const { fixture } = setup({ icon: 'bi-exclamation-triangle-fill' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon).toBeTruthy();
    });

    it('applies the configured Bootstrap icon class', () => {
      const { fixture } = setup({ icon: 'bi-exclamation-triangle-fill' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon?.classList).toContain('bi-exclamation-triangle-fill');
    });

    it('applies the fs-5 sizing class', () => {
      const { fixture } = setup({ icon: 'bi-check-circle-fill' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon?.classList).toContain('fs-5');
    });

    it('does not render an icon element when icon is empty string', () => {
      const { fixture } = setup({ icon: '' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon).toBeNull();
    });

    it('does not render any mat-icon element', () => {
      const { fixture } = setup({ icon: 'bi-exclamation-triangle-fill' });
      const matIcon = fixture.nativeElement.querySelector('mat-icon') as HTMLElement | null;
      expect(matIcon).toBeNull();
    });

    it('default cancel constant uses the Bootstrap warning icon', () => {
      expect(CANCEL_CONFIRM_DIALOG_DEFAULTS.icon).toBe('bi-exclamation-triangle-fill');
    });

    it('applies confirm-dialog-icon--warn class when confirmButtonColor is warn', () => {
      const { fixture } = setup({ icon: 'bi-exclamation-triangle-fill', confirmButtonColor: 'warn' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon?.classList).toContain('confirm-dialog-icon--warn');
    });

    it('applies confirm-dialog-icon--primary class when confirmButtonColor is primary', () => {
      const { fixture } = setup({ icon: 'bi-check-circle-fill', confirmButtonColor: 'primary' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon?.classList).toContain('confirm-dialog-icon--primary');
    });

    it('applies confirm-dialog-icon--accent class when confirmButtonColor is accent', () => {
      const { fixture } = setup({ icon: 'bi-info-circle-fill', confirmButtonColor: 'accent' });
      const icon = fixture.nativeElement.querySelector('i.bi') as HTMLElement | null;
      expect(icon?.classList).toContain('confirm-dialog-icon--accent');
    });
  });

  describe('confirm button CSS color classes', () => {
    it('adds confirm-dialog-btn--warn class when confirmButtonColor is warn', () => {
      const { fixture } = setup({ confirmButtonColor: 'warn' });
      expect(getConfirmButton(fixture).classList).toContain('confirm-dialog-btn--warn');
    });

    it('adds confirm-dialog-btn--accent class when confirmButtonColor is accent', () => {
      const { fixture } = setup({ confirmButtonColor: 'accent' });
      expect(getConfirmButton(fixture).classList).toContain('confirm-dialog-btn--accent');
    });

    it('adds no extra color class when confirmButtonColor is primary', () => {
      const { fixture } = setup({ confirmButtonColor: 'primary' });
      const btn = getConfirmButton(fixture);
      expect(btn.classList).not.toContain('confirm-dialog-btn--warn');
      expect(btn.classList).not.toContain('confirm-dialog-btn--accent');
    });

    it('adds confirm-dialog-btn--warn class by default (default color is warn)', () => {
      const { fixture } = setup({});
      expect(getConfirmButton(fixture).classList).toContain('confirm-dialog-btn--warn');
    });
  });

  describe('button interactions', () => {
    it('closes dialog with true when confirm button is clicked', () => {
      const { fixture, dialogRef } = setup({});
      const buttons = fixture.debugElement.queryAll(By.css('mat-dialog-actions button'));
      const confirmBtn = buttons.find((b) =>
        (b.nativeElement as HTMLButtonElement).textContent?.includes(CANCEL_CONFIRM_DIALOG_DEFAULTS.confirmText),
      )!;

      confirmBtn.triggerEventHandler('click', null);

      expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
    });

    it('closes dialog with false when cancel button is clicked', () => {
      const { fixture, dialogRef } = setup({});
      const buttons = fixture.debugElement.queryAll(By.css('mat-dialog-actions button'));
      const cancelBtn = buttons.find((b) =>
        (b.nativeElement as HTMLButtonElement).textContent?.includes(CANCEL_CONFIRM_DIALOG_DEFAULTS.cancelText),
      )!;

      cancelBtn.triggerEventHandler('click', null);

      expect(dialogRef.close).toHaveBeenCalledOnceWith(false);
    });
  });
});

describe('resolveThemeClass / themedDialogConfig', () => {
  function withThemeClass(themeClass: string | null): void {
    TestBed.configureTestingModule({
      providers: [{ provide: MATERIAL_THEME_CLASS, useValue: themeClass }],
    });
  }

  describe('resolveThemeClass', () => {
    it('returns the ambient theme class when one is provided', () => {
      withThemeClass('xvifc-theme');

      const result = TestBed.runInInjectionContext(() => resolveThemeClass());

      expect(result).toBe('xvifc-theme');
    });

    it('returns null outside a themed scope', () => {
      withThemeClass(null);

      const result = TestBed.runInInjectionContext(() => resolveThemeClass());

      expect(result).toBeNull();
    });
  });

  describe('themedDialogConfig', () => {
    it('returns a MatDialogConfig with panelClass set to the ambient theme class', () => {
      withThemeClass('xvifc-theme');

      const result = TestBed.runInInjectionContext(() => themedDialogConfig());

      expect(result).toEqual({ panelClass: 'xvifc-theme' });
    });

    it('returns undefined outside a themed scope', () => {
      withThemeClass(null);

      const result = TestBed.runInInjectionContext(() => themedDialogConfig());

      expect(result).toBeUndefined();
    });
  });
});
