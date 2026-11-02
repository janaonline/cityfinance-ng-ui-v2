import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, startWith } from 'rxjs';
import { FieldSupportingActionEvent, FieldSupportingContent } from '../../../../../shared/dynamic-form/field.interface';
import { withSupportingActionState } from '../../../../../shared/dynamic-form/supporting-action-state';
import { UtilityService } from '../../../../../core/services/utility.service';
import {
  CANCEL_CONFIRM_DIALOG_DEFAULTS,
  ConfirmDialogData,
  resolveThemeClass,
  themedDialogConfig,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { AmountDisplayToggleComponent } from '../../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { PreLoaderComponent } from '../../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../../shared/dynamic-form/dynamic-form.service';
import {
  UploadedFileMetadata,
  isUploadedFileMetadata,
} from '../../../../../shared/dynamic-form/components/file/file-metadata.types';
import { ConditionalFieldConfig } from '../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../xvi-fc-module.service';
import { XvifcBreadcrumbComponent, XvifcBreadcrumbLink } from '../../../shared/breadcrumb/breadcrumb.component';
import {
  FORM_STATUS,
  FormProgressComponent,
  FormStatusValue,
} from '../../../shared/form-progress/form-progress.component';
import {
  ClaimUlbRowGroup,
  ClaimUlbTableComponent,
  createClaimUlbRowGroup,
} from '../components/claim-ulb-table/claim-ulb-table.component';
import {
  ClaimLetterSummaryTilesComponent,
  ClaimLetterSummaryTile,
} from '../components/summary-tiles/claim-letter-summary-tiles.component';
import {
  CLAIM_LETTER_ERROR_CODE,
  CLAIM_LETTER_INSTALLMENT,
  ClaimLetterApiErrorMap,
  ClaimLetterBatchSummary,
  ClaimLetterClaimContext,
  ClaimLetterFinalPdf,
  ClaimLetterUlbRow,
  ClaimLetterUlbSelection,
} from '../claim-letter.models';
import { parseFieldPrefixedMessages } from '../../../common/utils/xvi-fc-error-lookup.utils';
import { AmountDisplayModeService } from '../../../../../core/services/amount-display-mode.service';
import { ClaimLetterService } from '../claim-letter.service';
import { buildBatchNarrative, readApiError } from '../claim-letter.utils';
import {
  ClaimLetterDocumentPreviewDialogComponent,
  ClaimLetterDocumentPreviewDialogData,
  ClaimLetterDocumentPreviewDialogResult,
} from '../components/document-preview-dialog/claim-letter-document-preview-dialog.component';
import { ClaimLetterFinalClaimLetterComponent } from '../components/final-claim-letter/claim-letter-final-claim-letter.component';
import { MatCardModule } from '@angular/material/card';

/** Must match the backend's `CLAIM_LETTER_ACTION_PREVIEW_TEMPLATE`. */
const CLAIM_LETTER_ACTION = {
  PREVIEW_TEMPLATE: 'preview-template',
} as const;

const CLAIM_LETTER_SAVE_REMOVES_SIGNED_FILE_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Save changes and remove the signed letter?',
  message:
    'Saving changes the ULBs in this claim, so the uploaded signed letter will be removed. You will need to download, sign and upload it again.',
  confirmText: 'Save',
  cancelText: 'Cancel',
  confirmButtonColor: 'warn',
  icon: 'bi-exclamation-triangle-fill',
};

/** Same ULBs with the same claimed amounts as the last load. */
function sameAsSaved(selections: readonly ClaimLetterUlbSelection[], saved: readonly ClaimLetterUlbRow[]): boolean {
  if (selections.length !== saved.length) return false;
  const claimed = new Map(saved.map((row) => [row.ulbId, row.claimAmount]));
  return selections.every((s) => claimed.get(s.ulbId) === s.claimedAmount);
}

function submitConfirm(
  pageCount: number | null,
  exemptionUnderReviewUlbs: number,
  stateExemptionsUnderReview: readonly string[],
): Required<ConfirmDialogData> {
  const size = pageCount ? ` (${pageCount} ${pageCount === 1 ? 'page' : 'pages'})` : '';
  const pending: string[] = [];
  if (stateExemptionsUnderReview.length) {
    pending.push(`The State's exemption request for ${stateExemptionsUnderReview.join(', ')} is under MoHUA review.`);
  }
  if (exemptionUnderReviewUlbs) {
    pending.push(
      `${exemptionUnderReviewUlbs} ${exemptionUnderReviewUlbs === 1 ? 'ULB in this claim relies' : 'ULBs in this claim rely'} on exemption requests under MoHUA review.`,
    );
  }
  const exemptions = pending.length ? ` ${pending.join(' ')} MoHUA decides them during the claim review.` : '';
  return {
    title: 'Submit to MoHUA?',
    message: `Submit the final claim letter${size} to MoHUA? You cannot edit it after submission unless MoHUA returns it.${exemptions}`,
    confirmText: 'Yes, submit',
    cancelText: 'No, check again',
    confirmButtonColor: 'primary',
    icon: 'bi-send-check-fill',
  };
}

const CLAIM_LETTER_ABANDON_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Abandon this claim letter draft?',
  message: 'This draft and its selected ULBs will be marked as abandoned. This cannot be undone.',
  confirmText: 'Yes, abandon',
  cancelText: 'No, keep editing',
  confirmButtonColor: 'warn',
  icon: 'bi-x-circle-fill',
};

/** The backend's `ulbSelections.<index>.<field>` error keys, from an `errors` map or `buildErrorMapFromMessages`. */
const CLAIM_ROW_ERROR_KEY_PATTERN = /^ulbSelections\.(\d+)\.(ulbId|claimedAmount)$/;

@Component({
  selector: 'app-claim-letter-detail',
  imports: [
    MatCardModule,
    MatButtonModule,
    PreLoaderComponent,
    ClaimUlbTableComponent,
    DynamicFormComponent,
    FormProgressComponent,
    XvifcBreadcrumbComponent,
    ClaimLetterSummaryTilesComponent,
    AmountDisplayToggleComponent,
    ClaimLetterFinalClaimLetterComponent,
  ],
  templateUrl: './claim-letter-detail.component.html',
  styleUrl: './claim-letter-detail.component.scss',
})
export class ClaimLetterDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly claimLetterService = inject(ClaimLetterService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly amountDisplay = inject(AmountDisplayModeService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  /** For the preview dialog, opened through `MatDialog` directly, which takes a bare panelClass. */
  private readonly themeClass = resolveThemeClass();
  private readonly dynamicService = inject(DynamicFormService);
  private readonly dialog = inject(MatDialog);

  /** `new` (or no param) means create mode. Read once: `new` and `:claimLetterId` are separate
   *  routes, so a mode change always creates a new component. */
  private readonly routeClaimLetterId = this.route.snapshot.paramMap.get('claimLetterId');
  readonly isCreateMode = this.routeClaimLetterId === null || this.routeClaimLetterId === 'new';

  readonly claimLetterId = signal<string | null>(this.isCreateMode ? null : this.routeClaimLetterId);
  readonly claim = signal<ClaimLetterBatchSummary | null>(null);
  readonly installment = CLAIM_LETTER_INSTALLMENT;

  readonly rows = new FormArray<ClaimUlbRowGroup>([]);
  readonly savedUlbRows = signal<readonly ClaimLetterUlbRow[]>([]);

  /** Claim-context, in both modes: create-mode totals, the narrative and the final-batch check. A
   *  failed load is non-fatal (no `loadError`). */
  readonly eligibilityOverview = signal<ClaimLetterClaimContext | null>(null);

  /** From getDetail in edit mode, claim-context in create mode; 90 / 110 only shows before either loads. */
  readonly varianceLowerPercent = computed(
    () => this.claim()?.varianceLowerPercent ?? this.eligibilityOverview()?.varianceLowerPercent ?? 90,
  );
  readonly varianceUpperPercent = computed(
    () => this.claim()?.varianceUpperPercent ?? this.eligibilityOverview()?.varianceUpperPercent ?? 110,
  );

  /** OnPush child: needs `refreshValidationDisplay()` after this component changes a row control. */
  private readonly claimTable = viewChild(ClaimUlbTableComponent);

  /** The signed-file field from getDetail's `questions` (formjson-driven, never hand-written here). */
  readonly signedClaimFileField = signal<ConditionalFieldConfig | null>(null);
  readonly signedFileForm = new FormGroup({});

  /** `rows` as a signal, structural changes included. `?? null` because typed forms mark each value
   *  optional (disabled controls), though `getRawValue()` never omits them. */
  private readonly rowValues = toSignal(
    this.rows.valueChanges.pipe(
      startWith(this.rows.getRawValue()),
      map((values) =>
        values.map((value) => ({ ulbId: value.ulbId ?? null, claimedAmount: value.claimedAmount ?? null })),
      ),
    ),
    { initialValue: [] as { ulbId: string | null; claimedAmount: number | null }[] },
  );

  /** Rows differ from the last save. The letter shows saved data only, so its action is disabled meanwhile. */
  readonly hasUnsavedRowChanges = computed(() => {
    if (this.isCreateMode) return false;
    const savedAmountByUlbId = new Map(this.savedUlbRows().map((row) => [row.ulbId, row.claimAmount]));
    const liveRows = this.rowValues().filter(
      (row): row is { ulbId: string; claimedAmount: number } => row.ulbId !== null && row.claimedAmount !== null,
    );
    if (liveRows.length !== savedAmountByUlbId.size) return true;
    return liveRows.some((row) => savedAmountByUlbId.get(row.ulbId) !== row.claimedAmount);
  });

  /** The signed-file field with "Letter details & Preview" disabled, and the reason shown, while rows
   *  are unsaved (a client-only state the backend cannot know). */
  readonly effectiveSignedClaimFileField = computed<ConditionalFieldConfig | null>(() => {
    const field = this.signedClaimFileField();
    if (!field) return field;

    const unsaved = this.hasUnsavedRowChanges();
    if (!unsaved) return field;

    const withActionState = withSupportingActionState(field, [
      { actionId: CLAIM_LETTER_ACTION.PREVIEW_TEMPLATE, disabled: true },
    ]);

    return {
      ...withActionState,
      supportingContent: withActionState.supportingContent?.map(
        (block): FieldSupportingContent =>
          block.type === 'actions'
            ? {
                ...block,
                description: 'Save your changes to update the claim letter preview.',
                descriptionTone: 'danger',
              }
            : block,
      ),
    };
  });

  /** The claim and its ULB rows (`loadDetail`). */
  readonly isLoading = signal(false);
  /** Claim-context (`loadEligibilityOverview`), tracked apart so whichever request ends first does not
   *  end the other's spinner. */
  readonly contextLoading = signal(false);
  readonly pageLoading = computed(() => this.isLoading() || this.contextLoading());
  readonly loadError = signal(false);
  readonly isSaving = signal(false);
  readonly isAbandoning = signal(false);
  readonly isUploadingSignedFile = signal(false);
  readonly isSubmitting = signal(false);
  /** Set by the final claim letter card once its copy is ready (null while it checks). */
  readonly finalPdf = signal<ClaimLetterFinalPdf | null>(null);
  /** What Submit sends: only a draft's copy (a removed signed letter hides it) with no required
   *  document missing. */
  readonly submittableFinalPdf = computed(() => {
    const finalPdf = this.finalPdf();
    if (this.claim()?.finalClaimLetterStage !== 'DRAFT' || !finalPdf) return null;
    return finalPdf.missingRequired.length ? null : finalPdf;
  });
  /** After Submit the submitted copy replaces the upload field. */
  readonly showSignedFileField = computed(() => this.claim()?.finalClaimLetterStage !== 'SUBMITTED');

  /** Banner text from the most recent failed create, save, abandon, upload or submit. */
  readonly formLevelErrors = signal<readonly string[]>([]);

  /** Backend gates, never inferred from status; create mode has no batch yet, so it uses `canCreate`. */
  readonly canEdit = computed(() => {
    if (this.isCreateMode) return this.eligibilityOverview()?.canCreate ?? false;
    return this.claim()?.permissions.canEdit ?? false;
  });

  readonly canFinalSubmit = computed(() => this.claim()?.permissions.canFinalSubmit ?? false);

  /** Why Submit is unavailable for reasons the backend reports: another active batch (which also
   *  hides Submit, via `canFinalSubmit`) or missing mandatory letter details. */
  readonly submitBlockedReason = computed<string | null>(() => {
    const claim = this.claim();
    if (!claim || this.isCreateMode) return null;
    if (claim.blockedReason) return claim.blockedReason;
    if (claim.permissions.canFinalSubmit && claim.letterDetailsComplete === false) {
      return 'Complete the mandatory letter details (Letter details & Preview) before submitting.';
    }
    return null;
  });

  readonly stateName = computed(() => {
    if (this.isCreateMode) return this.eligibilityOverview()?.stateName ?? '';
    return this.claim()?.stateName ?? '';
  });

  /** Saves a round trip: the last batch slot cannot be submitted while any ULB is in no batch (the
   *  backend enforces it too). */
  readonly finalBatchIncomplete = computed(() => {
    const claim = this.claim();
    const overview = this.eligibilityOverview();
    if (!claim || !overview) return false;
    return claim.batchNumber === overview.batchSlotsMax && overview.remainingUlbCount > 0;
  });

  /** Narrowed to `FormStatusValue` here rather than widening the shared component's input. */
  readonly currentFormStatusValue = computed<FormStatusValue>(
    () => (this.claim()?.currentFormStatus ?? FORM_STATUS.NOT_STARTED) as FormStatusValue,
  );

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => {
    const listLink: XvifcBreadcrumbLink = {
      label: 'Claim Letter',
      routerLink: ['/xvifc', this.yearId, 'claim-letter'],
    };
    if (this.isCreateMode) return [listLink, { label: 'New Claim Letter' }];
    const claim = this.claim();
    return [listLink, { label: claim ? 'Batch #' + claim.batchNumber : 'Claim Letter' }];
  });

  /** Create mode: 3 State-wide tiles. Edit mode: 4, with this batch's claim and the remainder live
   *  from the table (the saved figure until the table renders). */
  readonly summaryTiles = computed<ClaimLetterSummaryTile[]>(() => {
    if (this.isCreateMode) {
      const overview = this.eligibilityOverview()?.financialOverview;
      if (!overview) return [];
      return [
        { label: 'Total Allocation', value: overview.totalInstallmentAllocation },
        { label: 'Already Claimed (Acknowledged)', value: overview.totalAlreadyAcknowledged },
        { label: 'Available to Claim', value: overview.availableToClaim },
      ];
    }

    const claim = this.claim();
    if (!claim) return [];
    const { totalInstallmentAllocation, totalAlreadyAcknowledged, totalClaimInProgress, totalClaimInDraft } =
      claim.financialSummary;
    const currentSelectedClaim = this.claimTable()?.totalClaim() ?? claim.financialSummary.currentSelectedClaim;

    return [
      { label: 'Total Allocation', value: totalInstallmentAllocation },
      { label: 'Already Claimed (Acknowledged)', value: totalAlreadyAcknowledged },
      { label: 'Claimed in This Batch', value: currentSelectedClaim },
      {
        label: 'Remaining After This Batch',
        value:
          totalInstallmentAllocation -
          totalAlreadyAcknowledged -
          totalClaimInProgress -
          totalClaimInDraft -
          currentSelectedClaim,
      },
    ];
  });

  /** Edit mode takes amounts from `claim().financialSummary`, which excludes this batch; the overview
   *  does not, and would count this batch twice. Counts and slots come from the overview. */
  readonly batchNarrative = computed<string[]>(() => {
    if (!this.canEdit()) return [];
    const overview = this.eligibilityOverview();
    if (!overview) return [];

    const rowCount = this.claimTable()?.currentUlbIds().length ?? 0;
    const liveClaimedTotal = this.claimTable()?.totalClaim() ?? 0;

    let totalInstallmentAllocation: number;
    let remainingAfterThisBatch: number;
    let slotsRemaining: number;

    if (this.isCreateMode) {
      const financialOverview = overview.financialOverview;
      totalInstallmentAllocation = financialOverview.totalInstallmentAllocation;
      remainingAfterThisBatch = financialOverview.availableToClaim - liveClaimedTotal;
      slotsRemaining = overview.nextBatchNumber !== null ? overview.batchSlotsMax - overview.nextBatchNumber : 0;
    } else {
      const claim = this.claim();
      if (!claim) return [];
      const {
        totalInstallmentAllocation: total,
        totalAlreadyAcknowledged,
        totalClaimInProgress,
        totalClaimInDraft,
      } = claim.financialSummary;
      totalInstallmentAllocation = total;
      remainingAfterThisBatch =
        total - totalAlreadyAcknowledged - totalClaimInProgress - totalClaimInDraft - liveClaimedTotal;
      slotsRemaining = overview.batchSlotsMax - overview.batchSlotsUsed;
    }

    return buildBatchNarrative({
      rowCount,
      expectedUlbCount: overview.expectedUlbCount,
      liveClaimedTotal,
      totalInstallmentAllocation,
      remainingAfterThisBatch,
      slotsRemaining,
      installment: CLAIM_LETTER_INSTALLMENT,
      formatAmount: (value) => this.amountDisplay.format(value, 'auto'),
    });
  });

  readonly hasInvalidRows = computed(() => (this.claimTable()?.invalidRowIdentifiers().length ?? 0) > 0);

  /** Same wording as the backend's rejection, so the user sees one message either way. */
  readonly rowValidationMessage = computed<string | null>(() => {
    const identifiers = this.claimTable()?.invalidRowIdentifiers() ?? [];
    return identifiers.length
      ? `The following ULBs are ineligible or have an invalid claimed amount: ${identifiers.join(', ')}`
      : null;
  });

  get stateId(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadEligibilityOverview();
    if (!this.isCreateMode) {
      this.loadDetail();
    }
  }

  private loadEligibilityOverview(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.contextLoading.set(true);
    this.claimLetterService
      .getClaimContext(stateId, yearId, CLAIM_LETTER_INSTALLMENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (context) => {
          this.eligibilityOverview.set(context);
          this.contextLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load the claim-letter financial overview', err);
          this.contextLoading.set(false);
        },
      });
  }

  loadDetail(): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) return;

    this.isLoading.set(true);
    this.loadError.set(false);

    forkJoin({
      detail: this.claimLetterService.getDetail(claimLetterId),
      // Every page: the table total and the save payload need all of the batch's ULBs.
      ulbs: this.claimLetterService.getAllUlbs(claimLetterId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ detail, ulbs }) => {
          this.claim.set(detail);
          this.savedUlbRows.set(ulbs);
          this.hydrateRows(ulbs);
          this.initSignedFileFormIfNeeded(detail);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load Claim Letter', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar('Unable to load the claim letter. Please try again.', 'snackbar-danger');
        },
      });
  }

  private hydrateRows(rows: readonly ClaimLetterUlbRow[]): void {
    this.rows.clear();
    for (const row of rows) {
      this.rows.push(createClaimUlbRowGroup(this.canEdit(), { ulbId: row.ulbId, claimedAmount: row.claimAmount }));
    }
  }

  /** The control is built once per component instance (the user's in-progress file selection must
   *  survive a reload); the field config is refreshed on every load so its supporting content stays
   *  current, and a signed file removed server-side (ULB or letter-details edit) clears the control. */
  private initSignedFileFormIfNeeded(detail: ClaimLetterBatchSummary): void {
    const field = detail.questions?.find((question) => question.key === 'signedClaimFile') ?? null;
    if (!field) return;
    this.signedClaimFileField.set(field);

    const existing = this.signedFileForm.get('signedClaimFile') as AbstractControl<unknown> | null;
    if (existing) {
      if (!detail.hasSignedFile && existing.value) existing.setValue(null, { emitEvent: false });
      return;
    }

    const control = this.dynamicService.createContorl(field, false, false);
    this.signedFileForm.addControl('signedClaimFile', control);

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((raw: unknown) => {
      if (!isUploadedFileMetadata(raw)) return;
      this.uploadSignedFile(raw);
    });
  }

  /** Re-reads only the batch summary (not every ULB page) after a dialog changed something. */
  private refreshSummary(): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) return;
    this.claimLetterService
      .getDetail(claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => {
          this.claim.set(detail);
          this.initSignedFileFormIfNeeded(detail);
        },
        error: (err: unknown) => console.error('Failed to refresh the claim letter', err),
      });
  }

  private uploadSignedFile(fileRef: UploadedFileMetadata): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) return;

    this.isUploadingSignedFile.set(true);

    this.claimLetterService
      .uploadSignedFile(claimLetterId, fileRef)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isUploadingSignedFile.set(false);
          this.utilityService.triggerSnackbar('Signed claim letter uploaded.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          console.error('Failed to upload the signed claim letter', err);
          this.isUploadingSignedFile.set(false);
          (this.signedFileForm.get('signedClaimFile') as AbstractControl<unknown> | null)?.setValue(null, {
            emitEvent: false,
          });
          this.handleSaveError(err, 'Unable to upload the signed claim letter. Please try again.');
        },
      });
  }

  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey !== 'signedClaimFile') return;
    // The button is disabled too (effectiveSignedClaimFileField); this guards a stale click.
    if (this.hasUnsavedRowChanges()) return;
    if (event.actionId === CLAIM_LETTER_ACTION.PREVIEW_TEMPLATE) this.previewTemplate();
  }

  /** Opens the letter full-screen with inline boxes for the details; a save may have removed the
   *  signed letter, so the summary is refreshed afterwards. */
  previewTemplate(): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) return;
    this.dialog
      .open<
        ClaimLetterDocumentPreviewDialogComponent,
        ClaimLetterDocumentPreviewDialogData,
        ClaimLetterDocumentPreviewDialogResult
      >(ClaimLetterDocumentPreviewDialogComponent, {
        data: { claimLetterId },
        panelClass: [...(this.themeClass ? [this.themeClass] : []), 'cl-fullscreen-dialog-panel'],
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        autoFocus: false,
        disableClose: true,
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result?.saved) this.refreshSummary();
      });
  }

  /** Submits the final claim letter the card shows (View is on the card itself). */
  submitToMohua(): void {
    const claimLetterId = this.claimLetterId();
    const finalPdf = this.submittableFinalPdf();
    if (!claimLetterId || !finalPdf || this.isSubmitting()) return;
    if (!this.claim()?.hasSignedFile || this.finalBatchIncomplete() || this.submitBlockedReason()) return;

    this.confirmDialogService
      .confirm(
        submitConfirm(
          finalPdf.pageCount,
          this.claim()?.exemptionUnderReviewUlbCount ?? 0,
          this.claim()?.stateExemptionsUnderReview ?? [],
        ),
        this.dialogConfig,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submit(claimLetterId, finalPdf.sourceKey);
      });
  }

  private submit(claimLetterId: string, sourceKey: string): void {
    this.isSubmitting.set(true);
    this.formLevelErrors.set([]);
    this.claimLetterService
      .submit(claimLetterId, sourceKey)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.utilityService.triggerSnackbar('Claim letter submitted to MoHUA.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          if (readApiError(err).code === CLAIM_LETTER_ERROR_CODE.FINAL_PDF_OUTDATED) {
            this.utilityService.triggerSnackbar(
              'The documents changed. Check the updated final claim letter and submit again.',
              'snackbar-warn',
            );
            // A new summary makes the card fetch the updated copy.
            this.refreshSummary();
            return;
          }
          this.handleSaveError(err, 'Unable to submit the claim letter. Please try again.');
        },
      });
  }

  createDraft(): void {
    if (!this.validateRows()) {
      this.utilityService.triggerSnackbar('Please correct the errors before creating the draft.', 'snackbar-danger');
      return;
    }

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.isSaving.set(true);
    this.formLevelErrors.set([]);

    this.claimLetterService
      .createDraft(stateId, yearId, CLAIM_LETTER_INSTALLMENT, { ulbSelections: this.buildUlbSelections() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (claim) => {
          this.isSaving.set(false);
          this.utilityService.triggerSnackbar('Claim letter draft created.', 'snackbar-success');
          this.router.navigate(['/xvifc', yearId, 'claim-letter', claim.claimLetterId], { replaceUrl: true });
        },
        error: (err: unknown) => {
          console.error('Failed to create Claim Letter draft', err);
          this.isSaving.set(false);
          this.handleSaveError(err, 'Unable to create the claim letter draft. Please try again.');
        },
      });
  }

  saveChanges(): void {
    if (!this.validateRows()) {
      this.utilityService.triggerSnackbar('Please correct the errors before saving.', 'snackbar-danger');
      return;
    }

    const claim = this.claim();
    const claimLetterId = this.claimLetterId();
    if (!claim || !claimLetterId) return;

    const selections = this.buildUlbSelections();
    if (sameAsSaved(selections, this.savedUlbRows())) {
      this.utilityService.triggerSnackbar('No changes to save.', 'snackbar-warn');
      return;
    }
    if (!claim.hasSignedFile) {
      this.updateDraft(claimLetterId, selections, claim.revision);
      return;
    }
    this.confirmDialogService
      .confirm(CLAIM_LETTER_SAVE_REMOVES_SIGNED_FILE_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.updateDraft(claimLetterId, selections, claim.revision);
      });
  }

  private updateDraft(claimLetterId: string, selections: ClaimLetterUlbSelection[], revision: number): void {
    this.isSaving.set(true);
    this.formLevelErrors.set([]);

    this.claimLetterService
      .updateDraft(claimLetterId, { ulbSelections: selections, expectedRevision: revision })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.utilityService.triggerSnackbar('Claim letter updated.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          console.error('Failed to update Claim Letter draft', err);
          this.isSaving.set(false);
          this.handleSaveError(err, 'Unable to save changes. Please try again.');
        },
      });
  }

  abandonDraft(): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId || !this.canEdit()) return;

    this.confirmDialogService
      .confirm(CLAIM_LETTER_ABANDON_CONFIRM, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.doAbandon(claimLetterId);
      });
  }

  private doAbandon(claimLetterId: string): void {
    this.isAbandoning.set(true);
    this.formLevelErrors.set([]);

    this.claimLetterService
      .abandonDraft(claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isAbandoning.set(false);
          this.utilityService.triggerSnackbar('Claim letter draft abandoned.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          console.error('Failed to abandon Claim Letter draft', err);
          this.isAbandoning.set(false);
          this.handleSaveError(err, 'Unable to abandon the draft. Please try again.');
        },
      });
  }

  cancel(): void {
    if (this.rows.length === 0) {
      this.goToList();
      return;
    }

    this.confirmDialogService
      .confirm(CANCEL_CONFIRM_DIALOG_DEFAULTS, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.goToList();
      });
  }

  private goToList(): void {
    this.router.navigate(['/xvifc', this.yearId, 'claim-letter']);
  }

  private buildUlbSelections(): ClaimLetterUlbSelection[] {
    return this.rows.controls
      .filter((row) => row.controls.ulbId.value !== null && row.controls.claimedAmount.value !== null)
      .map((row) => ({
        ulbId: row.controls.ulbId.value as string,
        claimedAmount: row.controls.claimedAmount.value as number,
      }));
  }

  /** At least one row and every row valid: a claim draft has no partial-save mode. */
  private validateRows(): boolean {
    let valid = this.rows.length > 0;

    for (const row of this.rows.controls) {
      if (row.invalid) {
        valid = false;
        row.controls.ulbId.markAsTouched();
        row.controls.claimedAmount.markAsTouched();
      }
    }

    // Row state changed outside the OnPush child's template.
    this.claimTable()?.refreshValidationDisplay();

    return valid;
  }

  private handleSaveError(err: unknown, fallbackMessage: string): void {
    const api = readApiError(err);
    const message = api.message ?? fallbackMessage;
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
    this.formLevelErrors.set([message]);

    // A bare class-validator message array (no `errors` map) still points at rows.
    const errors = api.errors ?? this.buildErrorMapFromMessages(api.messages ?? []);
    if (errors) this.applyRowApiErrors(errors);
  }

  /** Class-validator messages to row error keys; unmatched ones go under `_form`, shown only in the banner. */
  private buildErrorMapFromMessages(messages: readonly string[]): ClaimLetterApiErrorMap | undefined {
    if (!messages.length) return undefined;

    const { claimed, unclaimed } = parseFieldPrefixedMessages(messages, ['ulbId', 'claimedAmount'], 'ulbSelections');
    const errors: ClaimLetterApiErrorMap = {};
    for (const entry of claimed) {
      const key = entry.rowIndex !== null ? `ulbSelections.${entry.rowIndex}.${entry.field}` : entry.field;
      errors[key] = [...(errors[key] ?? []), { message: entry.message }];
    }
    if (unclaimed.length) {
      errors['_form'] = unclaimed.map((message) => ({ message }));
    }
    return Object.keys(errors).length ? errors : undefined;
  }

  /** Payload indexes match `rows.controls` because a save only goes out once every row is complete. */
  private applyRowApiErrors(errors: ClaimLetterApiErrorMap): void {
    for (const [key, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors?.length) continue;

      const rowMatch = CLAIM_ROW_ERROR_KEY_PATTERN.exec(key);
      if (!rowMatch) continue;

      const row = this.rows.controls[Number(rowMatch[1])];
      const control = row?.controls[rowMatch[2] as 'ulbId' | 'claimedAmount'];
      if (!control) continue;

      control.setErrors({ ...(control.errors ?? {}), apiErrors: fieldErrors.map((e) => e.message) });
      control.markAsTouched();
    }

    // Same OnPush nudge as validateRows().
    this.claimTable()?.refreshValidationDisplay();
  }
}
