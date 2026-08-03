import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, map, of, startWith, tap } from 'rxjs';
import { FieldSupportingActionEvent, FieldSupportingContent } from '../../../../../shared/dynamic-form/field.interface';
import { MATERIAL_THEME_CLASS } from '../../../../../core/theming/material-theme.providers';
import { UtilityService } from '../../../../../core/services/utility.service';
import {
  CANCEL_CONFIRM_DIALOG_DEFAULTS,
  ConfirmDialogData,
} from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../../../../shared/components/confirm-dialog/confirm-dialog.service';
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
  CLAIM_LETTER_INSTALLMENT,
  ClaimLetterApiErrorResponse,
  ClaimLetterBatchSummary,
  ClaimLetterClaimContext,
  ClaimLetterDocumentData,
  ClaimLetterUlbRow,
  ClaimLetterUlbSelection,
} from '../claim-letter.models';
import { ClaimLetterService } from '../claim-letter.service';
import { buildBatchNarrative } from '../claim-letter.utils';
import { buildClaimLetterPdfDocDefinition } from '../claim-letter-pdf.builder';
import { pdfMake } from '../pdfmake-setup';
import { ClaimLetterDocumentPreviewDialogComponent } from '../components/document-preview-dialog/claim-letter-document-preview-dialog.component';
import { MatCardModule } from '@angular/material/card';

/** Supporting-content action ids on `signedClaimFile` — must match the backend's
 *  `CLAIM_LETTER_ACTION_PREVIEW_TEMPLATE`/`CLAIM_LETTER_ACTION_DOWNLOAD_TEMPLATE` constants. */
const CLAIM_LETTER_ACTION = {
  PREVIEW_TEMPLATE: 'preview-template',
  DOWNLOAD_TEMPLATE: 'download-template',
} as const;

const CLAIM_LETTER_ABANDON_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Abandon this claim letter draft?',
  message: 'This draft and its selected ULBs will be marked as abandoned. This cannot be undone.',
  confirmText: 'Yes, abandon',
  cancelText: 'No, keep editing',
  confirmButtonColor: 'warn',
  icon: 'bi-x-circle-fill',
};

const CLAIM_LETTER_SUBMIT_CONFIRM: Required<ConfirmDialogData> = {
  title: 'Submit claim letter to MoHUA?',
  message:
    'Once submitted, this claim letter cannot be edited unless MoHUA returns it. Please confirm the ULBs, claim amounts, and signed file are correct.',
  confirmText: 'Yes, submit',
  cancelText: 'No, review again',
  confirmButtonColor: 'primary',
  icon: 'bi-send-check-fill',
};

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
  private readonly themeClass = inject(MATERIAL_THEME_CLASS, { optional: true });
  private readonly dynamicService = inject(DynamicFormService);
  private readonly dialog = inject(MatDialog);

  /** The literal `new` route segment (or no param at all) means create mode; any other value is a
   *  real claim letter id to load. Read once via `snapshot` — `new` and `:claimLetterId` are
   *  different route configs, so Angular creates a fresh component instance for each, never reusing
   *  this one across a mode change. */
  private readonly routeClaimLetterId = this.route.snapshot.paramMap.get('claimLetterId');
  readonly isCreateMode = this.routeClaimLetterId === null || this.routeClaimLetterId === 'new';

  readonly claimLetterId = signal<string | null>(this.isCreateMode ? null : this.routeClaimLetterId);
  readonly claim = signal<ClaimLetterBatchSummary | null>(null);
  /** Exposed for the template's subtitle text — kept dynamic rather than a literal "Installment 1"
   *  so that copy needs no change once Installment 2 is enabled. */
  readonly installment = CLAIM_LETTER_INSTALLMENT;

  readonly rows = new FormArray<ClaimUlbRowGroup>([]);
  readonly savedUlbRows = signal<readonly ClaimLetterUlbRow[]>([]);

  /** Only meaningful in create mode — no batch exists yet, so the state-wide pool/acknowledged
   *  totals come from claim-context rather than a (non-existent) `financialSummary`. Failing to
   *  load this is non-fatal: it only powers an optional overview strip, never the core ULB-picking
   *  workflow, so it's fetched independently of `loadDetail()`'s isLoading/loadError gating. Backed
   *  by the lean `claim-context` endpoint rather than `eligibility-summary` — this page never
   *  displays the checklist/ULB-readiness fields the full endpoint also computes. */
  readonly eligibilityOverview = signal<ClaimLetterClaimContext | null>(null);

  /** `UnspentUlbTableComponent`'s counterpart here — an `OnPush` child whose view can go stale after
   *  this component touches a row control from outside the child's own template (a submit-time
   *  validation pass). */
  private readonly claimTable = viewChild(ClaimUlbTableComponent);

  /** Claim Letter's own `formjsons` field config for the signed-file upload (`getDetail()`'s
   *  `questions`, only ever populated once — see `initSignedFileFormIfNeeded`) — never hand-specified
   *  in Angular, matching FC Unspent's `fcDeclaration` source-of-truth pattern. */
  readonly signedClaimFileField = signal<ConditionalFieldConfig | null>(null);
  readonly signedFileForm = new FormGroup({});

  /** Bridges `rows`' FormArray `valueChanges` (including structural push/removeAt changes) into a
   *  signal — a raw FormArray reference isn't itself change-detection-reactive. Mirrors
   *  `ClaimUlbTableComponent`'s identical `rowValues` bridge, including the `?? null` normalization:
   *  typed reactive forms type a group's `.value` fields as optional (to account for disabled
   *  controls being excluded), so `valueChanges` emits `ulbId`/`claimedAmount` as possibly
   *  `undefined` even though `getRawValue()` never is. */
  private readonly rowValues = toSignal(
    this.rows.valueChanges.pipe(
      startWith(this.rows.getRawValue()),
      map((values) => values.map((value) => ({ ulbId: value.ulbId ?? null, claimedAmount: value.claimedAmount ?? null }))),
    ),
    { initialValue: [] as { ulbId: string | null; claimedAmount: number | null }[] },
  );

  /** True once any row's claimed amount (or the selected ULB set itself) diverges from
   *  `savedUlbRows()`, the last-persisted snapshot. `GET :claimLetterId/document` (Preview/Download
   *  Template) only ever reflects persisted data, so while this is true the two actions are disabled
   *  via `effectiveSignedClaimFileField` instead of silently showing stale amounts. */
  readonly hasUnsavedRowChanges = computed(() => {
    if (this.isCreateMode) return false;
    const savedAmountByUlbId = new Map(this.savedUlbRows().map((row) => [row.ulbId, row.claimAmount]));
    const liveRows = this.rowValues().filter(
      (row): row is { ulbId: string; claimedAmount: number } => row.ulbId !== null && row.claimedAmount !== null,
    );
    if (liveRows.length !== savedAmountByUlbId.size) return true;
    return liveRows.some((row) => savedAmountByUlbId.get(row.ulbId) !== row.claimedAmount);
  });

  /** `signedClaimFileField()` with the Preview/Download Template actions disabled — and their
   *  description swapped to explain why — while `hasUnsavedRowChanges()` is true. Overridden purely
   *  client-side, on top of the backend-supplied field config, since only this component knows about
   *  in-progress, unsaved form edits; the backend has no way to compute this. */
  readonly effectiveSignedClaimFileField = computed<ConditionalFieldConfig | null>(() => {
    const field = this.signedClaimFileField();
    if (!field || !this.hasUnsavedRowChanges()) return field;

    return {
      ...field,
      supportingContent: field.supportingContent?.map((block): FieldSupportingContent =>
        block.type === 'actions'
          ? {
              ...block,
              description: 'Save your changes to update the claim letter preview and download.',
              descriptionTone: 'danger',
              actions: block.actions.map((action) =>
                action.id === CLAIM_LETTER_ACTION.PREVIEW_TEMPLATE ||
                action.id === CLAIM_LETTER_ACTION.DOWNLOAD_TEMPLATE
                  ? { ...action, disabled: true }
                  : action,
              ),
            }
          : block,
      ),
    };
  });

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isSaving = signal(false);
  readonly isAbandoning = signal(false);
  readonly isUploadingSignedFile = signal(false);
  readonly isSubmitting = signal(false);

  /** Covering letter + Annexure 1 + Annexure 2 content, shared by both "Preview Template" and
   *  "Download Template" — fetched once per `claim().revision` and cached here so a second action
   *  click (or switching between preview/download) never re-fetches (see `loadDocumentData`). Keyed
   *  off `revision` — the same optimistic-concurrency counter `saveChanges()` already sends as
   *  `expectedRevision` — rather than being fetched forever, since the batch's persisted claimed
   *  amounts (and therefore the document) change exactly when `revision` is bumped by a save. */
  private readonly documentData = signal<ClaimLetterDocumentData | null>(null);
  private documentDataRevision: number | null = null;
  readonly isLoadingDocument = signal(false);
  readonly isDownloadingDocument = signal(false);

  /** Top-level alert text from the most recent failed save/create/abandon — this feature's DTO
   *  validation throws one descriptive message rather than FC Unspent's per-row `ApiErrorMap`, so
   *  there is no equivalent row-level error-application machinery here. */
  readonly formLevelErrors = signal<readonly string[]>([]);

  readonly canEdit = computed(() => {
    if (this.isCreateMode) return true;
    const claim = this.claim();
    return !!claim && claim.currentFormStatus === FORM_STATUS.IN_PROGRESS && !claim.isAbandoned;
  });

  /** FE's first line of defense for the final-batch completeness rule (BE is the actual authority,
   *  enforced in `submit()` — this just avoids a round-trip for the common case): once this is the
   *  state's last batch slot, submission is blocked here too while any expected ULB still has no
   *  home in any batch, since there would be nowhere left to add it afterward. */
  readonly finalBatchIncomplete = computed(() => {
    const claim = this.claim();
    const overview = this.eligibilityOverview();
    if (!claim || !overview) return false;
    return claim.batchNumber === overview.batchSlotsMax && overview.remainingUlbCount > 0;
  });

  /** `ClaimLetterBatchSummary.currentFormStatus` is a plain backend `number`; `FormProgressComponent`
   *  expects the narrower `FormStatusValue` union — cast at this one boundary rather than widening
   *  the shared component's input type. */
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

  /** Create mode shows the same 3 state-wide tiles as the list page (no batch/"current claim" exists
   *  yet — the full 5-figure breakdown, including "Claim in Progress"/"Claim in Draft", lives on the
   *  list page only; the narrative below the tiles carries that nuance in prose here instead, see
   *  `batchNarrative`). The detail/view page shows 4, with "Claimed in This Batch"/"Remaining After
   *  This Batch" recomputed live from the ULB table as amounts are edited, matching the per-row
   *  live-variance-pill pattern already used there — falling back to the last-saved snapshot before
   *  the table (a view child, only available once rendered) exists. "Remaining After This Batch" also
   *  nets out other concurrent batches (draft/under-review), not just this state's already-
   *  acknowledged claims — see `ClaimLetterFinancialSummary`'s doc comment. */
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

  /** Short, live-updating story of what this batch means for the state's overall allocation — shown
   *  between the tiles and the ULB table while the batch is editable. In edit mode the financial
   *  inputs come from `claim().financialSummary` (already self-excludes this batch from the
   *  in-progress/draft buckets — see `ClaimLetterFinancialSummary`'s doc comment) rather than
   *  `eligibilityOverview()`, which does NOT exclude this batch; combining the overview's in-
   *  progress/draft totals with this batch's own live claim would double-count it. `expectedUlbCount`/
   *  batch-slot figures only exist on the overview, so those are always sourced from there. */
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
    });
  });

  /** True once any row is already known — with certainty, not just incompletely filled in — to be
   *  ineligible or outside the ±10% band, so Create/Save can be disabled before a round trip. */
  readonly hasInvalidRows = computed(() => (this.claimTable()?.invalidRowIdentifiers().length ?? 0) > 0);

  /** Same wording as the backend's own `buildChildren()` rejection message, so a user who somehow
   *  still hits a race between this check and save sees one consistent message, not two phrasings. */
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
    // Fetched in both modes now — the narrative bullets below the summary tiles need
    // expectedUlbCount/batchSlots* while an existing draft is being edited too, not just at create
    // time. Still non-fatal/independent of loadDetail()'s isLoading/loadError gating either way.
    this.loadEligibilityOverview();
    if (!this.isCreateMode) {
      this.loadDetail();
    }
  }

  private loadEligibilityOverview(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.isLoading.set(true);
    this.claimLetterService
      .getClaimContext(stateId, yearId, CLAIM_LETTER_INSTALLMENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (context) => {
          this.eligibilityOverview.set(context);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load the claim-letter financial overview', err);
          this.isLoading.set(false);
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
      // Pages through every ULB of the batch (not just the backend's default first page) — a batch
      // can have 700+ ULBs, and both the displayed total and the save payload must reflect all of
      // them (see ClaimLetterService.getAllUlbs).
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

  /** Built once per component instance — `loadDetail()` re-runs after every save/abandon/upload/
   *  submit, but the control (and the user's in-progress file selection) must survive a reload. */
  private initSignedFileFormIfNeeded(detail: ClaimLetterBatchSummary): void {
    if (this.signedFileForm.contains('signedClaimFile')) return;

    const field = detail.questions?.find((question) => question.key === 'signedClaimFile') ?? null;
    if (!field) return;

    this.signedClaimFileField.set(field);
    const control = this.dynamicService.createContorl(field, false, false);
    this.signedFileForm.addControl('signedClaimFile', control);

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((raw: unknown) => {
      if (!isUploadedFileMetadata(raw)) return;
      this.uploadSignedFile(raw);
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

  /** Routes action events from `DynamicFormComponent` for the `signedClaimFile` field to the
   *  appropriate handler. */
  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey !== 'signedClaimFile') return;
    // Belt-and-suspenders alongside the UI-level `disabled` on the rendered buttons (see
    // `effectiveSignedClaimFileField`) — the document endpoint only ever reflects saved data.
    if (this.hasUnsavedRowChanges()) return;
    switch (event.actionId) {
      case CLAIM_LETTER_ACTION.PREVIEW_TEMPLATE:
        this.previewTemplate();
        return;
      case CLAIM_LETTER_ACTION.DOWNLOAD_TEMPLATE:
        this.downloadTemplate();
        return;
      default:
        return;
    }
  }

  /** Single-flight fetch of the claim letter document data, cached in `documentData` so Preview and
   *  Download share one request instead of each fetching independently — but only while
   *  `claim().revision` hasn't moved on since the cache was populated, so a save that changes claimed
   *  amounts is always reflected on the next Preview/Download click. */
  private loadDocumentData(): Observable<ClaimLetterDocumentData> {
    const currentRevision = this.claim()?.revision ?? null;
    const cached = this.documentData();
    if (cached && this.documentDataRevision === currentRevision) return of(cached);

    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) throw new Error('Cannot load the claim letter document before it has an id.');

    return this.claimLetterService.getDocumentData(claimLetterId).pipe(
      tap((documentData) => {
        this.documentData.set(documentData);
        this.documentDataRevision = currentRevision;
      }),
    );
  }

  previewTemplate(): void {
    if (this.isLoadingDocument()) return;
    this.isLoadingDocument.set(true);

    this.loadDocumentData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (documentData) => {
          this.isLoadingDocument.set(false);
          const panelClass = this.themeClass ? [this.themeClass] : undefined;
          this.dialog.open(ClaimLetterDocumentPreviewDialogComponent, {
            data: { documentData },
            panelClass,
            width: '85vw',
            maxWidth: '85vw',
            height: '85vh',
            maxHeight: '85vh',
            autoFocus: false,
          });
        },
        error: (err: unknown) => {
          console.error('Failed to load the claim letter document', err);
          this.isLoadingDocument.set(false);
          this.utilityService.triggerSnackbar('Unable to load the claim letter. Please try again.', 'snackbar-danger');
        },
      });
  }

  downloadTemplate(): void {
    if (this.isDownloadingDocument()) return;
    this.isDownloadingDocument.set(true);

    this.loadDocumentData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (documentData) => {
          const docDefinition = buildClaimLetterPdfDocDefinition(documentData);
          const fileNameSafeRefNo = documentData.refNo.replace(/[/\\]/g, '-');
          pdfMake.createPdf(docDefinition).download(`claim-letter-${fileNameSafeRefNo}.pdf`);
          this.isDownloadingDocument.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load the claim letter document', err);
          this.isDownloadingDocument.set(false);
          this.utilityService.triggerSnackbar('Unable to download the claim letter. Please try again.', 'snackbar-danger');
        },
      });
  }

  submitToMohua(): void {
    const claimLetterId = this.claimLetterId();
    const claim = this.claim();
    if (!claimLetterId || !claim?.hasSignedFile || this.finalBatchIncomplete()) return;

    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
    this.confirmDialogService
      .confirm(CLAIM_LETTER_SUBMIT_CONFIRM, config)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.doSubmit(claimLetterId);
      });
  }

  private doSubmit(claimLetterId: string): void {
    this.isSubmitting.set(true);
    this.formLevelErrors.set([]);

    this.claimLetterService
      .submit(claimLetterId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.utilityService.triggerSnackbar('Claim letter submitted to MoHUA.', 'snackbar-success');
          this.loadDetail();
        },
        error: (err: unknown) => {
          console.error('Failed to submit Claim Letter', err);
          this.isSubmitting.set(false);
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

    this.isSaving.set(true);
    this.formLevelErrors.set([]);

    this.claimLetterService
      .updateDraft(claimLetterId, { ulbSelections: this.buildUlbSelections(), expectedRevision: claim.revision })
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

    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
    this.confirmDialogService
      .confirm(CLAIM_LETTER_ABANDON_CONFIRM, config)
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

    const config = this.themeClass ? { panelClass: this.themeClass } : undefined;
    this.confirmDialogService
      .confirm(CANCEL_CONFIRM_DIALOG_DEFAULTS, config)
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

  /** For both create and save: every row must be individually valid, and at least one row must
   *  exist — mirrors `FcUnspentDeclarationComponent`'s finalSubmit-strictness (this feature has no
   *  separate draft-vs-final-submit split; a claim letter draft is always "complete" by definition). */
  private validateRows(): boolean {
    let valid = this.rows.length > 0;

    for (const row of this.rows.controls) {
      if (row.invalid) {
        valid = false;
        row.controls.ulbId.markAsTouched();
        row.controls.claimedAmount.markAsTouched();
      }
    }

    // Row `apiErrors`/touched state was just mutated from outside the child's own template — its
    // OnPush view needs an explicit nudge, same reason `FcUnspentDeclarationComponent` calls this.
    this.claimTable()?.refreshValidationDisplay();

    return valid;
  }

  private handleSaveError(err: unknown, fallbackMessage: string): void {
    const response = this.extractApiErrorResponse(err);
    const message = response?.message ?? fallbackMessage;
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
    this.formLevelErrors.set([message]);
  }

  /**
   * Extracts a structured error response from two possible error shapes:
   * 1. `HttpErrorResponse` (HTTP 4xx): body is in `err.error` with `{ statusCode, message }`.
   * 2. Service map throw (2xx with success:false): `err` itself is `{ success, message }`.
   */
  private extractApiErrorResponse(err: unknown): ClaimLetterApiErrorResponse | null {
    if (!this.isObject(err)) return null;

    const errorBody = err['error'];
    if (this.isObject(errorBody) && typeof errorBody['message'] === 'string') {
      return {
        statusCode: typeof errorBody['statusCode'] === 'number' ? errorBody['statusCode'] : undefined,
        message: errorBody['message'],
      };
    }

    if (err['success'] === false && typeof err['message'] === 'string') {
      return { message: err['message'] };
    }

    return null;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
