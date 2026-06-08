import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, OnInit, PLATFORM_ID, computed, inject, input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SideBarModel } from '../../models/menu.model';
import { AppMenuItemComponent } from '../app-menu-item/app-menu-item.component';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, RouterModule, AppMenuItemComponent],
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss',
})
export class AppMenuComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly overlayMediaQuery = '(max-width: 991.98px)';
  private readonly storageKey = 'xvifc.sidebar.expanded';

  readonly model = input.required<SideBarModel>();

  readonly topModel = computed(() => this.model().topModel);
  readonly bottomModel = computed(() => this.model().bottomModel);

  /** True when the viewport is in mobile/tablet range — sidebar becomes an overlay drawer. */
  readonly isOverlayMode = signal(false);

  /** Desktop icon-rail collapsed state. Only meaningful when not in overlay mode. */
  readonly isDesktopCollapsed = signal(false);

  /** Whether the mobile overlay drawer is currently open. Never persisted to localStorage. */
  readonly isMobileDrawerOpen = signal(false);

  /**
   * Whether menu items should render in icon-only (collapsed) mode.
   * True only on desktop when the user has collapsed the rail.
   */
  readonly effectiveCollapsed = computed(() => this.isDesktopCollapsed() && !this.isOverlayMode());

  ngOnInit() {
    const hasStoredState = this.restoreDesktopState();
    this.syncOverlayMode(hasStoredState);
  }

  /** Toggles the desktop sidebar between expanded and icon-only states. */
  toggleDesktopCollapsed() {
    this.setDesktopCollapsed(!this.isDesktopCollapsed());
  }

  /** Opens the mobile overlay drawer. */
  openMobileDrawer() {
    this.isMobileDrawerOpen.set(true);
  }

  /** Closes the mobile drawer when the overlay menu is active. */
  closeMobileDrawer() {
    this.isMobileDrawerOpen.set(false);
  }

  /** Toggles the mobile overlay drawer open/closed. */
  toggleMobileDrawer() {
    this.isMobileDrawerOpen.update((open) => !open);
  }

  /** Handles menu item activation — closes mobile drawer in overlay mode. */
  onMenuItemActivated() {
    if (this.isOverlayMode()) {
      this.closeMobileDrawer();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.syncOverlayMode();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOverlayMode() && this.isMobileDrawerOpen()) {
      this.closeMobileDrawer();
    }
  }

  /** Syncs sidebar mode with the current viewport width. */
  private syncOverlayMode(hasStoredSidebarState = false) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const isOverlay = window.matchMedia(this.overlayMediaQuery).matches;
    this.isOverlayMode.set(isOverlay);

    if (isOverlay) {
      // Mobile always starts with the drawer closed — never restore an open state.
      this.isMobileDrawerOpen.set(false);
    } else if (!hasStoredSidebarState) {
      // Returning to desktop without a stored preference: default to expanded.
      this.isDesktopCollapsed.set(false);
    }
  }

  /** Restores desktop collapsed/expanded preference from localStorage. */
  private restoreDesktopState(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const stored = localStorage.getItem(this.storageKey);
    if (stored !== 'true' && stored !== 'false') {
      return false;
    }

    // Key stores the *expanded* state: 'true' = expanded (not collapsed).
    this.setDesktopCollapsed(stored === 'false', false);
    return true;
  }

  private setDesktopCollapsed(isCollapsed: boolean, persist = true) {
    this.isDesktopCollapsed.set(isCollapsed);

    if (!persist || !isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(this.storageKey, String(!isCollapsed));
  }
}
