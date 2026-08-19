import { TestBed } from '@angular/core/testing';
import { AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY, AmountDisplayModeService } from './amount-display-mode.service';

describe('AmountDisplayModeService', () => {
  let service: AmountDisplayModeService;

  beforeEach(() => {
    localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmountDisplayModeService);
  });

  afterEach(() => {
    localStorage.removeItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY);
  });

  it('has no override by default', () => {
    expect(service.override()).toBeNull();
    expect(service.hasOverride()).toBe(false);
  });

  it('restores a previously-stored override on construction', () => {
    localStorage.setItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY, 'k');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(AmountDisplayModeService);

    expect(restored.override()).toBe('k');
    expect(restored.hasOverride()).toBe(true);
  });

  it('falls back to no override for an invalid stored value', () => {
    localStorage.setItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY, 'garbage');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(AmountDisplayModeService);

    expect(restored.override()).toBeNull();
  });

  it('setOverride updates the signal and persists to localStorage', () => {
    service.setOverride('lakh');

    expect(service.override()).toBe('lakh');
    expect(localStorage.getItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY)).toBe('lakh');
  });

  it('setOverride(null) clears the signal and removes the localStorage entry', () => {
    service.setOverride('lakh');
    service.setOverride(null);

    expect(service.override()).toBeNull();
    expect(localStorage.getItem(AMOUNT_DISPLAY_OVERRIDE_STORAGE_KEY)).toBeNull();
  });

  it('format() uses the page default when no override is active', () => {
    expect(service.format(25000000, 'auto')).toBe('₹ 2.5 Cr');
    expect(service.format(25000000, 'inr')).toBe('₹ 2,50,00,000');
  });

  it('format() lets an active override win over the page default', () => {
    service.setOverride('k');
    expect(service.format(25000000, 'inr')).toBe('₹ 25,000 K');
  });

  it('format() with ignoreOverride always uses the page default, even when an override is active', () => {
    service.setOverride('k');
    expect(service.format(25000000, 'inr', { ignoreOverride: true })).toBe('₹ 2,50,00,000');
  });

  it('formatExact() always shows the full grouped figure, regardless of page default or override', () => {
    service.setOverride('k');
    expect(service.formatExact(25000000)).toBe('₹ 2,50,00,000');
  });

  it('format() returns a dash for null/undefined', () => {
    expect(service.format(null, 'auto')).toBe('-');
    expect(service.format(undefined, 'inr')).toBe('-');
  });

  it('unitSuffix() reflects the page default when no override is active', () => {
    expect(service.unitSuffix('inr')).toBe('₹');
  });

  it('unitSuffix() reflects an active override over the page default', () => {
    service.setOverride('cr');
    expect(service.unitSuffix('inr')).toBe('Cr.');
    service.setOverride('lakh');
    expect(service.unitSuffix('inr')).toBe('Lakh');
    service.setOverride('k');
    expect(service.unitSuffix('inr')).toBe('K');
  });

  it('unitSuffix() with ignoreOverride always uses the page default', () => {
    service.setOverride('cr');
    expect(service.unitSuffix('inr', { ignoreOverride: true })).toBe('₹');
  });

  it('formatInWords() spells out a whole-Rupee amount using the Indian numbering system', () => {
    expect(service.formatInWords(129300000)).toBe('Twelve Crore Ninety Three Lakh Rupees');
  });

  it('formatInWords() returns an empty string for null/undefined/zero', () => {
    expect(service.formatInWords(null)).toBe('');
    expect(service.formatInWords(undefined)).toBe('');
    expect(service.formatInWords(0)).toBe('');
  });

  it('formatInWords() ignores the override — always the exact raw value, never scaled', () => {
    service.setOverride('cr');
    expect(service.formatInWords(129300000)).toBe('Twelve Crore Ninety Three Lakh Rupees');
  });

  it('wholeNumberInfoText() is empty when there is no value yet', () => {
    expect(service.wholeNumberInfoText(null)).toBe('');
    expect(service.wholeNumberInfoText(undefined)).toBe('');
  });

  it('wholeNumberInfoText() is just the spelled-out value, once one is entered', () => {
    expect(service.wholeNumberInfoText(100)).toBe('One Hundred Rupees');
  });
});
