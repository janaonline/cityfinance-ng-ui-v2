import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import FileSaver from 'file-saver';
import { AuthPermissionService } from '../../../../../core/auth/auth-permission.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { themedDialogConfig } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { formatReceivedOn, formatRupeesInCrore } from '../../claims-submission/claims-submission.models';
import { MohuaPageLoaderComponent } from '../../page-loader/page-loader.component';
import { findRouteParam } from '../../route-params.util';
import { OM_STATUS_LABEL, OmHistoryRow, OmStageFilter, matchesOmSearch, omStage } from '../om-generation.models';
import { OmGenerationService } from '../om-generation.service';
import {
  OmSignedUploadDialogComponent,
  OmSignedUploadDialogData,
} from '../om-signed-upload-dialog/om-signed-upload-dialog.component';
import { OmStepsComponent } from '../om-steps/om-steps.component';

const LOAD_ERROR = 'Could not load the OM history. Please try again.';

/**
 * Every OM of the year: Generated (PDF created) or Issued (signed copy uploaded, dated from the OM's "Dated"), with
 * the State's allocation and the amount claimed, the signed copy (View PDF) and the OM PDF with its annexures.
 */
@Component({
  selector: 'app-om-history',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MohuaPageLoaderComponent,
    OmStepsComponent,
  ],
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

  /** PMU and the MoHUA viewer read this page only: the MoHUA admin and reviewer upload the signed OM. */
  private readonly auth = inject(AuthPermissionService);
  readonly canUpload = this.auth.isMohuaUser() && this.auth.canIssueOfficeMemorandum();
  readonly formatCrore = formatRupeesInCrore;
  readonly formatDate = formatReceivedOn;
  readonly statusLabel = OM_STATUS_LABEL;
  private readonly yearId = findRouteParam(this.route.snapshot, 'yearId');

  readonly rows = signal<OmHistoryRow[] | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly downloadingId = signal<string | null>(null);

  /** Search (State, OM no., claim letter no.) and the State / OM status filters; all on the loaded list. */
  readonly query = signal('');
  readonly stateFilter = signal<string>('ALL');
  readonly stageFilter = signal<OmStageFilter>('ALL');
  readonly stageOptions: readonly { value: OmStageFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'GENERATED', label: OM_STATUS_LABEL.GENERATED },
    { value: 'ISSUED', label: OM_STATUS_LABEL.SIGNED_UPLOADED },
  ];

  readonly stateOptions = computed(() =>
    [...new Map((this.rows() ?? []).map((r) => [r.stateId, r.stateName || r.stateCode])).entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  readonly filteredRows = computed(() =>
    (this.rows() ?? []).filter(
      (r) =>
        (this.stateFilter() === 'ALL' || r.stateId === this.stateFilter()) &&
        (this.stageFilter() === 'ALL' || omStage(r.status) === this.stageFilter()) &&
        matchesOmSearch(this.query(), r.stateName, r.refNo, r.omNumber, r.claimLetterRefNo),
    ),
  );

  readonly isFiltered = computed(
    () => !!this.query().trim() || this.stateFilter() !== 'ALL' || this.stageFilter() !== 'ALL',
  );

  clearFilters(): void {
    this.query.set('');
    this.stateFilter.set('ALL');
    this.stageFilter.set('ALL');
  }

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
          this.utilityService.triggerSnackbar(
            typeof message === 'string' ? message : 'Could not download the OM.',
            'snackbar-danger',
          );
        },
      });
  }

  upload(row: OmHistoryRow): void {
    this.dialog
      .open<OmSignedUploadDialogComponent, OmSignedUploadDialogData, OmHistoryRow | undefined>(
        OmSignedUploadDialogComponent,
        {
          ...this.dialogConfig,
          data: { omId: row.omId, refNo: row.refNo, ulbCount: row.ulbCount, justGenerated: false },
          width: '560px',
          maxWidth: '95vw',
        },
      )
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => {
        if (!updated) return;
        this.utilityService.triggerSnackbar('Signed OM uploaded.', 'snackbar-success');
        this.rows.update((rows) => rows?.map((r) => (r.omId === updated.omId ? updated : r)) ?? rows);
      });
  }
}
