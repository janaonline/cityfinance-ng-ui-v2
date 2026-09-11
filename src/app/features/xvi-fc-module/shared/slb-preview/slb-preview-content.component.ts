import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ConditionalFieldConfig } from '../../dynamic-form-visibility.service';
import { SlbFormBodyComponent } from '../slb-form-body/slb-form-body.component';

/**
 * Read-only rendering of the SLB form: shared by `SlbPreviewDialogComponent` (the "Preview" modal)
 * and the off-screen host captured for "Download PDF" in `SlbComponent`, so both always show the
 * exact same layout/labels/values as each other — see `app-slb-form-body`'s `mode="view"`, which
 * reads straight off the live `FormGroup` regardless of the form's edit/view mode or disabled state.
 */
@Component({
  selector: 'app-slb-preview-content',
  imports: [SlbFormBodyComponent],
  templateUrl: './slb-preview-content.component.html',
  styleUrl: './slb-preview-content.component.scss',
})
export class SlbPreviewContentComponent {
  readonly form = input.required<FormGroup>();
  readonly fields = input.required<ConditionalFieldConfig[]>();
  readonly ulbName = input('');
  readonly formStatusLabel = input('');
  readonly actualYearLabel = input<string | null>(null);
  readonly targetYearLabel = input<string | null>(null);
}
