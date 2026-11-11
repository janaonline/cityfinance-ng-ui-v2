import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { StateNotificationService } from '../../../../../features/xvi-fc-module/state-module/state-notification.service';
import { UlbNotificationService } from '../../../../../features/xvi-fc-module/ulb-module/ulb-notification.service';
import { MenuItem } from '../../models/menu.model';

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './app-menu-item.component.html',
  styleUrl: './app-menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppMenuItemComponent {
  private readonly ulbNotifications = inject(UlbNotificationService);
  private readonly stateNotifications = inject(StateNotificationService);
  private readonly router = inject(Router);

  readonly item = input.required<MenuItem>();
  readonly root = input<boolean>(false);
  readonly collapsed = input<boolean>(false);

  /** Colored-dot severity for this item's route, if it has a pending ULB or State notification (only
   *  the signed-in role's service ever has any, so no role check is needed here). */
  readonly badgeSeverity = computed(() => {
    const key = this.routeKey(this.item().routerLink);
    if (!key) return undefined;
    return this.ulbNotifications.severityByRoute().get(key) ?? this.stateNotifications.severityByRoute().get(key);
  });

  /** Last path segment of a routerLink, array or string form. */
  private routeKey(link: unknown[] | string | undefined): string | undefined {
    if (Array.isArray(link)) {
      const last = link.at(-1);
      return typeof last === 'string' ? last : undefined;
    }
    if (typeof link !== 'string') return undefined;
    return link.split('/').filter(Boolean).pop();
  }

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

  private readonly currentMenuGroup = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.deepestMenuGroup()),
    ),
    { initialValue: this.deepestMenuGroup() },
  );

  /** Finds the deepest matched route and reads its merged data.menuGroup, shared by routes tagged with the same group via parent inheritance or individual configuration.*/
  private deepestMenuGroup(): string | undefined {
    let node = this.router.routerState.snapshot.root;
    while (node.firstChild) node = node.firstChild;
    return node.data['menuGroup'] as string | undefined;
  }

  /** True when the route's menuGroup matches this item's path segment, keeping worklist navigation active on sibling detail routes that routerLinkActive cannot detect. */
  readonly isActiveViaMenuGroup = computed(() => {
    const group = this.currentMenuGroup();
    if (!group) return false;
    return this.routeKey(this.item().routerLink) === group;
  });

  /** Tracks routerLinkActive via (isActiveChange), avoiding inconsistent reads of its mutable, non-signal isActive property across template bindings. */
  private readonly nativeIsActive = signal(false);

  onNativeActiveChange(isActive: boolean): void {
    this.nativeIsActive.set(isActive);
  }

  /** Drives the active class and aria-current when either the link matches or its menuGroup is active. */
  readonly isActive = computed(() => this.nativeIsActive() || this.isActiveViaMenuGroup());

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
