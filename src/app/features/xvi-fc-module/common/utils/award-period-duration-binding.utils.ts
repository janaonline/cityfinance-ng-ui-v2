import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { distinctUntilChanged, map, startWith, Subject, takeUntil } from 'rxjs';
import { getYearRangeDuration } from '../../../../core/validators/year-range.validator';

/**
 * Live-derives `awardPeriodDuration` from `awardPeriod` so `visibleWhen` rules that depend on it
 * (e.g. SFC Status's "Has the SFC award period been extended?") evaluate correctly.
 * `awardPeriodDuration` is a display-only, never-persisted field (`render: false,
 * includeInPayload: false` in form-json) — the backend never computes or returns a value for it,
 * to State or PMU alike, so without this the dependent field is wrongly hidden everywhere it's
 * missing. Safe to call on any form: no-ops when either control is absent (e.g. Devolution
 * Formula, which has no award-period concept).
 */
export function bindAwardPeriodDurationDerivation(
  form: FormGroup,
  destroyRef: DestroyRef,
  formTeardown$: Subject<void>,
): void {
  const awardPeriodControl = form.get('awardPeriod');
  const durationControl = form.get('awardPeriodDuration') as FormControl<number | null> | null;
  if (!awardPeriodControl || !durationControl) return;

  awardPeriodControl.valueChanges
    .pipe(
      startWith(awardPeriodControl.value),
      map((v) => getYearRangeDuration(v)),
      distinctUntilChanged(),
      takeUntilDestroyed(destroyRef),
      takeUntil(formTeardown$),
    )
    .subscribe((duration) => durationControl.setValue(duration, { emitEvent: true }));
}
