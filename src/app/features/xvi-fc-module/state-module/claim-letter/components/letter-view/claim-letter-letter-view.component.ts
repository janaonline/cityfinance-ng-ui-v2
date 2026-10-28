import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConditionalFieldConfig } from '../../../../dynamic-form-visibility.service';
import {
  CLAIM_LETTER_DOCUMENT_PAGE_SIZE,
  ClaimLetterAnnexureRow,
  ClaimLetterColumnKind,
  ClaimLetterDocument,
  ClaimLetterListKey,
  ClaimLetterRun,
} from '../../claim-letter.models';
import { ClaimLetterLetterFieldComponent } from '../letter-field/claim-letter-letter-field.component';

/** One annexure list's current page, owned by the parent (rows are fetched server-side). */
export interface ClaimLetterListPage {
  rows: ClaimLetterAnnexureRow[];
  pageIndex: number;
  loading: boolean;
}

export interface ClaimLetterListPageChange {
  list: ClaimLetterListKey;
  pageIndex: number;
}

/** Letter-detail controls and their formjson fields, by key; a slot with both becomes a box. */
export interface ClaimLetterLetterEditor {
  controls: Record<string, FormControl>;
  fields: Record<string, ConditionalFieldConfig>;
}

interface SlotEditor {
  field: ConditionalFieldConfig;
  control: FormControl;
}

/**
 * The claim letter model - covering letter, compliance table and the two annexure lists - with every
 * word taken verbatim from the backend so it matches the .docx. With an `editor`, each letter-detail
 * slot is drawn as an inline box instead of its printed value.
 */
@Component({
  selector: 'app-claim-letter-letter-view',
  imports: [NgTemplateOutlet, MatPaginatorModule, MatTooltipModule, ClaimLetterLetterFieldComponent],
  templateUrl: './claim-letter-letter-view.component.html',
  styleUrl: './claim-letter-letter-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterLetterViewComponent {
  readonly document = input.required<ClaimLetterDocument>();
  readonly pages = input.required<Record<ClaimLetterListKey, ClaimLetterListPage>>();
  readonly editor = input<ClaimLetterLetterEditor | null>(null);
  readonly pageChange = output<ClaimLetterListPageChange>();
  readonly fieldCommitted = output<string>();

  readonly pageSize = CLAIM_LETTER_DOCUMENT_PAGE_SIZE;

  alignClass(kind: ClaimLetterColumnKind): string {
    return kind === 'name' ? 'text-start' : kind === 'amount' ? 'text-end' : 'text-center';
  }

  slotEditor(run: ClaimLetterRun): SlotEditor | null {
    const editor = this.editor();
    if (!editor || !run.field) return null;
    const field = editor.fields[run.field];
    const control = editor.controls[run.field];
    return field && control ? { field, control } : null;
  }

  /** Same rule as the .docx: `lead` only before a filled value. */
  printed(run: ClaimLetterRun): string {
    return run.lead && run.text && !run.placeholder ? run.lead + run.text : run.text;
  }

  onPage(list: ClaimLetterListKey, event: PageEvent): void {
    this.pageChange.emit({ list, pageIndex: event.pageIndex });
  }
}
