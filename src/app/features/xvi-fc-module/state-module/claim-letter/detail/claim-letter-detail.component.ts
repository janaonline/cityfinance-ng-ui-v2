import { NgTemplateOutlet } from '@angular/common';
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
  ClaimRowRejection,
  ClaimUlbRowGroup,
  ClaimUlbTableComponent,
  createClaimUlbRowGroup,
} from '../components/claim-ulb-table/claim-ulb-table.component';
import {
  CLAIM_LETTER_TILE_LABELS,
  ClaimLetterSummaryTilesComponent,
  ClaimLetterSummaryTile,
  claimsUnderReviewTotal,
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
import { buildBatchNarrative, ineligibleUlbsMessage, readApiError } from '../claim-letter.utils';
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

/** Same ULBs with the same claimed amounts as the last load; ULBs only while the switch is off. */
function sameAsSaved(
  selections: readonly ClaimLetterUlbSelection[],
  saved: readonly ClaimLetterUlbRow[],
  claimAmountEditable: boolean,
): boolean {
  if (selections.length !== saved.length) return false;
  const claimed = new Map(saved.map((row) => [row.ulbId, row.claimAmount]));
  return selections.every(
    (s) => claimed.has(s.ulbId) && (!claimAmountEditable || claimed.get(s.ulbId) === s.claimedAmount),
  );
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
  title: 'Discard this claim letter draft?',
  message: 'This draft will be discarded, and its selected ULBs can be added to a new draft. This cannot be undone.',
  confirmText: 'Yes, discard',
  cancelText: 'No, keep editing',
  confirmButtonColor: 'warn',
  icon: 'bi-x-circle-fill',
};

/** The backend's `ulbSelections.<index>.<field>` error keys, from an `errors` map or `buildErrorMapFromMessages`. */
const CLAIM_ROW_ERROR_KEY_PATTERN = /^ulbSelections\.(\d+)\.(ulbId|claimedAmount)$/;

/** Replaces the list of codes when every row fails the State-level gate; no remove button then. */
const CLAIM_LETTER_STATE_GATE_FAILED_MESSAGE =
  'The State-level eligibility conditions are not met, so no ULB can be claimed right now. Removing ULBs will not fix this. See the eligibility checklist on the Claim Letters page.';

@Component({
  selector: 'app-claim-letter-detail',
  imports: [
    NgTemplateOutlet,
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

  /** formjson 26 switch, from getDetail in edit mode and claim-context in create mode. Off (also before
   *  either loads): each claim is its allocation, so `claimedAmount` is neither shown, validated nor sent. */
  readonly claimAmountEditable = computed(
    () => this.claim()?.claimAmountEditable ?? this.eligibilityOverview()?.claimAmountEditable ?? false,
  );

  /** From getDetail in edit mode, claim-context in create mode; 90 / 110 only shows before either loads. */
  readonly varianceLowerPercent = computed(
    () => this.claim()?.varianceLowerPercent ?? this.eligibilityOverview()?.varianceLowerPercent ?? 90,
  );
  readonly varianceUpperPercent = computed(
    () => this.claim()?.varianceUpperPercent ?? this.eligibilityOverview()?.varianceUpperPercent ?? 110,
  );

  /** OnPush child: needs `refreshValidationDisplay()` after this component changes a row control. */
  private readonly claimTable = viewChild(ClaimUlbTableComponent);

  /** The last batch slot, whose submit needs every ULB in a batch; the picker then says what is left. */
  readonly isFinalBatch = computed(() => {
    const overview = this.eligibilityOverview();
    if (!overview) return false;
    const batchNumber = this.isCreateMode ? overview.nextBatchNumber : this.claim()?.batchNumber;
    return batchNumber != null && batchNumber === overview.batchSlotsMax;
  });

  /** Rows the last save refused, by ULB id and field, with the server's reasons; cleared when the next
   *  save starts, and per ULB when the user removes it. Kept here, not on the controls: a row's
   *  `[formGroup]` re-validates (dropping set errors) whenever the table re-renders it, which paging
   *  and search do. */
  readonly rejectedRows = signal<ReadonlyMap<string, ClaimRowRejection>>(new Map());
  /** Every saved row fails the State-level gate, which removing ULBs cannot fix. */
  readonly stateGateFailed = computed(() => this.savedUlbRows().some((row) => row.stateGatePassed === false));
  /** ULBs still in the table that the last save refused; the save-error banner offers to remove them. */
  readonly refusedUlbIds = computed<ReadonlySet<string>>(() => {
    const table = this.claimTable();
    if (!table) return new Set();
    const rejected = this.rejectedRows();
    return new Set(table.currentUlbIds().filter((ulbId) => !!rejected.get(ulbId)?.ulbId));
  });
  /** ULBs known to be ineligible before any save; none while the State-level gate fails. */
  readonly ineligibleUlbIdsToRemove = computed<ReadonlySet<string>>(() => {
    const table = this.claimTable();
    if (!table || this.stateGateFailed()) return new Set();
    return new Set(table.ineligibleUlbIds());
  });

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
    if (!this.claimAmountEditable()) {
      const liveUlbIds = this.rowValues().flatMap((row) => (row.ulbId === null ? [] : [row.ulbId]));
      return liveUlbIds.length !== savedAmountByUlbId.size || liveUlbIds.some((id) => !savedAmountByUlbId.has(id));
    }
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
        { label: CLAIM_LETTER_TILE_LABELS.total, value: overview.totalInstallmentAllocation },
        { label: CLAIM_LETTER_TILE_LABELS.underReview, value: claimsUnderReviewTotal(overview) },
        { label: CLAIM_LETTER_TILE_LABELS.available, value: overview.availableToClaim },
      ];
    }

    const claim = this.claim();
    if (!claim) return [];
    const { totalInstallmentAllocation, totalAlreadyAcknowledged, totalClaimInProgress, totalClaimInDraft } =
      claim.financialSummary;
    const currentSelectedClaim = this.claimTable()?.totalClaim() ?? claim.financialSummary.currentSelectedClaim;

    return [
      { label: CLAIM_LETTER_TILE_LABELS.total, value: totalInstallmentAllocation },
      { label: CLAIM_LETTER_TILE_LABELS.underReview, value: claimsUnderReviewTotal(claim.financialSummary) },
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
    if (!identifiers.length) return null;
    return this.stateGateFailed() ? CLAIM_LETTER_STATE_GATE_FAILED_MESSAGE : ineligibleUlbsMessage(identifiers);
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

  /** One valueChanges for the whole batch, not one per row: a batch can hold hundreds. */
  private hydrateRows(rows: readonly ClaimLetterUlbRow[]): void {
    this.rows.clear({ emitEvent: false });
    for (const row of rows) {
      this.rows.push(createClaimUlbRowGroup(this.canEdit(), { ulbId: row.ulbId, claimedAmount: row.claimAmount }), {
        emitEvent: false,
      });
    }
    this.rows.updateValueAndValidity();
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

    const selections = this.buildUlbSelections();
    this.isSaving.set(true);
    this.formLevelErrors.set([]);
    this.rejectedRows.set(new Map());

    this.claimLetterService
      .createDraft(stateId, yearId, CLAIM_LETTER_INSTALLMENT, {
        ulbSelections: selections,
        idempotencyKey: this.createIdempotencyKey(selections),
      })
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
          this.handleSaveError(err, 'Unable to create the claim letter draft. Please try again.', selections);
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
    if (sameAsSaved(selections, this.savedUlbRows(), this.claimAmountEditable())) {
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
    this.rejectedRows.set(new Map());

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
          this.handleSaveError(err, 'Unable to save changes. Please try again.', selections);
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
          this.utilityService.triggerSnackbar('Claim letter draft discarded.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          console.error('Failed to abandon Claim Letter draft', err);
          this.isAbandoning.set(false);
          this.handleSaveError(err, 'Unable to discard the draft. Please try again.');
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

  /** The last create attempt. Re-sending the same selection reuses its key, so a create that timed out
   *  but finished on the server returns that batch instead of colliding with its own locks; a changed
   *  selection gets a new key. */
  private lastCreateAttempt: { selections: string; key: string } | null = null;

  private createIdempotencyKey(selections: readonly ClaimLetterUlbSelection[]): string {
    const signature = JSON.stringify(selections);
    if (this.lastCreateAttempt?.selections !== signature) {
      // randomUUID exists only on HTTPS and localhost; `npm run host` / `net` serve plain HTTP.
      const key =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
      this.lastCreateAttempt = { selections: signature, key };
    }
    return this.lastCreateAttempt.key;
  }

  /** No `claimedAmount` while the switch is off: the server stores each ULB's allocation. */
  private buildUlbSelections(): ClaimLetterUlbSelection[] {
    if (!this.claimAmountEditable()) {
      return this.rows.controls
        .filter((row) => row.controls.ulbId.value !== null)
        .map((row) => ({ ulbId: row.controls.ulbId.value as string }));
    }
    return this.rows.controls
      .filter((row) => row.controls.ulbId.value !== null && row.controls.claimedAmount.value !== null)
      .map((row) => ({
        ulbId: row.controls.ulbId.value as string,
        claimedAmount: row.controls.claimedAmount.value as number,
      }));
  }

  /** At least one row and every row valid: a claim draft has no partial-save mode. The hidden
   *  claim amount is not checked while the switch is off. */
  private validateRows(): boolean {
    let valid = this.rows.length > 0;
    const claimAmountEditable = this.claimAmountEditable();

    for (const row of this.rows.controls) {
      if (claimAmountEditable ? row.invalid : row.controls.ulbId.invalid) {
        valid = false;
        row.controls.ulbId.markAsTouched();
        if (claimAmountEditable) row.controls.claimedAmount.markAsTouched();
      }
    }

    // Row state changed outside the OnPush child's template.
    this.claimTable()?.refreshValidationDisplay();

    return valid;
  }

  /** Drops the given rows in one structural change, then asks for a fresh save. */
  removeUlbRows(ulbIds: ReadonlySet<string>): void {
    if (!this.canEdit() || this.isSaving() || ulbIds.size === 0) return;

    // From the end, so the indexes still to visit stay valid.
    for (let i = this.rows.length - 1; i >= 0; i--) {
      const ulbId = this.rows.at(i).controls.ulbId.value;
      if (ulbId && ulbIds.has(ulbId)) this.rows.removeAt(i, { emitEvent: false });
    }
    this.rows.updateValueAndValidity();
    this.forgetRejected([...ulbIds]);
    this.formLevelErrors.set([]);
    const n = ulbIds.size;
    this.utilityService.triggerSnackbar(
      `Removed ${n} ${n === 1 ? 'ULB' : 'ULBs'}. Save again to continue.`,
      'snackbar-success',
    );
  }

  /** A removed ULB's refusal goes with it, so adding it back later shows no stale mark. */
  forgetRejected(ulbIds: readonly string[]): void {
    const current = this.rejectedRows();
    if (!ulbIds.some((ulbId) => current.has(ulbId))) return;
    const next = new Map(current);
    for (const ulbId of ulbIds) next.delete(ulbId);
    this.rejectedRows.set(next);
  }

  /** `sent`: the selections a save sent, which its row errors point into; other requests have none. */
  private handleSaveError(err: unknown, fallbackMessage: string, sent?: readonly ClaimLetterUlbSelection[]): void {
    const api = readApiError(err);
    const message = api.message ?? fallbackMessage;
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
    this.formLevelErrors.set([message]);
    if (!sent) return;

    // A bare class-validator message array (no `errors` map) still points at rows.
    const errors = api.errors ?? this.buildErrorMapFromMessages(api.messages ?? []);
    if (errors) this.applyRowApiErrors(errors, sent);
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

  /** Each key indexes the request that was `sent`, so it resolves through that request's ULB id, never
   *  through a row position, which could have moved since (the table is locked while saving, too). */
  private applyRowApiErrors(errors: ClaimLetterApiErrorMap, sent: readonly ClaimLetterUlbSelection[]): void {
    const rowByUlbId = new Map(this.rows.controls.map((row) => [row.controls.ulbId.value, row]));
    const rejected = new Map<string, ClaimRowRejection>();
    for (const [key, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors?.length) continue;

      const rowMatch = CLAIM_ROW_ERROR_KEY_PATTERN.exec(key);
      if (!rowMatch) continue;

      const selection = sent[Number(rowMatch[1])];
      const row = selection ? rowByUlbId.get(selection.ulbId) : undefined;
      if (!selection || !row) continue;

      const field = rowMatch[2] as 'ulbId' | 'claimedAmount';
      const control = row.controls[field];
      control.setErrors({ ...(control.errors ?? {}), apiErrors: fieldErrors.map((e) => e.message) });
      control.markAsTouched();

      // A refused ULB can only be removed; a refused amount is fixed by editing it.
      const message = fieldErrors.map((e) => e.message).join(' ');
      const entry: ClaimRowRejection = { ...rejected.get(selection.ulbId) };
      if (field === 'ulbId') entry.ulbId = message;
      else entry.claimedAmount = { message, sentAmount: selection.claimedAmount ?? null };
      rejected.set(selection.ulbId, entry);
    }
    this.rejectedRows.set(rejected);

    // Same OnPush nudge as validateRows().
    this.claimTable()?.refreshValidationDisplay();
  }
}
