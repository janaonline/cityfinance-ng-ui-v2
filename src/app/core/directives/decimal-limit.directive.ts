import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { UtilityService } from '../services/utility.service';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: true,
})
export class DecimalLimitDirective {
  @Input() appDecimalLimit!: number | null;

  constructor(
    private el: ElementRef,
    private utilityService: UtilityService,
  ) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    if (this.appDecimalLimit == null) return;
    if (this.appDecimalLimit == 0 && event.key == '.') {
      this.utilityService.triggerSnackbar('Please enter a whole number', 'snackbar-danger');
      return event.preventDefault();
    }
    const inputValue = this.el.nativeElement.value;
    const eventValue = parseInt(event.key);
    if (isNaN(eventValue)) {
      return;
    }

    const decimal = inputValue.split('.')?.[1];

    if (decimal?.length >= this.appDecimalLimit) {
      this.utilityService.triggerSnackbar(`Decimals are allowed up to ${this.appDecimalLimit} places only`, 'snackbar-danger');
      event.preventDefault();
    }
  }
}
