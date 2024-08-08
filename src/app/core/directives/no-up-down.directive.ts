import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoUpDown]',
  standalone: true,
})
export class NoUpDownDirective {
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Check if the key pressed is the up/down arrow key
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      // Prevent the default behavior of the up/down arrow keys
      event.preventDefault();
    }

    // Prevent typing 'e' or 'E'
    if (event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    // Prevent the default behavior of the scroll event when the shift key is pressed
    if (event.shiftKey) {
      event.preventDefault();
    }
  }
}
