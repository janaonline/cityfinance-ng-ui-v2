import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UtilityService } from '../services/utility.service';
import { DecimalLimitDirective } from './decimal-limit.directive';

@Component({
  standalone: true,
  imports: [DecimalLimitDirective],
  template: `<input type="number" [appDecimalLimit]="0" />`,
})
class HostComponent {}

describe('DecimalLimitDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let input: HTMLInputElement;
  let utilityService: UtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
    utilityService = TestBed.inject(UtilityService);
  });

  it('blocks typing "." when appDecimalLimit is 0, via a snackbar-danger snackbar', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const event = new KeyboardEvent('keydown', { key: '.', cancelable: true });

    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(snackbarSpy).toHaveBeenCalledWith('Please enter a whole number', 'snackbar-danger');
  });

  it('does not block a digit keystroke', () => {
    const snackbarSpy = spyOn(utilityService, 'triggerSnackbar');
    const event = new KeyboardEvent('keydown', { key: '5', cancelable: true });

    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(snackbarSpy).not.toHaveBeenCalled();
  });
});
