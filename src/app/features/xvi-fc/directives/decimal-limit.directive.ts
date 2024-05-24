import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import swal from 'sweetalert2';

@Directive({
  selector: '[appDecimalLimit]',
  standalone: true,
})
export class DecimalLimitDirective {
  @Input() appDecimalLimit: number | undefined;

  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    console.log(event.key);
    if(this.appDecimalLimit == null) return;
    if(this.appDecimalLimit == 0 && event.key == '.') {
      swal.fire('Warning', 'Deciamls are not allow', 'warning');
      return event.preventDefault();
    }
    const inputValue = this.el.nativeElement.value;
    const eventValue = parseInt(event.key);
    if (isNaN(eventValue)) {
      return;
    }
    
    const decimal = inputValue.split('.')?.[1];
    
    console.log(decimal?.length, this.appDecimalLimit);
    if (decimal?.length >= this.appDecimalLimit) {
      swal.fire('Warning', `Upto ${this.appDecimalLimit} are allowed`, 'warning');
      event.preventDefault();
    }
  }
}
