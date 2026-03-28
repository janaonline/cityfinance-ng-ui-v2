import { OverlayContainer } from '@angular/cdk/overlay';
import { DestroyRef, Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class OverlayThemeService {
  /**
   * - CDK overlay root used by Material popup-based components.
   * - eg: datepicker, select, menu, dialog, autocomplete, tooltip
   */
  private readonly overlayContainer = inject(OverlayContainer);

  /** Reference count per theme class to avoid removing a class still in use. */
  private readonly themeUsageCounts = new Map<string, number>();

  /**
   * Applies a theme class to the global overlay container for the caller's lifecycle.
   * Uses reference counting so multiple consumers can safely share the same theme.
   */
  applyThemeClass(themeClass: string, destroyRef: DestroyRef): void {
    const overlayClassList = this.overlayContainer.getContainerElement().classList;
    const currentCount = this.themeUsageCounts.get(themeClass) ?? 0;

    // Add the theme class only for the first active consumer.
    if (currentCount === 0) {
      overlayClassList.add(themeClass);
    }

    this.themeUsageCounts.set(themeClass, currentCount + 1);

    destroyRef.onDestroy(() => {
      const nextCount = (this.themeUsageCounts.get(themeClass) ?? 1) - 1;

      // Remove the class only after the last consumer is destroyed.
      if (nextCount <= 0) {
        this.themeUsageCounts.delete(themeClass);
        overlayClassList.remove(themeClass);
        return;
      }

      this.themeUsageCounts.set(themeClass, nextCount);
    });
  }
}
