import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AmountDisplayModeService } from '../../../../../../core/services/amount-display-mode.service';
import { ClaimLetterDocumentData } from '../../claim-letter.models';

export interface ClaimLetterDocumentPreviewDialogData {
  documentData: ClaimLetterDocumentData;
}

/**
 * Read-only preview of the claim letter (Covering Letter / Annexure 1 / Annexure 2 tabs) opened by
 * the "Preview Template" supporting-content action — renders the exact same `ClaimLetterDocumentData`
 * the "Download Template" action turns into a PDF via `buildClaimLetterPdfDocDefinition`, so the two
 * never drift apart (one fetch, two renderers — see `claim-letter-detail.component.ts`).
 */
@Component({
  selector: 'app-claim-letter-document-preview-dialog',
  imports: [DatePipe, MatDialogModule, MatTabsModule],
  templateUrl: './claim-letter-document-preview-dialog.component.html',
  styleUrl: './claim-letter-document-preview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimLetterDocumentPreviewDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ClaimLetterDocumentPreviewDialogComponent>);
  readonly data = inject<ClaimLetterDocumentPreviewDialogData>(MAT_DIALOG_DATA);
  private readonly amountDisplay = inject(AmountDisplayModeService);

  // Mirrors the exact PDF byte-for-byte (see class doc comment) — must never drift because of a
  // user's global display override, so this always shows exact whole Rupees.
  readonly formatAmount = (value: number | null | undefined) =>
    this.amountDisplay.format(value, 'inr', { ignoreOverride: true });
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);

  /** "AFS = Audited Financial Statement · Provisional FS = ..." — dynamically generated from
   *  whichever criteria are actually enabled, so the legend always matches Annexure 2's columns
   *  (built here rather than in the template to avoid stray whitespace from a multi-line `@for`). */
  readonly annexure2Legend = computed(() =>
    this.data.documentData.annexure2Columns.map((col) => `${col.shortLabel} = ${col.label}`).join(' · '),
  );

  close(): void {
    this.dialogRef.close();
  }
}
