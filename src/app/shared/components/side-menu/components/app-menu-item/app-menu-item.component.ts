import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './app-menu-item.component.html',
  styleUrl: './app-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppMenuItemComponent {
  readonly item = input.required<MenuItem>();
  readonly root = input<boolean>(false);
  readonly collapsed = input<boolean>(false);

  /**
   * Emitted when any interactive element in this item is activated
   * (router link click, external link click, or command execution).
   * The parent menu listens to this to close the mobile drawer.
   */
  readonly itemActivated = output<void>();

  readonly hasChildren = computed(() => !!this.item().items?.length);
  readonly isExternalLink = computed(() => !!this.item().url);
  readonly isInternalLink = computed(() => !!this.item().routerLink);
  readonly isCommandItem = computed(() => !!this.item().command && !this.item().routerLink && !this.item().url);

  /** True when the item is disabled — blocks all interaction and removes it from tab order. */
  readonly isDisabled = computed(() => !!this.item().disabled);

  /**
   * Stable kebab-case ID for the submenu `<ul>`, referenced by the parent
   * toggle button via `aria-controls`. Label-derived for Phase 2; Phase 3
   * will use a proper `MenuItem.id` field.
   */
  readonly submenuId = computed(() => {
    const key = this.item()
      .label.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `submenu-${key}`;
  });

  expanded = linkedSignal(() => this.item().expanded ?? true);

  toggle() {
    if (this.isDisabled()) return;
    this.expanded.update((v) => !v);
  }

  /** Runs the item's command callback and signals that this item was activated. */
  executeCommand() {
    if (this.isDisabled()) return;
    this.item().command?.();
    this.itemActivated.emit();
  }

  /** Signals that a router-link item was activated. */
  onLinkActivated() {
    if (this.isDisabled()) return;
    this.itemActivated.emit();
  }

  /**
   * Prevents navigation for disabled external links and signals activation otherwise.
   * Called with the raw MouseEvent so `preventDefault()` can cancel the href navigation.
   */
  onExternalLinkActivated(event: MouseEvent) {
    if (this.isDisabled()) {
      event.preventDefault();
      return;
    }
    this.itemActivated.emit();
  }

  trackByLabel(idx: number, item: MenuItem): string {
    return `${item.label}_${idx}`;
  }
}
