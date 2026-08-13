import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, ElementRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

/**
 * Measures variable-height app-shell chrome (currently: the global header) and exposes it both
 * as a reactive signal and as a `:root`-scoped CSS custom property, so any stylesheet in the app
 * — regardless of where it sits in the DOM relative to the measured element — can size itself
 * against "the remaining viewport below the header" without hardcoding a pixel value.
 */
@Injectable({
  providedIn: 'root',
})
export class LayoutMetricsService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Current measured header height in px. 0 until first measured (or permanently, on the server). */
  readonly headerHeightPx = signal(0);

  /**
   * Observes `elementRef`'s rendered height with a ResizeObserver and keeps `headerHeightPx` and
   * the `--app-header-height` CSS custom property in sync with it. Updates automatically on any
   * cause of a size change — window resize, responsive breakpoints hiding/showing content, or a
   * font-size change reflowing the element. No-ops on the server. Cleans up automatically when
   * `destroyRef`'s owner is destroyed.
   */
  trackHeaderElement(elementRef: ElementRef<HTMLElement>, destroyRef: DestroyRef): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const element = elementRef.nativeElement;
    const measure = () => this.applyHeight(element.getBoundingClientRect().height);

    measure(); // synchronous initial measurement — ResizeObserver's first callback is async
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);

    destroyRef.onDestroy(() => resizeObserver.disconnect());
  }

  private applyHeight(height: number): void {
    const rounded = Math.round(height);
    this.headerHeightPx.set(rounded);
    document.documentElement.style.setProperty('--app-header-height', `${rounded}px`);
  }
}
