import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
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
  readonly supportingContent = input<FieldSupportingContent[] | undefined>(undefined);
  readonly position = input<FieldSupportingContentPosition>('before');

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
      (item): item is Extract<FieldSupportingContent, { type: 'warning' }> =>
        item.type === 'warning',
    ),
  );

  readonly sampleColumnsItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'sample-columns' }> =>
        item.type === 'sample-columns',
    ),
  );

  readonly readonlyCardItems = computed(() =>
    this.itemsForPosition().filter(
      (item): item is Extract<FieldSupportingContent, { type: 'readonly-card' }> =>
        item.type === 'readonly-card',
    ),
  );
}
