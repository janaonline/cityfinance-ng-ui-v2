import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl } from '@angular/forms';
import type { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { ClaimLetterLetterFieldComponent } from '../../../state-module/claim-letter/components/letter-field/claim-letter-letter-field.component';
import { OmContent, OmRun } from '../om-generation.models';

/** The boxes MoHUA fills, by field key; null renders the OM read-only. */
export interface OmEditor {
  fields: Record<string, ConditionalFieldConfig>;
  controls: Record<string, FormControl>;
}

/**
 * A paper-like preview of the OM PDF: every line comes from the backend model, and a run with a `field` becomes an
 * inline box (the claim letter's own box component) while an editor is passed.
 */
@Component({
  selector: 'app-om-document',
  imports: [NgTemplateOutlet, ClaimLetterLetterFieldComponent],
  templateUrl: './om-document.component.html',
  styleUrl: './om-document.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmDocumentComponent {
  readonly content = input.required<OmContent>();
  readonly editor = input<OmEditor | null>(null);
  /** A box was left (text) or changed (date): its key, so the page can save it. */
  readonly fieldCommitted = output<string>();

  slot(run: OmRun): { field: ConditionalFieldConfig; control: FormControl } | null {
    const editor = this.editor();
    if (!editor || !run.field) return null;
    const field = editor.fields[run.field];
    const control = editor.controls[run.field];
    return field && control ? { field, control } : null;
  }

  printed(run: OmRun): string {
    return run.lead && run.text && !run.placeholder ? run.lead + run.text : run.text;
  }
}
