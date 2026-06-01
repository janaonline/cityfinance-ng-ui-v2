import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { PercentprogressPipe } from './percentprogress.pipe';

describe('PercentprogressPipe', () => {
  it('create an instance', () => {
    const pipe = new PercentprogressPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns null when current or previous values are missing', () => {
    const pipe = new PercentprogressPipe();
    const rows = new FormArray([
      new FormGroup({ value: new FormControl(10), label: new FormControl('Previous') }),
      new FormGroup({ value: new FormControl(null), label: new FormControl('Current') }),
    ]);

    expect(pipe.transform(rows, 1, 'class')).toBeNull();
  });

  it('returns success or danger classes based on percentage movement', () => {
    const pipe = new PercentprogressPipe();
    const rows = new FormArray([
      new FormGroup({ value: new FormControl(100), label: new FormControl('Previous') }),
      new FormGroup({ value: new FormControl(125), label: new FormControl('Current') }),
      new FormGroup({ value: new FormControl(75), label: new FormControl('Next') }),
    ]);

    expect(pipe.transform(rows, 1, 'class')).toBe('text-success');
    expect(pipe.transform(rows, 2, 'class')).toBe('text-danger');
  });

  it('returns descriptive text for positive and negative movement', () => {
    const pipe = new PercentprogressPipe();
    const rows = new FormArray([
      new FormGroup({ value: new FormControl(100), label: new FormControl('FY 2024') }),
      new FormGroup({ value: new FormControl(125), label: new FormControl('FY 2025') }),
      new FormGroup({ value: new FormControl(75), label: new FormControl('FY 2026') }),
    ]);

    expect(pipe.transform(rows, 1, 'text')).toBe('Amount 25% greater than FY 2024');
    expect(pipe.transform(rows, 2, 'text')).toBe('Amount 40% lesser than FY 2025');
  });
});
