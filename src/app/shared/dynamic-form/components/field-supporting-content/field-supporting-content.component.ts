import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldSupportingContent, FieldSupportingContentPosition } from '../../field.interface';

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

  /**
   * Filters all supporting content to only those matching the current position.
   * Items without an explicit position default to `'before'`.
   */
  private readonly itemsForPosition = computed(() => {
    const items = this.supportingContent() ?? [];
    const pos = this.position();
    return items.filter((item) => (item.position ?? 'before') === pos);
  });

  /** Template-download items for the current position. */
  readonly templateDownloadItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'template-download' }> =>
        item.type === 'template-download',
    ),
  );

  /** Informational items for the current position. */
  readonly infoItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'info' }> => item.type === 'info',
    ),
  );

  /** Warning items for the current position. */
  readonly warningItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'warning' }> => item.type === 'warning',
    ),
  );

  /** Sample-column hint items for the current position. */
  readonly sampleColumnsItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'sample-columns' }> => item.type === 'sample-columns',
    ),
  );

  /** Read-only summary card items for the current position. */
  readonly readonlyCardItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'readonly-card' }> => item.type === 'readonly-card',
    ),
  );
}
