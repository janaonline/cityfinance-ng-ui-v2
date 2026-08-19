import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { SignedUrlDirective } from '../../../../core/directives/storage-url.directive';
import { AmountDisplayModeService } from '../../../../core/services/amount-display-mode.service';
import { StateService } from '../../../../core/services/state/state.service';
import { UtilityService } from '../../../../core/services/utility.service';
import { IState } from '../../../../core/models/state/state';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import {
  UploadedFileMetadata,
  normalizeUploadedFileMetadata,
} from '../../../../shared/dynamic-form/components/file/file-metadata.types';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import {
  BulkRejectRowsDialogComponent,
  BulkRejectRowsDialogData,
} from './dialogs/bulk-reject-rows-dialog/bulk-reject-rows-dialog.component';
import {
  MohuaRemarksDialogComponent,
  MohuaRemarksDialogData,
} from './dialogs/mohua-remarks-dialog/mohua-remarks-dialog.component';
import {
  FcUnspentMohuaReviewData,
  FcUnspentMohuaRow,
  FcUnspentMohuaRowsQuery,
  ROW_STATUS,
  RowStatusType,
} from './fc-unspent-review.models';
import { FcUnspentMohuaReviewService } from './fc-unspent-review.service';
import { extractApiErrorResponse, ROW_STATUS_BADGE_CLASS, ROW_STATUS_LABEL } from './fc-unspent-review.utils';

const ROWS_PAGE_SIZE = 20;

@Component({
  selector: 'app-fc-unspent-mohua-review',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    PreLoaderComponent,
    SignedUrlDirective,
    DatePipe,
    DecimalPipe,
    AmountDisplayToggleComponent,
  ],
  templateUrl: './fc-unspent-review.component.html',
  styleUrl: './fc-unspent-review.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FcUnspentMohuaReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(FcUnspentMohuaReviewService);
  private readonly stateService = inject(StateService);
  private readonly amountDisplay = inject(AmountDisplayModeService);

  readonly formatAmount = (value: number | null | undefined) => this.amountDisplay.format(value, 'inr');
  readonly formatAmountExact = (value: number | null | undefined) => this.amountDisplay.formatExact(value);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly dialog = inject(MatDialog);

  readonly yearId = computed(() => this.moduleService.yearId() ?? '');
  readonly stateId = signal<string | null>(null);

  // ─── State picker (shown when no :stateId route param is present) ──────────
  readonly states = signal<IState[]>([]);
  readonly isLoadingStates = signal(false);
  readonly pickerStateId = signal<string | null>(null);

  // ─── Review metadata ─────────────────────────────────────────────────────
  readonly review = signal<FcUnspentMohuaReviewData | null>(null);
  readonly isLoadingReview = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly formError = signal<string | null>(null);

  readonly isYesBranch = computed(() => this.review()?.isFcUnspent === true);
  readonly isNoBranch = computed(() => this.review()?.isFcUnspent === false);
  readonly declarationFile = computed<UploadedFileMetadata | null>(() =>
    normalizeUploadedFileMetadata(this.review()?.fcDeclaration ?? null),
  );

  readonly canView = computed(() => this.review()?.permissions.canView ?? false);
  readonly canApproveForm = computed(() => this.review()?.permissions.canApproveForm ?? false);
  readonly canRejectForm = computed(() => this.review()?.permissions.canRejectForm ?? false);
  readonly canReviewRows = computed(() => this.review()?.permissions.canReviewRows ?? false);

  // ─── Rows ────────────────────────────────────────────────────────────────
  readonly rows = signal<FcUnspentMohuaRow[]>([]);
  readonly rowsTotal = signal(0);
  readonly rowsPage = signal(1);
  readonly rowsLimit = ROWS_PAGE_SIZE;
  readonly isLoadingRows = signal(false);
  readonly rowLoadError = signal<string | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.rowsTotal() / this.rowsLimit)));
  readonly hasPrev = computed(() => this.rowsPage() > 1);
  readonly hasNext = computed(() => this.rowsPage() < this.totalPages());

  filterForm = this.fb.group({
    search: [''],
    rowStatus: [''],
    eligibility: [''],
  });

  // ─── Selection (keyed by row id, storing the row itself so permissions survive paging) ────
  readonly selectedRows = signal<Map<string, FcUnspentMohuaRow>>(new Map());
  readonly selectedCount = computed(() => this.selectedRows().size);
  readonly reviewableRowsOnPage = computed(() =>
    this.rows().filter((r) => r.permissions.canApprove || r.permissions.canReject),
  );
  readonly allReviewableSelectedOnPage = computed(() => {
    const reviewable = this.reviewableRowsOnPage();
    return reviewable.length > 0 && reviewable.every((r) => this.selectedRows().has(r._id));
  });
  readonly canBulkApprove = computed(() => {
    const selected = Array.from(this.selectedRows().values());
    return selected.length > 0 && selected.every((r) => r.permissions.canApprove);
  });
  readonly canBulkReject = computed(() => {
    const selected = Array.from(this.selectedRows().values());
    return selected.length > 0 && selected.every((r) => r.permissions.canReject);
  });

  // ─── Mutation state ──────────────────────────────────────────────────────
  readonly isBulkApproving = signal(false);
  readonly isBulkRejecting = signal(false);
  readonly isApprovingForm = signal(false);
  readonly isRejectingForm = signal(false);

  private rowsRequestId = 0;

  readonly ROW_STATUS = ROW_STATUS;
  readonly ROW_STATUS_LABEL = ROW_STATUS_LABEL;
  readonly ROW_STATUS_BADGE_CLASS = ROW_STATUS_BADGE_CLASS;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const stateId = params.get('stateId');
      this.stateId.set(stateId && stateId !== 'undefined' ? stateId : null);
      this.resetForNewContext();

      if (!this.stateId()) {
        this.loadStatesForPicker();
        return;
      }
      if (!this.yearId()) {
        this.loadError.set('Missing year context. Please navigate here from the MoHUA menu.');
        return;
      }
      this.loadReview();
    });

    this.setupFilterSubscription();
  }

  private resetForNewContext(): void {
    this.review.set(null);
    this.loadError.set(null);
    this.formError.set(null);
    this.rows.set([]);
    this.rowsTotal.set(0);
    this.rowsPage.set(1);
    this.rowLoadError.set(null);
    this.clearSelection();
  }

  // ─── State picker ────────────────────────────────────────────────────────

  private loadStatesForPicker(): void {
    this.isLoadingStates.set(true);
    this.stateService
      .getStates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.states.set(res.data ?? []);
          this.isLoadingStates.set(false);
        },
        error: () => {
          this.isLoadingStates.set(false);
          this.utilityService.triggerSnackbar('Unable to load the list of states.', 'snackbar-danger');
        },
      });
  }

  goToState(): void {
    const stateId = this.pickerStateId();
    if (!stateId) return;
    void this.router.navigate(['/xvifc', this.yearId(), 'fc-unspent-review', stateId]);
  }

  // ─── Metadata load ───────────────────────────────────────────────────────

  loadReview(): void {
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    this.isLoadingReview.set(true);
    this.loadError.set(null);

    this.service
      .getReview(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          this.isLoadingReview.set(false);
          if (data.isFcUnspent === true) {
            this.rowsPage.set(1);
            this.loadRows();
          }
        },
        error: (err: unknown) => {
          this.isLoadingReview.set(false);
          const response = extractApiErrorResponse(err);
          this.loadError.set(response?.message ?? 'Unable to load the review data. Please try again.');
          this.utilityService.triggerSnackbar('Unable to load the review data.', 'snackbar-danger');
        },
      });
  }

  /** Reloads metadata, then (Yes branch only) reloads the current row page — never resets to page 1
   *  and never locally patches status/rows/summaries; the reloaded response is the only source of truth. */
  private reloadAfterMutation(): void {
    this.clearSelection();
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    this.service
      .getReview(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.review.set(data);
          if (data.isFcUnspent === true) this.loadRows();
        },
        error: () => {
          this.utilityService.triggerSnackbar('Review data may be stale — please reload the page.', 'snackbar-danger');
        },
      });
  }

  // ─── Rows load (debounced filters, request-race protection, empty-page step-back) ──────────

  loadRows(): void {
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    const requestId = ++this.rowsRequestId;
    this.isLoadingRows.set(true);
    this.rowLoadError.set(null);

    const { search, rowStatus, eligibility } = this.filterForm.getRawValue();
    const query: FcUnspentMohuaRowsQuery = {
      page: this.rowsPage(),
      limit: this.rowsLimit,
      search: search || undefined,
      // Native <select> FormControls always read back a string from the DOM, even though
      // RowStatusType is numeric — convert explicitly rather than casting past it.
      rowStatus: rowStatus ? (Number(rowStatus) as RowStatusType) : undefined,
      eligibility: eligibility === '' ? undefined : eligibility === 'true',
    };

    this.service
      .getRows(stateId, yearId, query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (requestId !== this.rowsRequestId) return;
          if (res.rows.length === 0 && this.rowsPage() > 1) {
            this.rowsPage.update((p) => p - 1);
            this.loadRows();
            return;
          }
          this.rows.set(res.rows);
          this.rowsTotal.set(res.total);
          this.isLoadingRows.set(false);
        },
        error: () => {
          if (requestId !== this.rowsRequestId) return;
          this.isLoadingRows.set(false);
          this.rowLoadError.set('Unable to load rows. Please try again.');
          this.utilityService.triggerSnackbar('Unable to load rows.', 'snackbar-danger');
        },
      });
  }

  goToRowsPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.rowsPage.set(page);
    this.loadRows();
  }

  private setupFilterSubscription(): void {
    const { search, rowStatus, eligibility } = this.filterForm.controls;
    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      rowStatus.valueChanges,
      eligibility.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.rowsPage.set(1);
        this.clearSelection();
        this.loadRows();
      });
  }

  // ─── Selection ───────────────────────────────────────────────────────────

  isSelected(rowId: string): boolean {
    return this.selectedRows().has(rowId);
  }

  toggleRow(row: FcUnspentMohuaRow): void {
    if (!row.permissions.canApprove && !row.permissions.canReject) return;
    this.selectedRows.update((map) => {
      const next = new Map(map);
      if (next.has(row._id)) next.delete(row._id);
      else next.set(row._id, row);
      return next;
    });
  }

  toggleSelectAllOnPage(): void {
    const reviewable = this.reviewableRowsOnPage();
    const allSelected = this.allReviewableSelectedOnPage();
    this.selectedRows.update((map) => {
      const next = new Map(map);
      for (const row of reviewable) {
        if (allSelected) next.delete(row._id);
        else next.set(row._id, row);
      }
      return next;
    });
  }

  clearSelection(): void {
    this.selectedRows.set(new Map());
  }

  // ─── Bulk approve ────────────────────────────────────────────────────────

  onBulkApprove(): void {
    if (!this.canBulkApprove() || this.isBulkApproving()) return;
    const count = this.selectedCount();

    this.confirmDialogService
      .confirm({
        title: 'Approve selected rows?',
        message: `Approve ${count} selected row(s)? This cannot be undone.`,
        confirmText: 'Yes, approve',
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
        icon: 'bi-check-circle-fill',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submitBulkApprove();
      });
  }

  private submitBulkApprove(): void {
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    const rowIds = Array.from(this.selectedRows().keys());
    this.isBulkApproving.set(true);
    this.formError.set(null);

    this.service
      .bulkApproveRows({ stateId, yearId, rowIds })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isBulkApproving.set(false);
          this.utilityService.triggerSnackbar(`${rowIds.length} row(s) approved.`, 'snackbar-success');
          this.reloadAfterMutation();
        },
        error: (err: unknown) => {
          this.isBulkApproving.set(false);
          this.applyFormLevelError(err, 'Unable to approve the selected rows. Please try again.');
        },
      });
  }

  // ─── Bulk reject ─────────────────────────────────────────────────────────

  onBulkReject(): void {
    if (!this.canBulkReject() || this.isBulkRejecting()) return;
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    const dialogData: BulkRejectRowsDialogData = { stateId, yearId, rows: Array.from(this.selectedRows().values()) };
    this.dialog
      .open(BulkRejectRowsDialogComponent, { data: dialogData, width: '640px', maxHeight: '80vh' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (!succeeded) return;
        this.utilityService.triggerSnackbar('Selected rows rejected.', 'snackbar-success');
        this.reloadAfterMutation();
      });
  }

  // ─── Complete-form actions ───────────────────────────────────────────────

  onApproveForm(): void {
    if (!this.canApproveForm() || this.isApprovingForm()) return;
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    this.confirmDialogService
      .confirm({
        title: 'Approve FC Unspent Declaration?',
        message: 'Approve the complete FC Unspent Declaration for this state? This cannot be undone.',
        confirmText: 'Yes, approve',
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
        icon: 'bi-check-circle-fill',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.isApprovingForm.set(true);
        this.formError.set(null);

        this.service
          .approveForm(stateId, yearId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isApprovingForm.set(false);
              this.utilityService.triggerSnackbar('FC Unspent Declaration approved.', 'snackbar-success');
              this.reloadAfterMutation();
            },
            error: (err: unknown) => {
              this.isApprovingForm.set(false);
              this.applyFormLevelError(err, 'Unable to approve the declaration. Please try again.');
            },
          });
      });
  }

  onRejectForm(): void {
    if (!this.canRejectForm() || this.isRejectingForm()) return;
    const stateId = this.stateId();
    const yearId = this.yearId();
    if (!stateId || !yearId) return;

    const dialogData: MohuaRemarksDialogData = {
      stateId,
      yearId,
      title: 'Reject FC Unspent Declaration',
      description: 'This returns the complete declaration to the State. Provide remarks explaining the rejection.',
      submitLabel: 'Reject declaration',
    };

    this.dialog
      .open(MohuaRemarksDialogComponent, { data: dialogData, width: '480px' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((succeeded) => {
        if (!succeeded) return;
        this.utilityService.triggerSnackbar('FC Unspent Declaration returned to the State.', 'snackbar-success');
        this.reloadAfterMutation();
      });
  }

  private applyFormLevelError(err: unknown, fallback: string): void {
    const response = extractApiErrorResponse(err);
    const formErrors = response?.errors?.['_form'];
    const message = formErrors?.length ? formErrors.map((e) => e.message).join(' ') : (response?.message ?? fallback);
    this.formError.set(message);
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
  }
}
