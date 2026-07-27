import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
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
  ClaimLetterEligibilitySummary,
  ClaimLetterUlbRow,
  ClaimLetterUlbSelection,
} from '../claim-letter.models';
import { ClaimLetterService } from '../claim-letter.service';

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

  /** The literal `new` route segment (or no param at all) means create mode; any other value is a
   *  real claim letter id to load. Read once via `snapshot` — `new` and `:claimLetterId` are
   *  different route configs, so Angular creates a fresh component instance for each, never reusing
   *  this one across a mode change. */
  private readonly routeClaimLetterId = this.route.snapshot.paramMap.get('claimLetterId');
  readonly isCreateMode = this.routeClaimLetterId === null || this.routeClaimLetterId === 'new';

  readonly claimLetterId = signal<string | null>(this.isCreateMode ? null : this.routeClaimLetterId);
  readonly claim = signal<ClaimLetterBatchSummary | null>(null);

  readonly rows = new FormArray<ClaimUlbRowGroup>([]);
  readonly savedUlbRows = signal<readonly ClaimLetterUlbRow[]>([]);

  /** Only meaningful in create mode — no batch exists yet, so the state-wide pool/acknowledged
   *  totals come from eligibility-summary rather than a (non-existent) `financialSummary`. Failing
   *  to load this is non-fatal: it only powers an optional overview strip, never the core ULB-picking
   *  workflow, so it's fetched independently of `loadDetail()`'s isLoading/loadError gating. */
  readonly eligibilityOverview = signal<ClaimLetterEligibilitySummary | null>(null);

  /** `UnspentUlbTableComponent`'s counterpart here — an `OnPush` child whose view can go stale after
   *  this component touches a row control from outside the child's own template (a submit-time
   *  validation pass). */
  private readonly claimTable = viewChild(ClaimUlbTableComponent);

  /** Claim Letter's own `formjsons` field config for the signed-file upload (`getDetail()`'s
   *  `questions`, only ever populated once — see `initSignedFileFormIfNeeded`) — never hand-specified
   *  in Angular, matching FC Unspent's `fcDeclaration` source-of-truth pattern. */
  readonly signedClaimFileField = signal<ConditionalFieldConfig | null>(null);
  readonly signedFileForm = new FormGroup({});

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isSaving = signal(false);
  readonly isAbandoning = signal(false);
  readonly isUploadingSignedFile = signal(false);
  readonly isSubmitting = signal(false);

  /** Top-level alert text from the most recent failed save/create/abandon — this feature's DTO
   *  validation throws one descriptive message rather than FC Unspent's per-row `ApiErrorMap`, so
   *  there is no equivalent row-level error-application machinery here. */
  readonly formLevelErrors = signal<readonly string[]>([]);

  readonly canEdit = computed(() => {
    if (this.isCreateMode) return true;
    const claim = this.claim();
    return !!claim && claim.currentFormStatus === FORM_STATUS.IN_PROGRESS && !claim.isAbandoned;
  });

  /** `ClaimLetterBatchSummary.currentFormStatus` is a plain backend `number`; `FormProgressComponent`
   *  expects the narrower `FormStatusValue` union — cast at this one boundary rather than widening
   *  the shared component's input type. */
  readonly currentFormStatusValue = computed<FormStatusValue>(
    () => (this.claim()?.currentFormStatus ?? FORM_STATUS.NOT_STARTED) as FormStatusValue,
  );

  readonly breadcrumbLinks = computed<XvifcBreadcrumbLink[]>(() => {
    const listLink: XvifcBreadcrumbLink = { label: 'Claim Letter', routerLink: ['/xvifc', this.yearId, 'claim-letter'] };
    if (this.isCreateMode) return [listLink, { label: 'New Claim Letter' }];
    const claim = this.claim();
    return [listLink, { label: claim ? 'Batch #' + claim.batchNumber : 'Claim Letter' }];
  });

  /** Create mode only ever knows the two state-wide figures (no batch/"current claim" exists yet);
   *  the detail/view page shows all four, with "Claimed in This Batch"/"Remaining After This Batch"
   *  recomputed live from the ULB table as amounts are edited, matching the per-row live-variance-
   *  pill pattern already used there — falling back to the last-saved snapshot before the table
   *  (a view child, only available once rendered) exists. */
  readonly summaryTiles = computed<ClaimLetterSummaryTile[]>(() => {
    if (this.isCreateMode) {
      const overview = this.eligibilityOverview()?.financialOverview;
      if (!overview) return [];
      return [
        { label: 'Total Allocation', value: overview.totalInstallmentAllocation },
        { label: 'Already Claimed (Acknowledged)', value: overview.totalAlreadyAcknowledged },
        {
          label: 'Available to Claim',
          value: overview.totalInstallmentAllocation - overview.totalAlreadyAcknowledged,
        },
      ];
    }

    const claim = this.claim();
    if (!claim) return [];
    const { totalInstallmentAllocation, totalAlreadyAcknowledged } = claim.financialSummary;
    const currentSelectedClaim = this.claimTable()?.totalClaim() ?? claim.financialSummary.currentSelectedClaim;

    return [
      { label: 'Total Allocation', value: totalInstallmentAllocation },
      { label: 'Already Claimed (Acknowledged)', value: totalAlreadyAcknowledged },
      { label: 'Claimed in This Batch', value: currentSelectedClaim },
      {
        label: 'Remaining After This Batch',
        value: totalInstallmentAllocation - totalAlreadyAcknowledged - currentSelectedClaim,
      },
    ];
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
    if (!this.isCreateMode) {
      this.loadDetail();
    } else {
      this.loadEligibilityOverview();
    }
  }

  private loadEligibilityOverview(): void {
    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.claimLetterService
      .getEligibilitySummary(stateId, yearId, CLAIM_LETTER_INSTALLMENT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eligibility) => this.eligibilityOverview.set(eligibility),
        error: (err: unknown) => console.error('Failed to load the claim-letter financial overview', err),
      });
  }

  loadDetail(): void {
    const claimLetterId = this.claimLetterId();
    if (!claimLetterId) return;

    this.isLoading.set(true);
    this.loadError.set(false);

    forkJoin({
      detail: this.claimLetterService.getDetail(claimLetterId),
      ulbs: this.claimLetterService.getUlbs(claimLetterId, {}),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ detail, ulbs }) => {
          this.claim.set(detail);
          this.savedUlbRows.set(ulbs.rows);
          this.hydrateRows(ulbs.rows);
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

  submitToMohua(): void {
    const claimLetterId = this.claimLetterId();
    const claim = this.claim();
    if (!claimLetterId || !claim?.hasSignedFile) return;

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
