import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTrimOnBlur]',
})
export class TrimOnBlurDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('blur')
  onBlur() {
    const value = this.ngControl.control?.value;
    if (typeof value === 'string' && value) {
      this.ngControl.control?.setValue(value.trim());
    }
  }
}
