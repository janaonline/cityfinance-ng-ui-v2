import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZeroOnStepChangeDirective } from './zero-on-step-change.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ZeroOnStepChangeDirective],
  template: `<input type="number" step="1" appZeroOnStepChange [formControl]="amount" />`,
})
class HostComponent {
  readonly amount = new FormControl(500);
}

describe('ZeroOnStepChangeDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let input: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input');
  });

  it('resets the control to 0 on an ArrowUp keydown', () => {
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true }));
    expect(fixture.componentInstance.amount.value).toBe(0);
  });

  it('resets the control to 0 on an ArrowDown keydown', () => {
    input.focus();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
    expect(fixture.componentInstance.amount.value).toBe(0);
  });

  it('resets the control to 0 on wheel while the input is focused', () => {
    input.focus();
    input.dispatchEvent(new WheelEvent('wheel', { cancelable: true }));
    expect(fixture.componentInstance.amount.value).toBe(0);
  });

  it('leaves the value untouched on wheel while the input is not focused', () => {
    input.dispatchEvent(new WheelEvent('wheel', { cancelable: true }));
    expect(fixture.componentInstance.amount.value).toBe(500);
  });
});
