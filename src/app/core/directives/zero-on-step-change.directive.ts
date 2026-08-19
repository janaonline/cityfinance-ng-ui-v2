import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Neutralizes the browser's native step-increment/decrement gestures on a `type="number"` input
 * whose `step` is a real number (not `"any"`) — mouse-wheel-while-focused and the Up/Down arrow
 * keys — which otherwise silently nudge an amount by one `step`, an easy-to-miss accident on a
 * scrollable page (scrolling the page while the cursor happens to be over a focused amount field).
 * Rather than letting the browser apply its own increment, resets the control straight to `0` so
 * an accidental scroll/arrow can never be mistaken for the real typed amount — the user has to
 * notice and re-enter it. Wheel is only intercepted while the input is actually focused, matching
 * the browser's own condition for changing the value that way; arrow keys only ever reach this
 * host's `keydown` listener while it's focused regardless, so no extra guard is needed there.
 */
@Directive({
  selector: '[appZeroOnStepChange]',
  standalone: true,
})
export class ZeroOnStepChangeDirective {
  constructor(
    private readonly el: ElementRef<HTMLElement>,
    @Optional() @Self() private readonly ngControl: NgControl | null,
  ) {}

  @HostListener('wheel', ['$event'])
  onWheel(event: Event): void {
    if (document.activeElement !== this.el.nativeElement) return;
    event.preventDefault();
    this.ngControl?.control?.setValue(0);
  }

  @HostListener('keydown.arrowup', ['$event'])
  @HostListener('keydown.arrowdown', ['$event'])
  onArrowKey(event: Event): void {
    event.preventDefault();
    this.ngControl?.control?.setValue(0);
  }
}
