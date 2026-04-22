import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { MenuItem } from './interface';

@Component({
  selector: 'app-menu-item',
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './app.menu-item.html',
  styleUrl: './app.menu-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppMenuItemComponent {
  readonly item = input.required<MenuItem>();
  readonly root = input<boolean>(false);
  readonly collapsed = input<boolean>(false);

  readonly hasChildren = computed(() => !!this.item().items?.length);
  readonly isExternalLink = computed(() => !!this.item().url);
  readonly isInternalLink = computed(() => !!this.item().routerLink);

  expanded = linkedSignal(() => this.item().expanded ?? true);

  toggle() {
    this.expanded.update((v) => !v);
  }

  trackByLabel(idx: number, item: MenuItem): string {
    return `${item.label}_${idx}`;
  }
}
