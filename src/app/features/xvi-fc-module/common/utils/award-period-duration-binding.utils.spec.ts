import { DestroyRef, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { bindAwardPeriodDurationDerivation } from './award-period-duration-binding.utils';

describe('bindAwardPeriodDurationDerivation', () => {
  let destroyRef: DestroyRef;
  let formTeardown$: Subject<void>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    destroyRef = TestBed.runInInjectionContext(() => inject(DestroyRef));
    formTeardown$ = new Subject<void>();
  });

  it('does nothing when the form has no awardPeriod control', () => {
    const form = new FormGroup({ awardPeriodDuration: new FormControl<number | null>(null) });

    expect(() => bindAwardPeriodDurationDerivation(form, destroyRef, formTeardown$)).not.toThrow();
    expect(form.get('awardPeriodDuration')?.value).toBeNull();
  });

  it('does nothing when the form has no awardPeriodDuration control', () => {
    const form = new FormGroup({ awardPeriod: new FormControl('2026-2032') });

    expect(() => bindAwardPeriodDurationDerivation(form, destroyRef, formTeardown$)).not.toThrow();
  });

  it('sets the duration immediately from an already-answered awardPeriod', () => {
    const form = new FormGroup({
      awardPeriod: new FormControl('2026-2032'),
      awardPeriodDuration: new FormControl<number | null>(null),
    });

    bindAwardPeriodDurationDerivation(form, destroyRef, formTeardown$);

    expect(form.get('awardPeriodDuration')?.value).toBe(6);
  });

  it('updates the duration reactively when awardPeriod changes', () => {
    const form = new FormGroup({
      awardPeriod: new FormControl<string | null>(null),
      awardPeriodDuration: new FormControl<number | null>(null),
    });

    bindAwardPeriodDurationDerivation(form, destroyRef, formTeardown$);
    form.get('awardPeriod')?.setValue('2021-2026');

    expect(form.get('awardPeriodDuration')?.value).toBe(5);
  });

  it('stops updating the duration once formTeardown$ emits', () => {
    const form = new FormGroup({
      awardPeriod: new FormControl<string | null>(null),
      awardPeriodDuration: new FormControl<number | null>(null),
    });

    bindAwardPeriodDurationDerivation(form, destroyRef, formTeardown$);
    formTeardown$.next();
    form.get('awardPeriod')?.setValue('2021-2026');

    expect(form.get('awardPeriodDuration')?.value).toBeNull();
  });
});
