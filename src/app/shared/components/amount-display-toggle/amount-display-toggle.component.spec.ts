import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY,
  AmountDisplayModeService,
} from '../../../core/services/amount-display-mode.service';
import { AmountDisplayToggleComponent } from './amount-display-toggle.component';

describe('AmountDisplayToggleComponent', () => {
  let fixture: ComponentFixture<AmountDisplayToggleComponent>;
  let component: AmountDisplayToggleComponent;
  let service: AmountDisplayModeService;

  beforeEach(async () => {
    localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
    await TestBed.configureTestingModule({
      imports: [AmountDisplayToggleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AmountDisplayToggleComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(AmountDisplayModeService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
  });

  it('exposes 4 options, starting with Crore', () => {
    expect(component.options.length).toBe(4);
    expect(component.options[0]).toEqual({ value: 'cr', label: 'Crore', shortKey: 'Cr' });
  });

  it('reflects the service\'s current override', () => {
    service.setOverride('lakh');
    expect(component.override()).toBe('lakh');
  });

  it('onChange calls setOverride with the picked value', () => {
    component.onChange('k');
    expect(service.override()).toBe('k');
  });

  it('onChange(null) clears the override', () => {
    service.setOverride('k');
    component.onChange(null);
    expect(service.override()).toBeNull();
  });

  it("clicking a pill calls setOverride with that option's value", () => {
    const lPill: HTMLButtonElement = fixture.debugElement.query(
      By.css('[data-cy="amount-display-toggle-option-lakh"]'),
    ).nativeElement;
    lPill.click();
    expect(service.override()).toBe('lakh');
  });

  it('the reset button is disabled while there is no override', () => {
    const resetButton: HTMLButtonElement = fixture.debugElement.query(
      By.css('[data-cy="amount-display-toggle-reset"]'),
    ).nativeElement;
    expect(resetButton.disabled).toBe(true);
  });

  it('clicking the reset button clears the override back to null', () => {
    service.setOverride('lakh');
    fixture.detectChanges();

    const resetButton: HTMLButtonElement = fixture.debugElement.query(
      By.css('[data-cy="amount-display-toggle-reset"]'),
    ).nativeElement;
    expect(resetButton.disabled).toBe(false);

    resetButton.click();
    expect(service.override()).toBeNull();
  });
});
