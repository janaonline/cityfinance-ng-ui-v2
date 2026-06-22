import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
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
}
