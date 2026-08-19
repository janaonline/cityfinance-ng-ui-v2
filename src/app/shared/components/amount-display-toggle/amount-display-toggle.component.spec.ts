import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('exposes 5 options, starting with Default (null)', () => {
    expect(component.options.length).toBe(5);
    expect(component.options[0]).toEqual({ value: null, label: 'Default' });
  });

  it('reflects the service\'s current override', () => {
    service.setOverride('lakh');
    expect(component.override()).toBe('lakh');
  });

  it('onChange calls setOverride with the picked value', () => {
    component.onChange('k');
    expect(service.override()).toBe('k');
  });

  it('onChange(null) resets to Default', () => {
    service.setOverride('k');
    component.onChange(null);
    expect(service.override()).toBeNull();
  });
});
