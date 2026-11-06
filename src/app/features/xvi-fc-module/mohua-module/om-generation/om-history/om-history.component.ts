import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import FileSaver from 'file-saver';
import { UtilityService } from '../../../../../core/services/utility.service';
import { themedDialogConfig } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { formatReceivedOn, formatRupeesInCrore } from '../../claims-submission/claims-submission.models';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { findRouteParam } from '../../route-params.util';
import { OM_STATUS_LABEL, OmHistoryRow } from '../om-generation.models';
import { OmGenerationService } from '../om-generation.service';
import {
  OmSignedUploadDialogComponent,
  OmSignedUploadDialogData,
} from '../om-signed-upload-dialog/om-signed-upload-dialog.component';
import { OmStepsComponent } from '../om-steps/om-steps.component';

const LOAD_ERROR = 'Could not load the OM history. Please try again.';

/** Every issued OM of the year with its status, the signed copy (View PDF) and the generated OM PDF with its annexures. */
@Component({
  selector: 'app-om-history',
  imports: [MohuaPageLoaderComponent, OmStepsComponent],
  templateUrl: './om-history.component.html',
  styleUrl: './om-history.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(OmGenerationService);
  private readonly dialog = inject(MatDialog);
  private readonly utilityService = inject(UtilityService);
  private readonly destroyRef = inject(DestroyRef);
  /** Must be resolved in this field-initializer injection context — see themedDialogConfig's own doc. */
  private readonly dialogConfig = themedDialogConfig();

  readonly formatCrore = formatRupeesInCrore;
  readonly formatDate = formatReceivedOn;
  readonly statusLabel = OM_STATUS_LABEL;
  private readonly yearId = findRouteParam(this.route.snapshot, 'yearId');

  readonly rows = signal<OmHistoryRow[] | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly downloadingId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getHistory(this.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (rows) => {
          this.rows.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(LOAD_ERROR);
          this.loading.set(false);
        },
      });
  }

  download(row: OmHistoryRow): void {
    this.downloadingId.set(row.omId);
    this.service
      .downloadPdf(row.omId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.downloadingId.set(null);
          FileSaver.saveAs(file.blob, file.fileName ?? `${row.refNo || 'Office-Memorandum'}.pdf`);
        },
        error: (err: HttpErrorResponse) => {
          this.downloadingId.set(null);
          const message = err.error?.message;
          this.utilityService.triggerSnackbar(typeof message === 'string' ? message : 'Could not download the OM.', 'snackbar-danger');
        },
      });
  }

  upload(row: OmHistoryRow): void {
    this.dialog
      .open<OmSignedUploadDialogComponent, OmSignedUploadDialogData, OmHistoryRow | undefined>(OmSignedUploadDialogComponent, {
        ...this.dialogConfig,
        data: { omId: row.omId, refNo: row.refNo, ulbCount: row.ulbCount, justGenerated: false },
        width: '560px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        if (!updated) return;
        this.utilityService.triggerSnackbar('Signed OM uploaded.', 'snackbar-success');
        this.rows.update((rows) => rows?.map((r) => (r.omId === updated.omId ? updated : r)) ?? rows);
      });
  }
}
