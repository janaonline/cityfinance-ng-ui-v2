import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import {
  FieldSupportingAction,
  FieldSupportingActionEvent,
  FieldSupportingBadge,
  FieldSupportingContent,
  FieldSupportingContentPosition,
} from '../../field.interface';

@Component({
  selector: 'app-field-supporting-content',
  standalone: true,
  imports: [],
  templateUrl: './field-supporting-content.component.html',
  styleUrl: './field-supporting-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldSupportingContentComponent {
  private readonly router = inject(Router);

  /** All supporting content items configured for the parent field. */
  readonly supportingContent = input<FieldSupportingContent[] | undefined>(undefined);

  /** Whether to render items placed before or after the form control. Defaults to `'before'`. */
  readonly position = input<FieldSupportingContentPosition>('before');

  /** The key of the parent field — included in emitted action events. */
  readonly fieldKey = input<string>('');

  /** Emitted when an action button (without a URL) is clicked. */
  readonly supportingAction = output<FieldSupportingActionEvent>();

  private readonly itemsForPosition = computed(() => {
    const items = this.supportingContent() ?? [];
    const pos = this.position();
    return items.filter((item) => (item.position ?? 'before') === pos);
  });

  readonly templateDownloadItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'template-download' }> =>
        item.type === 'template-download',
    ),
  );

  readonly infoItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'info' }> => item.type === 'info',
    ),
  );

  readonly warningItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'warning' }> => item.type === 'warning',
    ),
  );

  readonly sampleColumnsItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'sample-columns' }> => item.type === 'sample-columns',
    ),
  );

  readonly readonlyCardItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'readonly-card' }> => item.type === 'readonly-card',
    ),
  );

  readonly actionItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'actions' }> => item.type === 'actions',
    ),
  );

  visibleActions(actions?: FieldSupportingAction[]): FieldSupportingAction[] {
    return (actions ?? []).filter((a) => a.visible !== false);
  }

  visibleBadges(badges?: FieldSupportingBadge[]): FieldSupportingBadge[] {
    return (badges ?? []).filter((b) => b.visible !== false);
  }

  actionToneClass(action: FieldSupportingAction): string {
    const map: Record<string, string> = {
      primary: 'link-primary',
      secondary: 'link-secondary',
      success: 'link-success',
      warning: 'link-warning',
      danger: 'link-danger',
      info: 'link-info',
      muted: 'text-body-secondary',
    };
    return map[action.tone ?? 'primary'] ?? 'link-primary';
  }

  badgeToneClass(badge: FieldSupportingBadge): string {
    const map: Record<string, string> = {
      primary: 'text-bg-primary',
      secondary: 'text-bg-secondary',
      success: 'text-bg-success',
      warning: 'text-bg-warning',
      danger: 'text-bg-danger',
      info: 'text-bg-info',
      muted: 'text-bg-light border text-body-secondary',
    };
    return map[badge.tone ?? 'secondary'] ?? 'text-bg-secondary';
  }

  handleAction(action: FieldSupportingAction): void {
    if (action.disabled || action.loading || action.url) return;
    this.supportingAction.emit({ fieldKey: this.fieldKey(), actionId: action.id, meta: action.meta });
  }

  /** Internal app routes only — never prefixed with a host/domain. */
  isInternalActionUrl(url: string): boolean {
    return url.startsWith('/');
  }

  isExternalActionUrl(url: string): boolean {
    return url.startsWith('https://');
  }

  /**
   * Routes an action's `url` through the Angular router for internal paths or
   * `window.open` for `https://` external links. Invalid/unrecognized URL shapes
   * are blocked (no-op) rather than falling back to a raw same-tab navigation.
   */
  onActionUrlClick(event: MouseEvent, action: FieldSupportingAction): void {
    if (!action.url || action.disabled || action.loading) return;

    if (this.isInternalActionUrl(action.url)) {
      event.preventDefault();
      this.router.navigateByUrl(action.url);
      return;
    }

    if (this.isExternalActionUrl(action.url)) {
      event.preventDefault();
      window.open(action.url, '_blank', 'noopener,noreferrer');
      return;
    }

    event.preventDefault();
  }
}
