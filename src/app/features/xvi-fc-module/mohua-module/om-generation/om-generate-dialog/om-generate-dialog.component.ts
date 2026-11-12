import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface OmGenerateDialogData {
  counts: { noActionRecorded: number; excluded: number; included: number };
}

/** `generate` issues the OM; `preview` closes so the OM can be read first; undefined = cancel. */
export type OmGenerateDialogResult = 'generate' | 'preview';

/** Confirms Generate OM with the city counts it covers. */
@Component({
  selector: 'app-om-generate-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="omg">
      <h2 mat-dialog-title class="omg-title">
        <i class="bi bi-info-circle" aria-hidden="true"></i> Generate Office Memorandum
      </h2>
      <mat-dialog-content>
        <p class="omg-lead">
          You are about to generate an Office Memorandum for <strong>{{ data.counts.included }} cities</strong>.
        </p>
        <dl class="omg-counts">
          <div>
            <dt>Cities with no MoHUA action recorded <span class="omg-muted">(treated as not objected to)</span></dt>
            <dd>{{ data.counts.noActionRecorded }}</dd>
          </div>
          <div class="omg-bad">
            <dt>Cities rejected / excluded from this OM</dt>
            <dd>{{ data.counts.excluded }}</dd>
          </div>
          <div class="omg-strong">
            <dt>Cities included in this OM</dt>
            <dd>{{ data.counts.included }}</dd>
          </div>
        </dl>
        <p class="omg-question">Do you want to proceed with OM generation? Once generated, the OM can no longer be edited.</p>
      </mat-dialog-content>
      <mat-dialog-actions class="omg-actions">
        <button matButton="filled" type="button" (click)="close('generate')">Proceed and generate OM</button>
        <button matButton="outlined" type="button" (click)="close('preview')">Preview OM first</button>
        <button matButton="outlined" type="button" (click)="close(undefined)">Cancel</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: `
    .omg-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.05rem;
    }
    .omg-lead,
    .omg-question {
      font-size: 0.9rem;
    }
    .omg-counts {
      margin: 1rem 0;
      padding: 0.25rem 1rem;
      border: 1px solid #e3e8ea;
      border-radius: 10px;
      background: #f7f9fa;
      div {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.7rem 0;
        font-size: 0.85rem;
      }
      div + div {
        border-top: 1px solid #e3e8ea;
      }
      dt {
        font-weight: 400;
      }
      dd {
        margin: 0;
        font-weight: 700;
      }
    }
    .omg-muted {
      color: #5b6b73;
      font-size: 0.75rem;
    }
    .omg-bad {
      color: #b42318;
    }
    .omg-strong dt {
      font-weight: 700;
    }
    .omg-actions {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmGenerateDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<OmGenerateDialogComponent, OmGenerateDialogResult | undefined>>(MatDialogRef);
  readonly data = inject<OmGenerateDialogData>(MAT_DIALOG_DATA);

  close(result: OmGenerateDialogResult | undefined): void {
    this.dialogRef.close(result);
  }
}
