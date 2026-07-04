import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EulbValidationBadgeComponent } from './eulb-validation-badge.component';
import { EulbRowValidationStatus } from '../../eulb-status.models';

describe('EulbValidationBadgeComponent', () => {
  let fixture: ComponentFixture<EulbValidationBadgeComponent>;
  let component: EulbValidationBadgeComponent;
  let el: HTMLElement;

  function setup(status: EulbRowValidationStatus): void {
    TestBed.configureTestingModule({ imports: [EulbValidationBadgeComponent] });
    fixture = TestBed.createComponent(EulbValidationBadgeComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    component.validationStatus = status;
    fixture.detectChanges();
  }

  describe('VALID status', () => {
    beforeEach(() => setup('VALID'));

    it('renders the Valid label', () => {
      expect(el.textContent?.trim()).toBe('Valid');
    });

    it('applies text-bg-success class', () => {
      expect(el.classList.contains('text-bg-success')).toBeTrue();
    });

    it('does not apply text-bg-danger class', () => {
      expect(el.classList.contains('text-bg-danger')).toBeFalse();
    });
  });

  describe('INVALID status', () => {
    beforeEach(() => setup('INVALID'));

    it('renders the Invalid label', () => {
      expect(el.textContent?.trim()).toBe('Invalid');
    });

    it('applies text-bg-danger class', () => {
      expect(el.classList.contains('text-bg-danger')).toBeTrue();
    });

    it('does not apply text-bg-success class', () => {
      expect(el.classList.contains('text-bg-success')).toBeFalse();
    });
  });

  it('treats INVALID as the default when status changes from VALID', () => {
    setup('VALID');
    fixture.componentRef.setInput('validationStatus', 'INVALID');
    fixture.detectChanges();
    expect(el.textContent?.trim()).toBe('Invalid');
    expect(el.classList.contains('text-bg-danger')).toBeTrue();
    expect(el.classList.contains('text-bg-success')).toBeFalse();
  });

  it('does not require any parent workflow state', () => {
    // createComponent alone (no parent, no service) should succeed
    setup('VALID');
    expect(component).toBeTruthy();
  });
});
