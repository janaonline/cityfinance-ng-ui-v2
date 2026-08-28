import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import FileSaver from 'file-saver';
import { Subject, finalize, from, map, startWith, takeUntil } from 'rxjs';
import { CanComponentDeactivate, warnBeforeUnloadWhenDirty } from '../../../../core/guards/unsaved-changes.guard';
import { UtilityService } from '../../../../core/services/utility.service';
import {
  SAVE_AS_DRAFT_DIALOG_DEFAULTS,
  SUBMIT_CONFIRM_DIALOG_DEFAULTS,
  themedDialogConfig,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AmountDisplayToggleComponent } from '../../../../shared/components/amount-display-toggle/amount-display-toggle.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { PreLoaderComponent } from '../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormService } from '../../../../shared/dynamic-form/dynamic-form.service';
import { FieldSupportingActionEvent, FieldSupportingContent } from '../../../../shared/dynamic-form/field.interface';
import { withSupportingActionState } from '../../../../shared/dynamic-form/supporting-action-state';
import {
  ConditionalFieldConfig,
  DependencyIndex,
  DynamicFormVisibilityService,
} from '../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../xvi-fc-module.service';
import { parseFieldPrefixedMessages } from '../../common/utils/xvi-fc-error-lookup.utils';
import {
  FORM_STATUS,
  FormActor,
  FormProgressComponent,
  FormStatusValue,
} from '../../shared/form-progress/form-progress.component';
import {
  createFcUnspentUlbRowGroup,
  FcUnspentUlbRowGroup,
  UnspentUlbTableComponent,
} from './components/unspent-ulb-table/unspent-ulb-table.component';
import { FcUnspentDeclarationService } from './fc-unspent-declaration.service';
import { FcUnspentUlbOptionsCacheService } from './fc-unspent-ulb-options-cache.service';
import {
  ApiErrorMap,
  ApiErrorResponse,
  ApiFieldError,
  FcUnspentApplicableFc,
  FcUnspentDevolutionDependency,
  FcUnspentSaveData,
  FcUnspentSavePayload,
  FcUnspentUlbData,
} from './fc-unspent-declaration.models';

const DEFAULT_DEPENDENCY: FcUnspentDevolutionDependency = {
  devolutionStatus: null,
  devolutionDatasetExists: false,
  editableDueToDevolutionReturn: false,
  blockingMessage: null,
};

type SubmitType = 'saveAsDraft' | 'finalSubmit';

/** Action IDs emitted by the dynamic form's `supportingContent` action buttons — one per branch's
 *  file field, mutually exclusive since only one of the two fields is ever visible at a time. */
const FC_UNSPENT_SUPPORTING_ACTION = {
  DOWNLOAD_TEMPLATE: 'download-template',
  DOWNLOAD_DECLARATION: 'download-declaration',
} as const;

const ROW_ERROR_KEY_PATTERN = /^unspentUlbData\.(\d+)\.(ulbId|unspentAmount)$/;

@Component({
  selector: 'app-fc-unspent-declaration',
  imports: [
    ReactiveFormsModule,
    DynamicFormComponent,
    PreLoaderComponent,
    MatButtonModule,
    FormProgressComponent,
    UnspentUlbTableComponent,
    AmountDisplayToggleComponent,
  ],
  templateUrl: './fc-unspent-declaration.component.html',
  styleUrl: './fc-unspent-declaration.component.scss',
  // Component-scoped (not `providedIn: 'root'`) so the ULB-options query cache lives and dies with
  // this page — a fresh instance per visit, discarded (via its own `ngOnDestroy`) when the page is,
  // never leaking across navigations. `UnspentUlbTableComponent` passes this same injector through
  // to `MatDialog.open`, so every picker opened from this page shares the one instance.
  providers: [FcUnspentUlbOptionsCacheService],
})
export class FcUnspentDeclarationComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly utilityService = inject(UtilityService);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly fcUnspentService = inject(FcUnspentDeclarationService);
  private readonly moduleService = inject(XvifcModuleService);
  /** Applies the feature's current theme to all confirm dialogs opened by this component. */
  private readonly dialogConfig = themedDialogConfig();
  private readonly ulbOptionsCache = inject(FcUnspentUlbOptionsCacheService);

  readonly threshold = signal(10);
  readonly stateName = signal('');
  readonly applicableFc = signal<FcUnspentApplicableFc>('14TH_FC');
  readonly applicableFcLabel = computed(() => (this.applicableFc() === '15TH_FC' ? '15th' : '14th'));
  readonly actors = signal<FormActor[]>([]);

  /** Raw saved-row snapshot from the preview response (ulbName/censusCode/sbCode/allocationAmount),
   *  kept alongside the editable FormArray so the table can render already-saved rows without ever
   *  needing to open the ULB picker. */
  readonly savedUnspentUlbData = signal<readonly FcUnspentUlbData[]>([]);
  /** Drives the save-prompt banner: fcUnspentDeclaration's backend visibleWhen hides the whole
   *  field (not just its download action) until at least one row is saved, which also hides that
   *  field's own in-field "save your changes" message along with it — this banner fills that gap. */
  readonly hasSavedUnspentRows = computed(() => this.savedUnspentUlbData().length > 0);

  form = this.fb.group({});
  readonly fields = signal<ConditionalFieldConfig[]>([]);
  /** DB-driven metadata for the unspentUlbData row-table's ulbId/unspentAmount controls —
   *  passed through to UnspentUlbTableComponent so createFcUnspentUlbRowGroup builds each
   *  row's validators from the backend config instead of a hardcoded literal. */
  readonly rowEditFields = signal<ConditionalFieldConfig[]>([]);
  readonly visibleFields = computed(() => this.visibilityService.getVisibleFields(this.fields()));

  /**
   * `visibleFields()` with the branch-appropriate download action's `loading`/`loadingLabel`
   * overridden from `isDownloadingDeclaration()` (spinner while a request is in flight — one shared
   * signal suffices since `fcDeclaration`/`fcUnspentDeclaration` are mutually exclusive by branch,
   * no need for EULB's per-action split), and `disabled` (+ description swapped to explain why, via
   * `withDownloadActionState`) while the relevant unsaved-state signal above is true — the document
   * endpoint only ever reflects saved data. Bound in the template in place of `visibleFields()`.
   */
  readonly effectiveVisibleFields = computed<ConditionalFieldConfig[]>(() =>
    this.visibleFields().map((field) => {
      if (field.key === 'fcDeclaration') {
        return this.withDownloadActionState(
          field,
          FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE,
          this.hasUnsavedBranchChange(),
        );
      }
      if (field.key === 'fcUnspentDeclaration') {
        return this.withDownloadActionState(
          field,
          FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_DECLARATION,
          this.hasUnsavedBranchChange() || this.hasUnsavedRowChanges(),
        );
      }
      return field;
    }),
  );

  private withDownloadActionState(
    field: ConditionalFieldConfig,
    actionId: string,
    disabledDueToUnsavedChanges: boolean,
  ): ConditionalFieldConfig {
    const withActionState = withSupportingActionState(field, [
      {
        actionId,
        disabled: disabledDueToUnsavedChanges || undefined,
        loading: this.isDownloadingDeclaration(),
        loadingLabel: 'Downloading declaration…',
      },
    ]);

    if (!disabledDueToUnsavedChanges) return withActionState;

    return {
      ...withActionState,
      supportingContent: withActionState.supportingContent?.map(
        (block): FieldSupportingContent =>
          block.type === 'actions'
            ? {
                ...block,
                description: 'Save your changes as a draft before downloading the declaration.',
                descriptionTone: 'danger',
              }
            : block,
      ),
    };
  }

  readonly unspentUlbData = new FormArray<FcUnspentUlbRowGroup>([]);
  /** `UnspentUlbTableComponent` is `OnPush` and only rendered while the Yes branch is shown, so its
   *  view can go stale after this component touches/sets errors on a row control from outside the
   *  child's own template (a submit-validation pass, or an applied API error) — neither
   *  `markAsTouched()` nor `setErrors()` emits `valueChanges`/`statusChanges` on their own. */
  private readonly unspentUlbTable = viewChild(UnspentUlbTableComponent);
  private readonly isYesBranchSignal = signal(false);
  readonly isYesBranch = computed(() => this.isYesBranchSignal());

  // ─── Unsaved-state tracking for the download actions ────────────────────────
  // `GET .../fc-unspent-declaration-document` only ever reflects the last-*saved* isFcUnspent/
  // unspentUlbData — never the current in-browser form state, which is only persisted on Save
  // Draft/Final Submit. Downloading while either has changed since load would silently generate
  // the wrong (stale) document, so both download actions are disabled via `effectiveVisibleFields`
  // while either signal below is true — mirrors `claim-letter-detail.component.ts`'s
  // `hasUnsavedRowChanges`/`effectiveSignedClaimFileField` pattern exactly, including *why* these
  // are plain signals bridged from `valueChanges` rather than a `computed()` reading `.dirty`:
  // Angular's `dirty` getter isn't itself signal-reactive, so a `computed()` referencing it would
  // never re-run when it changes.
  /** The radio's live value, updated on every `valueChanges` emission. */
  private readonly liveIsFcUnspent = signal<string | null>(null);
  /** The radio's value as of the last successful load/save (`reloadForm()` re-runs `loadForm()`,
   *  which recreates the control and resets both this and `liveIsFcUnspent` to the same value). */
  private readonly savedIsFcUnspent = signal<string | null>(null);
  readonly hasUnsavedBranchChange = computed(() => this.liveIsFcUnspent() !== this.savedIsFcUnspent());

  /** Live `{ulbId, unspentAmount}` per row, bridged from `unspentUlbData.valueChanges` — direct copy
   *  of `claim-letter-detail.component.ts`'s `rowValues` bridge, including the `?? null`
   *  normalization (typed reactive forms report a group's value fields as possibly `undefined`). */
  private readonly liveUnspentRows = toSignal(
    this.unspentUlbData.valueChanges.pipe(
      startWith(this.unspentUlbData.getRawValue()),
      map((values) =>
        values.map((value) => ({ ulbId: value.ulbId ?? null, unspentAmount: value.unspentAmount ?? null })),
      ),
    ),
    { initialValue: [] as { ulbId: string | null; unspentAmount: number | null }[] },
  );
  /** True once any row's amount (or the row set itself) diverges from `savedUnspentUlbData()` —
   *  same shape as `claim-letter-detail.component.ts`'s `hasUnsavedRowChanges`. Only meaningful on
   *  the Yes branch, but harmless to compute regardless — nothing reads it while on the No branch
   *  except `effectiveVisibleFields()`'s `fcUnspentDeclaration` case, which is itself hidden there. */
  readonly hasUnsavedRowChanges = computed(() => {
    const savedAmountByUlbId = new Map(this.savedUnspentUlbData().map((row) => [row.ulbId, row.unspentAmount]));
    const liveRows = this.liveUnspentRows().filter(
      (row): row is { ulbId: string; unspentAmount: number } => row.ulbId !== null && row.unspentAmount !== null,
    );
    if (liveRows.length !== savedAmountByUlbId.size) return true;
    return liveRows.some((row) => savedAmountByUlbId.get(row.ulbId) !== row.unspentAmount);
  });

  readonly isLoading = signal(false);
  readonly loadError = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isFinalSubmitting = signal(false);
  readonly isSubmitting = computed(() => this.isSavingDraft() || this.isFinalSubmitting());
  readonly isDownloadingDeclaration = signal(false);

  readonly canEdit = signal(false);
  readonly canSaveDraft = signal(false);
  readonly canFinalSubmit = signal(false);
  readonly currentFormStatus = signal<FormStatusValue>(FORM_STATUS.NOT_STARTED);
  readonly formStatus = computed<FormStatusValue>(() => this.currentFormStatus());

  /** Devolution-dependency info for DISPLAY only (status label + blocking-message banner) — the
   *  gates above (`canEdit`/`canSaveDraft`/`canFinalSubmit`) are already backend-computed to account
   *  for it; this page must never re-derive permission logic from `dependency` itself. */
  readonly dependency = signal<FcUnspentDevolutionDependency>(DEFAULT_DEPENDENCY);

  /** `_form` errors plus whole-array `unspentUlbData` errors (e.g. duplicate/empty) from the most
   *  recent failed save/submit — shown in a compact alert; indexed row errors go to their control instead. */
  readonly formLevelErrors = signal<readonly string[]>([]);

  private dependencyIndex: DependencyIndex<ConditionalFieldConfig> = new Map();
  /** Tracks server-injected error codes per dynamic-field control, so they can be cleared before the next request. */
  private readonly serverErrorKeys = new Map<string, string[]>();
  /** Emits before each form rebuild (on reload) so per-form subscriptions are torn down cleanly. */
  private readonly formSubscriptionsTeardown$ = new Subject<void>();

  /** Public (not just internally used) so the template can pass it straight into the ULB picker's
   *  table input without duplicating this resolution logic. */
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

  constructor() {
    warnBeforeUnloadWhenDirty(() => this.hasUnsavedChanges());
  }

  ngOnInit(): void {
    this.loadForm();
  }

  /** Read by {@link unsavedChangesGuard} and the `beforeunload` listener. `unspentUlbData` is
   *  attached to `form` (`form.addControl('unspentUlbData', this.unspentUlbData)`), so `form.dirty`
   *  already covers ULB-row edits. A disabled (read-only) form is never dirty. */
  hasUnsavedChanges(): boolean {
    return this.canEdit() && this.form.dirty;
  }

  loadForm(): void {
    // Centralizes ULB-options cache invalidation here rather than scattering it across every
    // save/final-submit success handler — this method is the one place both the initial load, the
    // load-error retry, and `reloadForm()` (after save/final submit) all pass through. Cached query
    // results may no longer reflect the backend's current ULB/allocation data once the form reloads.
    this.ulbOptionsCache.clear();

    const stateId = this.stateId;
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.loadError.set(true);
      this.utilityService.triggerSnackbar(
        'Unable to load FC Unspent declaration. Please try again.',
        'snackbar-danger',
      );
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(false);

    this.fcUnspentService
      .getForm(stateId, yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stateName.set(data.stateName);
          this.applicableFc.set(data.applicableFc);
          this.actors.set(data.actors);
          this.threshold.set(data.threshold);
          this.currentFormStatus.set(data.currentFormStatus);
          this.canEdit.set(data.permissions.canEdit);
          this.canSaveDraft.set(data.permissions.canSaveDraft);
          this.canFinalSubmit.set(data.permissions.canFinalSubmit);
          this.dependency.set(data.dependency);
          this.savedUnspentUlbData.set(data.unspentUlbData);
          this.rowEditFields.set(data.rowEditFields ?? []);
          // Defensive per-question clone — never mutate the fields array reference in place.
          this.fields.set(data.questions.map((question) => ({ ...question })));
          this.createFormControls(data.unspentUlbData);
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Failed to load FC Unspent declaration', err);
          this.loadError.set(true);
          this.isLoading.set(false);
          this.utilityService.triggerSnackbar(
            'Unable to load FC Unspent declaration. Please try again.',
            'snackbar-danger',
          );
        },
      });
  }

  private createFormControls(savedRows: readonly FcUnspentUlbData[]): void {
    for (const field of this.fields()) {
      const formControl = this.dynamicService.createContorl(field, false, field.readonly);
      this.form.addControl(field.key, formControl);
    }

    this.form.addControl('unspentUlbData', this.unspentUlbData);
    this.hydrateUnspentUlbData(savedRows);

    // Synthetic control bridging saved row data into the reactive form.
    // Used by fcUnspentDeclaration.visibleWhen to check for saved rows, not live FormArray data.
    // It reflects only persisted data and updates on loadForm()/reloadForm().
    this.form.addControl('savedUnspentUlbData', this.fb.control(savedRows));

    const isFcUnspentControl = this.form.get('isFcUnspent');
    const initialIsFcUnspentRaw: unknown = isFcUnspentControl?.value;
    const initialIsFcUnspent = typeof initialIsFcUnspentRaw === 'string' ? initialIsFcUnspentRaw : null;
    this.isYesBranchSignal.set(initialIsFcUnspent === 'yes');
    // Freshly loaded — live and saved start equal, so hasUnsavedBranchChange() is false until the
    // user actually touches the radio.
    this.liveIsFcUnspent.set(initialIsFcUnspent);
    this.savedIsFcUnspent.set(initialIsFcUnspent);
    isFcUnspentControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.formSubscriptionsTeardown$))
      .subscribe((value: string | null) => {
        // Switching to No intentionally leaves unspentUlbData untouched — rows are just not
        // rendered while hidden, mirroring the preserveHiddenValue behavior used for the other
        // conditional fields on this page.
        this.isYesBranchSignal.set(value === 'yes');
        this.liveIsFcUnspent.set(value);
      });

    this.dependencyIndex = this.visibilityService.createDependencyIndex(this.fields());

    this.visibilityService.bindVisibility({
      form: this.form,
      fieldsSignal: this.fields,
      dependencyIndex: this.dependencyIndex,
      destroyRef: this.destroyRef,
      preserveHiddenValue: true,
      formTeardown$: this.formSubscriptionsTeardown$,
    });

    if (!this.canEdit()) {
      this.form.disable({ emitEvent: false });
    }
  }

  private hydrateUnspentUlbData(rows: readonly FcUnspentUlbData[]): void {
    for (const row of rows) {
      this.unspentUlbData.push(
        createFcUnspentUlbRowGroup(this.dynamicService, this.canEdit(), this.rowEditFields(), row),
      );
    }
  }

  onSupportingAction(event: FieldSupportingActionEvent): void {
    if (event.fieldKey === 'fcDeclaration' && event.actionId === FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_TEMPLATE) {
      // Belt-and-suspenders alongside the UI-level `disabled` on the rendered button (see
      // `effectiveVisibleFields`/`withDownloadActionState`) — the document endpoint only ever
      // reflects saved data.
      if (this.hasUnsavedBranchChange()) return;
      this.downloadDeclarationDocument();
    } else if (
      event.fieldKey === 'fcUnspentDeclaration' &&
      event.actionId === FC_UNSPENT_SUPPORTING_ACTION.DOWNLOAD_DECLARATION
    ) {
      if (this.hasUnsavedBranchChange() || this.hasUnsavedRowChanges()) return;
      this.downloadDeclarationDocument();
    }
  }

  /**
   * Downloads the generated declaration document as a blob and saves it via FileSaver — mirrors
   * `EulbStatusComponent.downloadElectedBodiesListDocument`. One method serves both branches: the
   * backend picks the right variant (nil-balance vs ULB-wise) from the form's stored `isFcUnspent`,
   * and the two fields' download actions are mutually exclusive (only one is ever visible), so
   * there's no ambiguity about which branch triggered the click. Never reads `currentFormStatus` to
   * decide whether this is allowed — the backend already controls whether the action is even
   * rendered; this only guards against a missing stateId/yearId and duplicate concurrent clicks.
   */
  private downloadDeclarationDocument(): void {
    if (this.isDownloadingDeclaration()) return;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) return;

    this.clearAllApiErrors();
    this.isDownloadingDeclaration.set(true);

    this.fcUnspentService
      .downloadDeclarationDocument(stateId, yearId)
      .pipe(
        finalize(() => this.isDownloadingDeclaration.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ blob, fileName }) => {
          FileSaver.saveAs(blob, fileName ?? `Fc-unspent-declaration-${this.isYesBranch() ? 'yes' : 'no'}.docx`);
        },
        error: (err: unknown) => {
          console.error('Failed to download the FC Unspent declaration document', err);
          this.handleDownloadApiError(err, 'Failed to download the declaration document.');
        },
      });
  }

  onSubmit(action: SubmitType): void {
    const flatFieldsValid = this.isValidForSubmitType(action);
    const tableValid = this.isUnspentUlbDataValidForSubmitType(action);
    const branchValid = action !== 'finalSubmit' || this.resolveIsFcUnspentBoolean() !== null;

    // `isUnspentUlbDataValidForSubmitType` may have just marked row controls touched — the table's
    // hover-error icons only read `touched`, and won't otherwise notice from outside their own view.
    this.unspentUlbTable()?.refreshValidationDisplay();

    if (!flatFieldsValid || !tableValid || !branchValid) {
      this.form.markAllAsTouched();
      this.utilityService.triggerSnackbar(
        action === 'finalSubmit'
          ? 'Please correct the errors in the form before submitting.'
          : 'Please correct the errors in the form before saving as draft.',
        'snackbar-danger',
      );
      return;
    }

    const dialogData = action === 'finalSubmit' ? SUBMIT_CONFIRM_DIALOG_DEFAULTS : SAVE_AS_DRAFT_DIALOG_DEFAULTS;

    this.confirmDialogService
      .confirm(dialogData, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.submit(action);
      });
  }

  private submit(action: SubmitType): void {
    this.clearAllApiErrors();

    const payload = this.buildPayload();
    const submittingFlag = action === 'finalSubmit' ? this.isFinalSubmitting : this.isSavingDraft;
    const request =
      action === 'finalSubmit' ? this.fcUnspentService.finalSubmit(payload) : this.fcUnspentService.saveDraft(payload);

    submittingFlag.set(true);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        submittingFlag.set(false);
        this.utilityService.triggerSnackbar(
          action === 'finalSubmit' ? 'FC Unspent declaration submitted successfully.' : 'Draft saved successfully.',
          'snackbar-success',
        );
        // Reload real state from the backend rather than manually patching status/rows/eligibility.
        this.reloadForm();
      },
      error: (err: unknown) => {
        console.error(
          `Failed to ${action === 'finalSubmit' ? 'submit' : 'save draft for'} FC Unspent declaration`,
          err,
        );
        submittingFlag.set(false);
        this.handleApiError(
          err,
          action === 'finalSubmit'
            ? 'Unable to submit the declaration. Please try again.'
            : 'Unable to save the draft. Please try again.',
        );
      },
    });
  }

  /** Maps the radio control's UI value to the wire boolean; `null` for anything else (unanswered or corrupt). */
  private resolveIsFcUnspentBoolean(): boolean | null {
    const value: unknown = this.form.get('isFcUnspent')?.value;
    if (value === 'yes') return true;
    if (value === 'no') return false;
    return null;
  }

  /**
   * Assembles the `{ stateId, yearId, data }` payload sent on save/submit — the same envelope
   * `SfcStatusDraftPayload`/`SaveDraftDevolutionPayload` use. `isFcUnspent` is converted to a real
   * boolean at this boundary (`'yes' -> true`, `'no' -> false`, unanswered -> `null`) — the backend
   * DTO is strict-boolean and rejects the radio control's own `'yes'|'no'` string. Only the fields
   * relevant to the resolved branch are included; row values are whitelisted explicitly to
   * `{ ulbId, unspentAmount }` rather than trusting `getRawValue()`'s shape wholesale, and rows with
   * an incomplete selection are dropped. Backend-owned fields — `applicableFc`, `threshold`,
   * Devolution dependency state, and each row's `ulbName`/`censusCode`/`sbCode`/`allocationAmount`/
   * `allocationPerc`/`eligibility`/`rowStatus` — must never be read from client state on submit.
   */
  private buildPayload(): FcUnspentSavePayload {
    const rawData = this.visibilityService.getVisiblePayload(this.form, this.fields());
    const isFcUnspent = this.resolveIsFcUnspentBoolean();
    const data: FcUnspentSaveData = { isFcUnspent };

    if (isFcUnspent === false) {
      data.fcDeclaration = rawData['fcDeclaration'];
    } else if (isFcUnspent === true) {
      data.fcUnspentDeclaration = rawData['fcUnspentDeclaration'];
      data.checkboxConfirmation = rawData['checkboxConfirmation'] === true;
      data.unspentUlbData = this.unspentUlbData.controls
        .filter((row) => row.controls.ulbId.value !== null && row.controls.unspentAmount.value !== null)
        .map((row) => ({
          ulbId: row.controls.ulbId.value as string,
          unspentAmount: row.controls.unspentAmount.value as number,
        }));
    }

    return {
      stateId: this.stateId,
      yearId: this.yearId,
      data,
    };
  }

  // ─── API error mapping ──────────────────────────────────────────────────────

  /** Used by `submit()` — its `saveDraft`/`finalSubmit` POST requests get a normal JSON error body
   *  directly on `err.error`, which `extractApiErrorResponse` reads as-is. */
  private handleApiError(err: unknown, fallbackMessage: string): void {
    this.applyExtractedApiError(this.extractApiErrorResponse(err), fallbackMessage);
  }

  /**
   * Used by `downloadDeclarationDocument()` only. That request is sent with `responseType: 'blob'`
   * (see `FcUnspentDeclarationService.downloadDeclarationDocument`) — Angular's `HttpClient` does
   * NOT JSON-parse error bodies for blob requests, so on a 400 `err.error` arrives as a raw `Blob`,
   * not the parsed `{statusCode, message, errors}` object `extractApiErrorResponse` expects. Left
   * unhandled, this silently swallows every download error's message/errors: a real bug found via
   * manual testing where the backend's correct `noRows`/`branchNotChosen` responses never reached
   * the UI, only the generic fallback snackbar. Mirrors the exact same gap already found and fixed
   * in `elected-body-status.component.ts`'s `downloadElectedBodiesListDocument` (via
   * `eulb-status.utils.ts`'s `parseBlobErrorResponse`) — replicated locally below rather than
   * imported, since that helper is coupled to eulb-status's own (structurally identical but
   * separately declared) `ApiErrorResponse`/`ApiErrorMap` types, consistent with how this file
   * already duplicates `extractApiErrorResponse`/`isApiErrorMap` rather than importing them.
   *
   * Component-level spec tests that mock `FcUnspentDeclarationService.downloadDeclarationDocument`
   * with a spy (rather than going through `HttpClientTestingModule`) can't catch this class of bug
   * on their own — a spy bypasses the real transport layer that produces the `Blob` body, so its
   * error mocks must deliberately shape their thrown value as `{ error: new Blob([...]) }` to
   * exercise this path at all.
   *
   * Routed through `from(...).pipe(takeUntilDestroyed(...))` rather than a bare `async`/`await` —
   * `Blob.text()` is real async I/O that can still be pending if the component is destroyed first
   * (navigated away mid-download-error), and every other subscription in this file already guards
   * against exactly that with the same operator. Without it, the continuation below would still run
   * against a torn-down component and throw `NG0205: Injector has already been destroyed` reaching
   * for `utilityService`/`unspentUlbTable()` — caught via a real `NG0205` surfaced by the app-wide
   * spec suite (not the targeted one, which never straddles component destruction this way).
   */
  private handleDownloadApiError(err: unknown, fallbackMessage: string): void {
    from(this.parseBlobErrorResponse(err))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => this.applyExtractedApiError(response, fallbackMessage));
  }

  /** Shared tail of both error handlers above: shows the backend message as a snackbar, then routes
   *  any `errors` map through `applyApiErrors()` so field-keyed errors land below the matching field
   *  and `_form`/whole-array errors land in the `formLevelErrors` banner. */
  private applyExtractedApiError(response: ApiErrorResponse | null, fallbackMessage: string): void {
    this.utilityService.triggerSnackbar(response?.message ?? fallbackMessage, 'snackbar-danger');

    if (response?.errors) {
      this.applyApiErrors(response.errors);
    }

    // A row's `apiErrors` are set (and touched) asynchronously here, off the HTTP error callback —
    // not a native event inside the table's own template — so its OnPush view needs an explicit nudge.
    this.unspentUlbTable()?.refreshValidationDisplay();
  }

  /**
   * Parses the error body of the `responseType: 'blob'` download request into an `ApiErrorResponse`.
   * Falls back to `extractApiErrorResponse(err)` when `err.error` isn't a `Blob` (e.g. a
   * network-level error where no body was ever received), and resolves to `null` on any read/parse
   * failure. Mirrors `eulb-status.utils.ts`'s `parseBlobErrorResponse` — see
   * `handleDownloadApiError`'s doc comment for why it's replicated here rather than imported.
   */
  private async parseBlobErrorResponse(err: unknown): Promise<ApiErrorResponse | null> {
    const errorBody = this.isObject(err) ? err['error'] : undefined;
    if (!(errorBody instanceof Blob)) {
      return this.extractApiErrorResponse(err);
    }

    try {
      const text = await errorBody.text();
      const parsed: unknown = JSON.parse(text);
      return this.extractApiErrorResponse({ error: parsed });
    } catch {
      return null;
    }
  }

  /**
   * Extracts a structured error response from two possible error shapes:
   * 1. `HttpErrorResponse` (HTTP 4xx): body is in `err.error` with `{ statusCode, message, errors }`.
   * 2. Service map throw (2xx with success:false): `err` itself is `{ success, message, errors }`.
   *
   * `message` may be either NestJS's normal single string, or the plain `string[]` a
   * `ValidationPipe`/class-validator 400 sends when no custom `errors` map exists (e.g. `@IsInt()`
   * rejecting a decimal `unspentAmount`) — previously only the string case was recognized, so this
   * shape fell through to `null` entirely and the real backend message was dropped. When there's no
   * structured `errors` map already, one is synthesized from the message array via
   * `buildErrorMapFromMessages` so `applyApiErrors`/`ROW_ERROR_KEY_PATTERN` need no separate path.
   */
  private extractApiErrorResponse(err: unknown): ApiErrorResponse | null {
    if (!this.isObject(err)) return null;

    const errorBody = err['error'];
    if (this.isObject(errorBody) && this.hasMessage(errorBody)) {
      return this.buildApiErrorResponse(errorBody);
    }

    if (err['success'] === false && this.hasMessage(err)) {
      return this.buildApiErrorResponse(err);
    }

    return null;
  }

  private hasMessage(body: Record<string, unknown>): boolean {
    return typeof body['message'] === 'string' || this.isStringArray(body['message']);
  }

  private isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((v) => typeof v === 'string');
  }

  private buildApiErrorResponse(body: Record<string, unknown>): ApiErrorResponse {
    const rawMessage = body['message'];
    const messages = typeof rawMessage === 'string' ? [rawMessage] : this.isStringArray(rawMessage) ? rawMessage : [];
    const structuredErrors = this.isApiErrorMap(body['errors']) ? body['errors'] : undefined;

    return {
      statusCode: typeof body['statusCode'] === 'number' ? body['statusCode'] : undefined,
      message: messages.join(' '),
      errors: structuredErrors ?? this.buildErrorMapFromMessages(messages),
    };
  }

  /** Parses a plain class-validator `message: string[]` (no `errors` map) into the same
   *  `unspentUlbData.<row>.<field>` keys `applyApiErrors`/`ROW_ERROR_KEY_PATTERN` already expect —
   *  see `parseFieldPrefixedMessages`'s doc comment for why this parsing is safe, not a heuristic.
   *  Unmatched messages land under `_form`, which `applyApiErrors` already routes to
   *  `formLevelErrors` instead of dropping. */
  private buildErrorMapFromMessages(messages: readonly string[]): ApiErrorMap | undefined {
    if (!messages.length) return undefined;

    const { claimed, unclaimed } = parseFieldPrefixedMessages(messages, ['ulbId', 'unspentAmount'], 'unspentUlbData');
    const errors: ApiErrorMap = {};
    for (const entry of claimed) {
      const key = entry.rowIndex !== null ? `unspentUlbData.${entry.rowIndex}.${entry.field}` : entry.field;
      errors[key] = [...(errors[key] ?? []), { message: entry.message }];
    }
    if (unclaimed.length) {
      errors['_form'] = unclaimed.map((message) => ({ message }));
    }
    return Object.keys(errors).length ? errors : undefined;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private isApiErrorMap(value: unknown): value is ApiErrorMap {
    if (!this.isObject(value)) return false;
    return Object.values(value).every(
      (fieldErrors) =>
        Array.isArray(fieldErrors) &&
        fieldErrors.every((error: unknown) => this.isObject(error) && typeof error['message'] === 'string'),
    );
  }

  /**
   * Routes each backend error key to one of three destinations:
   * - `unspentUlbData.<index>.<ulbId|unspentAmount>` → the matching row control, as `apiErrors`.
   * - `_form` or bare `unspentUlbData` (whole-array errors) → `formLevelErrors`, shown in an alert.
   * - anything else → the matching dynamic-field control + its `validations` config (SFC pattern).
   */
  private applyApiErrors(errors: ApiErrorMap): void {
    const formLevelMessages: string[] = [];

    for (const [key, fieldErrors] of Object.entries(errors)) {
      if (!fieldErrors?.length) continue;

      if (key === '_form' || key === 'unspentUlbData') {
        formLevelMessages.push(...fieldErrors.map((e) => e.message));
        continue;
      }

      const rowMatch = ROW_ERROR_KEY_PATTERN.exec(key);
      if (rowMatch) {
        this.applyRowApiError(Number(rowMatch[1]), rowMatch[2] as 'ulbId' | 'unspentAmount', fieldErrors);
        continue;
      }

      this.applyDynamicFieldApiError(key, fieldErrors);
    }

    if (formLevelMessages.length) {
      this.formLevelErrors.set(formLevelMessages);
    }
  }

  private applyRowApiError(
    rowIndex: number,
    controlKey: 'ulbId' | 'unspentAmount',
    fieldErrors: ApiFieldError[],
  ): void {
    const row = this.unspentUlbData.controls[rowIndex];
    if (!row) return;

    const control = row.controls[controlKey];
    control.setErrors({ ...(control.errors ?? {}), apiErrors: fieldErrors.map((e) => e.message) });
    control.markAsTouched();
  }

  /**
   * Maps backend field errors into the existing dynamic-form validation system (same approach as
   * `SfcStatusComponent.applyApiErrors`): the `fields` signal gets a matching `validations` entry
   * (so the field's own template rendering shows the message), and the same error code is set on
   * the control (so `hasError()` reports it). Errors are skipped for currently-hidden fields.
   *
   * New server-driven validation entries are unshifted to the *front* of `field.validations`, not
   * pushed to the end. `FileComponent.errorMessage()` displays the message of the first validation
   * whose name is a key in `control.errors` — `fcUnspentDeclaration`'s `download-declaration`
   * `noRows` gate error is exactly the case where the control is still empty (no file uploaded yet)
   * when the error lands, so `required` and the server code (`noRows`) both sit in `control.errors`
   * at once — unshifting ensures the more specific, actionable server message wins over the generic
   * "This field is required." placeholder. Same fix already applied to
   * `elected-body-status.component.ts`'s identical method for the same reason.
   */
  private applyDynamicFieldApiError(fieldKey: string, fieldErrors: ApiFieldError[]): void {
    this.fields.update((fields) =>
      fields.map((field) => {
        if (field.key !== fieldKey || field.hidden) return field;

        const validations = [...(field.validations ?? [])];
        for (const error of fieldErrors) {
          if (!error.code) continue;
          const existingIdx = validations.findIndex((v) => v.name === error.code);
          if (existingIdx >= 0) {
            validations[existingIdx] = { ...validations[existingIdx], message: error.message };
          } else {
            validations.unshift({ name: error.code, validator: null, message: error.message });
          }
        }

        return { ...field, validations };
      }),
    );

    const fieldConfig = this.fields().find((f) => f.key === fieldKey);
    if (fieldConfig?.hidden) return;

    const control = this.form.get(fieldKey);
    if (!control) {
      console.warn(`[FC Unspent Declaration] API error for unknown field: ${fieldKey}`);
      return;
    }

    const errorMap = fieldErrors.reduce<Record<string, true>>((acc, error) => {
      if (error.code) acc[error.code] = true;
      return acc;
    }, {});

    control.setErrors({ ...(control.errors ?? {}), ...errorMap });
    control.markAsTouched();
    control.markAsDirty();

    this.serverErrorKeys.set(fieldKey, [...(this.serverErrorKeys.get(fieldKey) ?? []), ...Object.keys(errorMap)]);
  }

  /** Clears dynamic-field server errors, row `apiErrors`, and `formLevelErrors` before the next request. */
  private clearAllApiErrors(): void {
    for (const [fieldKey, errorCodes] of this.serverErrorKeys) {
      const control = this.form.get(fieldKey);
      if (!control?.errors) continue;
      const remaining = { ...control.errors };
      for (const code of errorCodes) delete remaining[code];
      control.setErrors(Object.keys(remaining).length ? remaining : null);
    }
    this.serverErrorKeys.clear();

    for (const row of this.unspentUlbData.controls) {
      for (const control of Object.values(row.controls)) {
        if (!control.errors?.['apiErrors']) continue;
        const remaining = { ...control.errors };
        delete remaining['apiErrors'];
        control.setErrors(Object.keys(remaining).length ? remaining : null);
      }
    }

    this.formLevelErrors.set([]);
  }

  /** Tears down the current form/rows and reloads fresh state from the backend. */
  private reloadForm(): void {
    this.formSubscriptionsTeardown$.next();
    this.form = this.fb.group({});
    this.unspentUlbData.clear();
    this.fields.set([]);
    this.rowEditFields.set([]);
    this.loadForm();
  }

  onCancel(): void {
    this.confirmDialogService
      .confirm(undefined, this.dialogConfig)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.utilityService.triggerSnackbar('Form submission cancelled.', 'snackbar-danger');
      });
  }

  /**
   * For `finalSubmit`: every error on visible controls must be absent.
   * For `saveAsDraft`: plain `required` errors are skipped (empty fields are allowed in a
   * draft) — this currently includes `requiredTrue` too (see TODO below), which Angular
   * reports under the same `required` error key.
   */
  private isValidForSubmitType(action: SubmitType): boolean {
    for (const field of this.visibilityService.getVisibleFields(this.fields())) {
      if (!field.key) continue;
      const control = this.form.get(field.key);
      if (!control?.errors) continue;

      // TODO: requiredTrue (declaration/confirmation checkboxes) is temporarily not mandatory for
      // saveAsDraft either — uncomment both lines below to restore the original "still blocks drafts" behavior.
      // const hasRequiredTrueValidator = field.validations?.some((v) => v.name === 'requiredTrue') ?? false;

      for (const errorKey of Object.keys(control.errors)) {
        if (action === 'saveAsDraft' && errorKey === 'required' /* && !hasRequiredTrueValidator */) continue;
        return false;
      }
    }

    return true;
  }

  /**
   * Validates the unspentUlbData FormArray, only when the Yes branch is active. Kept separate
   * from isValidForSubmitType to avoid building a generic cross-FormArray validation framework
   * for what is currently a single, page-specific repeating field.
   */
  private isUnspentUlbDataValidForSubmitType(action: SubmitType): boolean {
    if (!this.isYesBranch()) return true;

    if (action === 'finalSubmit' && this.unspentUlbData.length === 0) {
      return false;
    }

    let valid = true;

    for (const row of this.unspentUlbData.controls) {
      const ulbIdControl = row.controls.ulbId;
      const unspentAmountControl = row.controls.unspentAmount;

      if (action === 'finalSubmit') {
        if (ulbIdControl.invalid || unspentAmountControl.invalid) {
          valid = false;
          ulbIdControl.markAsTouched();
          unspentAmountControl.markAsTouched();
        }
        continue;
      }

      // saveAsDraft: skip bare `required` errors (empty rows are allowed in a draft), but never
      // skip other errors such as a non-positive entered amount.
      for (const control of [ulbIdControl, unspentAmountControl]) {
        if (!control.errors) continue;
        for (const errorKey of Object.keys(control.errors)) {
          if (errorKey === 'required') continue;
          valid = false;
          control.markAsTouched();
        }
      }
    }

    return valid;
  }
}
