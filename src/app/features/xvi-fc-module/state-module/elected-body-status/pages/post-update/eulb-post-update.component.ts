import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';
import { UtilityService } from '../../../../../../core/services/utility.service';
import { PreLoaderComponent } from '../../../../../../shared/components/pre-loader/pre-loader.component';
import { DynamicFormComponent } from '../../../../../../shared/dynamic-form/dynamic-form.component';
import { UploadedFileValue } from '../../../../../../shared/dynamic-form/field.interface';
import { DynamicFormService } from '../../../../../../shared/dynamic-form/dynamic-form.service';
import { ConditionalFieldConfig, DynamicFormVisibilityService } from '../../../../dynamic-form-visibility.service';
import { XvifcModuleService } from '../../../../xvi-fc-module.service';
import { POST_SUBMISSION_UPDATE_STATUS } from '../../elected-body-status.component';
import {
  EulbEditableFieldKey,
  EulbPostSubmissionUpdateDocument,
  EulbPostSubmissionUpdateElectedBodyStatus,
  EulbPostSubmissionUpdateMetadata,
  EulbPostSubmissionUpdateRow,
  EulbPostSubmissionUpdateRowsData,
  EulbPostSubmissionUpdateRowsQuery,
  EulbPostSubmissionUpdateSubmitPayload,
  EulbPostSubmissionUpdateSubmitResponse,
  EulbPostSubmissionUpdateSubmitRowError,
  EulbPostSubmissionUpdateValidateData,
  EulbPostSubmissionUpdateValidateResponse,
  EulbPostSubmissionUpdateValidateRowPayload,
  EulbStatusSummary,
} from '../../eulb-status.models';
import { EulbStatusService } from '../../eulb-status.service';
import { isRecord } from '../../eulb-status.utils';
import {
  buildEulbModifiedRowViewModel,
  EULB_ROW_VALIDATION_STATUS_OPTIONS,
  isEulbRowValidationStatus,
} from '../../shared/eulb-row-edit.utils';
import { EulbEditableFieldCellComponent } from '../../components/editable-field-cell/eulb-editable-field-cell.component';
import { EulbValidationBadgeComponent } from '../../components/validation-badge/eulb-validation-badge.component';
import { FormStatusValue } from '../../../../shared/form-progress/form-progress.component';
import { EulbPostUpdateEditForm, EulbPostUpdateEditFormFacade } from './eulb-post-update-edit-form.facade';
import {
  EulbPostUpdateStateAdapter,
  EulbPostUpdateValidationState,
  rowToPostUpdateValidatePayload,
} from './eulb-post-update-state.adapter';

type EulbPostUpdateEditableFieldKey = EulbEditableFieldKey;

interface EulbStatusSummaryCard {
  readonly count: number;
  readonly label: string;
  readonly borderClass: string;
  readonly textClass: string;
}

interface EulbPostUpdateRequestContext {
  readonly stateId: string;
  readonly yearId: string;
}

interface EulbPostUpdateTrackedRequestContext extends EulbPostUpdateRequestContext {
  readonly requestId: number;
}

interface EulbPostUpdateRowsContext extends EulbPostUpdateTrackedRequestContext {
  readonly query: EulbPostSubmissionUpdateRowsQuery;
}

interface EulbPostUpdateValidationContext extends EulbPostUpdateTrackedRequestContext {
  readonly rows: EulbPostSubmissionUpdateValidateRowPayload[];
}

interface EulbPostUpdateSubmitContext extends EulbPostUpdateTrackedRequestContext {
  readonly payload: EulbPostSubmissionUpdateSubmitPayload;
}

const ELECTED_BODY_STATUS_FILTER_OPTIONS: ReadonlyArray<{
  readonly value: EulbPostSubmissionUpdateElectedBodyStatus;
  readonly label: string;
}> = [
  { value: 'Constituted', label: 'Constituted' },
  { value: 'Not Constituted', label: 'Not Constituted' },
];

function isPostUpdateElectedBodyStatus(value: unknown): value is EulbPostSubmissionUpdateElectedBodyStatus {
  return value === 'Constituted' || value === 'Not Constituted';
}

@Component({
  selector: 'app-eulb-post-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatButton,
    PreLoaderComponent,
    DynamicFormComponent,
    EulbEditableFieldCellComponent,
    EulbValidationBadgeComponent,
  ],
  templateUrl: './eulb-post-update.component.html',
  styleUrl: './eulb-post-update.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EulbPostUpdateComponent implements OnInit {
  private readonly service = inject(EulbStatusService);
  private readonly utilityService = inject(UtilityService);
  private readonly moduleService = inject(XvifcModuleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly dynamicService = inject(DynamicFormService);
  private readonly visibilityService = inject(DynamicFormVisibilityService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly isLoadingMeta = signal(false);
  readonly isLoadingRows = signal(false);
  readonly isValidating = signal(false);
  readonly isSubmitting = signal(false);
  readonly metadata = signal<EulbPostSubmissionUpdateMetadata | null>(null);
  readonly rows = signal<EulbPostSubmissionUpdateRow[]>([]);
  readonly statusSummary = signal<EulbStatusSummary | null>(null);
  readonly changedRows = signal<ReadonlyMap<string, EulbPostSubmissionUpdateValidateRowPayload>>(new Map());
  readonly updateDocument = signal<EulbPostSubmissionUpdateDocument | null>(null);
  readonly validationState = signal<EulbPostUpdateValidationState>('NOT_VALIDATED');
  readonly metadataErrorMessage = signal<string | null>(null);
  readonly rowsErrorMessage = signal<string | null>(null);
  readonly documentErrorMessage = signal<string | null>(null);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 20;
  readonly editingRowId = signal<string | null>(null);
  private readonly allowedStatus = POST_SUBMISSION_UPDATE_STATUS;

  readonly filterForm = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    electedBodyStatus: new FormControl('', { nonNullable: true }),
    validationStatus: new FormControl('', { nonNullable: true }),
  });

  private readonly editFormFacade = new EulbPostUpdateEditFormFacade({
    dynamicService: this.dynamicService,
    visibilityService: this.visibilityService,
    markForCheck: () => this.cdr.markForCheck(),
  });

  editForm: EulbPostUpdateEditForm = this.editFormFacade.form;

  readonly canView = computed(() => {
    const meta = this.metadata();
    return !!meta?.canUpdate && !!meta.permissions.canView;
  });

  readonly pageRowEditFields = computed(() => this.editFormFacade.resolveFields(this.metadata()?.rowEditFields ?? []));

  readonly editableFieldKeys = computed<ReadonlySet<EulbPostUpdateEditableFieldKey>>(() =>
    this.editFormFacade.getEditableFieldKeys(this.pageRowEditFields()),
  );

  readonly canEditRows = computed(() => {
    const meta = this.metadata();
    return this.canView() && !!meta?.permissions.canSubmitUpdate && this.editableFieldKeys().size > 0;
  });

  readonly eligibleRowCount = computed(() => this.metadata()?.summary.eligibleRowCount ?? 0);
  readonly changedRowCount = computed(() => this.changedRows().size);
  readonly canSubmitUpdate = computed(
    () =>
      this.hasSubmitPermission() &&
      this.changedRowCount() > 0 &&
      !!this.updateDocument() &&
      this.validationState() === 'VALID' &&
      !this.isSubmitting(),
  );
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.limit)));
  readonly hasPrev = computed(() => this.page() > 1);
  readonly hasNext = computed(() => this.page() < this.totalPages());
  readonly startIndex = computed(() => (this.page() - 1) * this.limit + 1);
  readonly endIndex = computed(() => Math.min(this.page() * this.limit, this.total()));
  readonly rowViewModels = computed(() =>
    this.rows().map((row) => buildEulbModifiedRowViewModel(row, this.changedRows())),
  );

  readonly statusSummaryCards = computed<EulbStatusSummaryCard[]>(() => {
    const summary = this.statusSummary();
    if (!summary) return [];
    return [
      {
        count: summary.constitutedCount,
        label: 'Eligible - elected body constituted',
        borderClass: 'border-success',
        textClass: 'text-success',
      },
      {
        count: summary.notConstitutedCount,
        label: 'Ineligible - no elected body',
        borderClass: 'border-danger',
        textClass: 'text-danger',
      },
      {
        count: summary.exemptCount,
        label: 'Exempt (Cantonment / NAC)',
        borderClass: 'border-secondary',
        textClass: '',
      },
    ];
  });

  readonly isFormViewAllowed = computed(() => {
    const metadata = this.metadata();
    if (metadata === null) return false;

    const formStatus = metadata.formStatus as FormStatusValue;
    return formStatus ? !this.allowedStatus.includes(formStatus) : false;
  });

  readonly electedBodyStatusOptions = ELECTED_BODY_STATUS_FILTER_OPTIONS;
  readonly validationStatusOptions = EULB_ROW_VALIDATION_STATUS_OPTIONS;

  proofOfElectionField: ConditionalFieldConfig | null = null;
  readonly proofOfElectionForm = new FormGroup({});

  private redirectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Sets up a redirect effect: if `isFormViewAllowed` becomes true (form not in an updatable
   * status), navigates back to the elected-body form after a short grace period so the user
   * can read any status message before being redirected.
   */
  constructor() {
    // On redirect guard: each time isFormViewAllowed flips to true, clear any previous timer before
    // setting a new one, so rapid metadata reloads never stack multiple redirects.
    effect(() => {
      if (this.isFormViewAllowed()) {
        clearTimeout(this.redirectTimeout ?? undefined);
        this.redirectTimeout = setTimeout(() => this.goToElectedBodyForm(), 2500);
      }
    });

    this.destroyRef.onDestroy(() => {
      clearTimeout(this.redirectTimeout ?? undefined);
    });
  }

  private readonly rowState = new EulbPostUpdateStateAdapter();
  private loadRequestId = 0;
  private validateRequestId = 0;
  private submitRequestId = 0;
  private proofOfElectionValueVersion = 0;

  // Populated from the API metadata response; localStorage is only used for the initial request.
  private stateId = '';

  private get yearId(): string {
    return this.moduleService.yearId() ?? '';
  }

  ngOnInit(): void {
    this.loadMetadata();
    this.setupFilterSubscription();
  }

  private initProofOfElectionForm(field: ConditionalFieldConfig): void {
    this.proofOfElectionField = field;
    const control = this.dynamicService.createContorl(field, false, false);
    this.proofOfElectionForm.addControl('proofOfElection', control);

    control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((raw: unknown) => {
      this.handleProofOfElectionValueChange(raw);
    });
  }

  private handleProofOfElectionValueChange(raw: unknown): void {
    const version = ++this.proofOfElectionValueVersion;
    this.applyProofOfElectionValue(raw, version);
  }

  private applyProofOfElectionValue(raw: unknown, version: number): void {
    if (this.isStaleProofOfElectionValue(version)) return;
    this.updateDocument.set(this.buildDocumentMetadataFromUploadResult(raw));
  }

  private buildDocumentMetadataFromUploadResult(raw: unknown): EulbPostSubmissionUpdateDocument | null {
    if (!this.isUploadedFileWithLocation(raw)) return null;

    return {
      fileName: raw.fileName,
      fileUrl: raw.fileUrl,
      fileSize: typeof raw.fileSize === 'number' ? raw.fileSize : 0,
      mimeType: raw.mimeType,
    };
  }

  private isUploadedFileWithLocation(value: unknown): value is UploadedFileValue & {
    readonly fileName: string;
    readonly fileUrl: string;
  } {
    return (
      isRecord(value) &&
      typeof value['fileName'] === 'string' &&
      value['fileName'] !== '' &&
      typeof value['fileUrl'] === 'string' &&
      value['fileUrl'] !== ''
    );
  }

  private isStaleProofOfElectionValue(version: number): boolean {
    return version !== this.proofOfElectionValueVersion;
  }

  loadMetadata(): void {
    const context = this.startMetadataLoad();
    if (!context) return;

    this.service
      .getPostSubmissionUpdateMetadata(context.stateId, context.yearId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (meta) => this.handleMetadataSuccess(meta),
        error: () => this.handleMetadataError(),
      });
  }

  private startMetadataLoad(): EulbPostUpdateRequestContext | null {
    // Read stateId from localStorage only for this initial request; the API response is authoritative thereafter.
    const stateId = this.resolveStateIdFromStorage();
    const yearId = this.yearId;

    if (!stateId || !yearId) {
      this.metadataErrorMessage.set('State or year information is missing.');
      this.utilityService.triggerSnackbar(
        'Unable to load the form. State or year information is missing.',
        'snackbar-danger',
      );
      return null;
    }

    this.metadataErrorMessage.set(null);
    this.rowsErrorMessage.set(null);
    this.isLoadingMeta.set(true);
    return { stateId, yearId };
  }

  private handleMetadataSuccess(meta: EulbPostSubmissionUpdateMetadata): void {
    this.stateId = meta.stateId;
    this.metadata.set(meta);
    this.isLoadingMeta.set(false);
    this.initProofOfElectionFormIfNeeded(meta);

    if (this.shouldLoadRowsAfterMetadata(meta)) {
      this.loadRows();
      return;
    }

    this.clearRowsForUnavailableMetadata();
  }

  private handleMetadataError(): void {
    this.isLoadingMeta.set(false);
    this.metadataErrorMessage.set('Failed to load post-submission update data.');
    this.utilityService.triggerSnackbar('Failed to load post-submission update data.', 'snackbar-danger');
  }

  private initProofOfElectionFormIfNeeded(meta: EulbPostSubmissionUpdateMetadata): void {
    const questionField = meta.questions.find((q) => q.key === 'proofOfElection') ?? null;
    if (questionField && !this.proofOfElectionForm.contains('proofOfElection')) {
      this.initProofOfElectionForm(questionField);
    }
  }

  private shouldLoadRowsAfterMetadata(meta: EulbPostSubmissionUpdateMetadata): boolean {
    return meta.canUpdate && meta.permissions.canView;
  }

  private clearRowsForUnavailableMetadata(): void {
    this.rows.set([]);
    this.total.set(0);
  }

  private resolveStateIdFromStorage(): string {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('userData') : null;
      return raw ? ((JSON.parse(raw) as { state?: string }).state ?? '') : '';
    } catch {
      return '';
    }
  }

  /**
   * Fetches a paginated, filtered page of eligible ULB rows from the API.
   * Guards against stale responses with a request-ID counter so only the latest call writes state.
   * Merges server data with any locally-changed and validated rows before updating the signal.
   */
  loadRows(): void {
    const context = this.startRowsLoad();
    if (!context) return;

    this.service
      .getPostSubmissionUpdateRows(context.stateId, context.yearId, context.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.handleRowsSuccess(context.requestId, data),
        error: () => this.handleRowsError(context.requestId),
      });
  }

  private startRowsLoad(): EulbPostUpdateRowsContext | null {
    if (!this.canView()) return null;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.rowsErrorMessage.set('State or year information is missing.');
      this.utilityService.triggerSnackbar(
        'Unable to load eligible rows. State or year information is missing.',
        'snackbar-danger',
      );
      return null;
    }

    this.rowsErrorMessage.set(null);
    this.isLoadingRows.set(true);
    return {
      stateId,
      yearId,
      requestId: ++this.loadRequestId,
      query: this.buildRowsQuery(),
    };
  }

  private buildRowsQuery(): EulbPostSubmissionUpdateRowsQuery {
    const { search, electedBodyStatus, validationStatus } = this.filterForm.getRawValue();
    return {
      page: this.page(),
      limit: this.limit,
      search: search || undefined,
      electedBodyStatus: isPostUpdateElectedBodyStatus(electedBodyStatus) ? electedBodyStatus : undefined,
      validationStatus: isEulbRowValidationStatus(validationStatus) ? validationStatus : undefined,
    };
  }

  private handleRowsSuccess(requestId: number, data: EulbPostSubmissionUpdateRowsData): void {
    if (this.isStaleRowsResponse(requestId)) return;

    this.rowState.storeLoadedRows(data.rows);
    this.rows.set(this.rowState.overlayRowsWithLocalState(data.rows));
    this.total.set(data.total);
    this.statusSummary.set(data.statusSummary ?? null);
    this.isLoadingRows.set(false);
  }

  private handleRowsError(requestId: number): void {
    if (this.isStaleRowsResponse(requestId)) return;

    this.rowsErrorMessage.set('Failed to load eligible rows.');
    this.utilityService.triggerSnackbar('Failed to load eligible rows.', 'snackbar-danger');
    this.isLoadingRows.set(false);
  }

  private isStaleRowsResponse(requestId: number): boolean {
    return requestId !== this.loadRequestId;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
    this.loadRows();
  }

  startEdit(row: EulbPostSubmissionUpdateRow): void {
    if (!this.canEditRows()) return;
    const basePayload = this.rowState.getChangedPayload(row._id) ?? rowToPostUpdateValidatePayload(row);

    this.editingRowId.set(row._id);
    this.editForm = this.editFormFacade.startEdit({
      payload: basePayload,
      fields: this.pageRowEditFields(),
      canEdit: this.canEditRows(),
      onChange: () => this.updateChangedRowFromEdit(row._id),
    });
  }

  finishEdit(rowId: string): void {
    if (this.editingRowId() !== rowId) return;
    this.editFormFacade.resetEditState();
    this.editingRowId.set(null);
  }

  resetRow(rowId: string): void {
    const loadedRow = this.rowState.resetRow(rowId);
    if (!loadedRow) return;

    this.syncChangedRows();

    if (this.editingRowId() === rowId) {
      this.editFormFacade.resetEditState();
      this.editingRowId.set(null);
    }

    this.rows.update((rows) => rows.map((row) => (row._id === rowId ? loadedRow : row)));
    this.markValidationStaleAfterLocalChange();
  }

  submitUpdate(): void {
    const context = this.startSubmit();
    if (!context) return;

    this.service
      .submitPostSubmissionUpdate(context.stateId, context.yearId, context.payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.handleSubmitSuccess(context.requestId, response),
        error: (error: unknown) => this.handleSubmitErrorResponse(context.requestId, error),
      });
  }

  private startSubmit(): EulbPostUpdateSubmitContext | null {
    if (this.isSubmitting()) return null;
    if (!this.hasSubmitPermission()) return null;

    const payload = this.buildSubmitPayload();
    if (!payload) return null;

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to submit changes. State or year information is missing.',
        'snackbar-danger',
      );
      return null;
    }

    this.isSubmitting.set(true);
    this.documentErrorMessage.set(null);
    return { stateId, yearId, requestId: ++this.submitRequestId, payload };
  }

  private buildSubmitPayload(): EulbPostSubmissionUpdateSubmitPayload | null {
    const rows = this.rowState.buildChangedRowsPayload();
    if (!rows.length) {
      this.utilityService.triggerSnackbar('No changed rows to submit.', 'snackbar-warn');
      return null;
    }

    const document = this.updateDocument();
    if (!document) {
      this.documentErrorMessage.set('Please upload the combined PDF before submitting.');
      this.utilityService.triggerSnackbar('Please upload the combined PDF before submitting.', 'snackbar-warn');
      return null;
    }

    if (this.validationState() !== 'VALID') {
      this.utilityService.triggerSnackbar('Please validate changes before submitting.', 'snackbar-warn');
      return null;
    }

    return { rows, document };
  }

  private handleSubmitSuccess(requestId: number, response: EulbPostSubmissionUpdateSubmitResponse): void {
    if (this.isStaleSubmitResponse(requestId)) return;

    this.isSubmitting.set(false);
    this.clearPostSubmitState();
    this.utilityService.triggerSnackbar(
      response.message ?? 'Elected Urban Local Bodies update submitted successfully.',
      'snackbar-success',
    );
    this.loadMetadata();
  }

  private handleSubmitErrorResponse(requestId: number, error: unknown): void {
    if (this.isStaleSubmitResponse(requestId)) return;

    this.isSubmitting.set(false);
    this.handleSubmitError(error);
  }

  private isStaleSubmitResponse(requestId: number): boolean {
    return requestId !== this.submitRequestId;
  }

  validateChanges(): void {
    const context = this.startValidation();
    if (!context) return;

    this.service
      .validatePostSubmissionUpdateRows(context.stateId, context.yearId, { rows: context.rows })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.handleValidationSuccess(context.requestId, response),
        error: () => this.handleValidationError(context.requestId),
      });
  }

  private startValidation(): EulbPostUpdateValidationContext | null {
    const rows = this.buildValidateRowsPayload();
    if (!rows.length) {
      this.utilityService.triggerSnackbar('No changed rows to validate.', 'snackbar-warn');
      return null;
    }

    const stateId = this.stateId;
    const yearId = this.yearId;
    if (!stateId || !yearId) {
      this.utilityService.triggerSnackbar(
        'Unable to validate changes. State or year information is missing.',
        'snackbar-danger',
      );
      return null;
    }

    this.isValidating.set(true);
    return { stateId, yearId, requestId: ++this.validateRequestId, rows };
  }

  private buildValidateRowsPayload(): EulbPostSubmissionUpdateValidateRowPayload[] {
    return this.rowState.buildChangedRowsPayload();
  }

  private handleValidationSuccess(requestId: number, response: EulbPostSubmissionUpdateValidateResponse): void {
    if (this.isStaleValidationResponse(requestId)) return;

    this.applyValidationData(response.data);
    this.isValidating.set(false);

    if (response.data.validationStatus === 'INVALID' || response.data.errorRowCount > 0) {
      this.handleInvalidValidationResult(response.message);
      return;
    }

    this.handleValidValidationResult(response.message);
  }

  private handleInvalidValidationResult(message: string | undefined): void {
    this.validationState.set('INVALID');
    this.utilityService.triggerSnackbar(
      message ?? 'Validation complete. Some changed rows have errors.',
      'snackbar-danger',
    );
  }

  private handleValidValidationResult(message: string | undefined): void {
    this.validationState.set('VALID');
    this.utilityService.triggerSnackbar(message ?? 'All changed rows are valid.', 'snackbar-success');
  }

  private handleValidationError(requestId: number): void {
    if (this.isStaleValidationResponse(requestId)) return;

    this.isValidating.set(false);
    this.utilityService.triggerSnackbar('Failed to validate changed rows.', 'snackbar-danger');
  }

  private isStaleValidationResponse(requestId: number): boolean {
    return requestId !== this.validateRequestId;
  }

  isFieldEditable(field: EulbPostUpdateEditableFieldKey): boolean {
    return this.editFormFacade.isFieldEditable(field, this.pageRowEditFields());
  }

  isRowModified(rowId: string): boolean {
    return this.changedRows().has(rowId);
  }

  getEditDateMin(fieldKey: string): string | null {
    return this.editFormFacade.getEditDateMin(fieldKey);
  }

  getEditDateMax(fieldKey: string): string | null {
    return this.editFormFacade.getEditDateMax(fieldKey);
  }

  isEditFieldEnabled(field: string): boolean {
    return this.editFormFacade.isFieldEnabled(field);
  }

  getEditFieldDisabledReason(field: string): string {
    return this.editFormFacade.getFieldDisabledReason(field);
  }

  getUpdateValidationStateBadgeClass(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'text-success';
    if (s === 'INVALID') return 'text-danger';
    if (s === 'STALE') return 'text-warning';
    return 'text-secondary';
  }

  getUpdateValidationStateLabel(): string {
    const s = this.validationState();
    if (s === 'VALID') return 'Valid';
    if (s === 'INVALID') return 'Invalid';
    if (s === 'STALE') return 'Stale — re-validate needed';
    return 'Not validated';
  }

  startEditAtField(row: EulbPostSubmissionUpdateRow, field: string): void {
    if (!this.canEditRows()) return;
    if (this.editingRowId() !== null) return;
    const hasError = row.errors?.some((err) => err.field === field) ?? false;
    if (!hasError) return;
    this.startEdit(row);
    afterNextRender(
      () => {
        const el = this.elementRef.nativeElement.querySelector(`[data-eulb-post-edit-field="${field}"]`);
        if (el instanceof HTMLElement) el.focus();
      },
      { injector: this.injector },
    );
  }

  getSubmitDisabledReason(): string {
    if (this.changedRowCount() === 0) return 'No changed rows to submit.';
    if (!this.updateDocument()) return 'Upload the combined PDF first.';
    if (this.validationState() !== 'VALID') return 'Validate changes before submitting.';
    return '';
  }

  private updateChangedRowFromEdit(rowId: string): void {
    const loadedRow = this.rowState.getLoadedRow(rowId);
    if (!loadedRow) return;

    const payload = this.editFormFacade.readPayload(loadedRow);
    this.rowState.updateChangedRow(rowId, payload);
    this.syncChangedRows();
    this.rows.update((rows) =>
      rows.map((row) => (row._id === rowId ? this.rowState.overlayRowWithLocalState(loadedRow) : row)),
    );
    this.markValidationStaleAfterLocalChange();
  }

  private hasSubmitPermission(): boolean {
    const meta = this.metadata();
    return !!meta && meta.canUpdate === true && meta.permissions.canSubmitUpdate === true;
  }

  private applyValidationData(data: EulbPostSubmissionUpdateValidateData): void {
    this.rows.update((rows) => this.rowState.applyValidationData(data, rows));
  }

  private handleSubmitError(error: unknown): void {
    this.handleSubmitRowErrors(error);
    const documentMessage = this.handleSubmitDocumentErrors(error);
    this.handleSubmitStructuralError(error, documentMessage);
  }

  private handleSubmitRowErrors(error: unknown): void {
    const rowErrors = this.extractSubmitRowErrors(error);
    if (rowErrors.length) {
      this.applySubmitRowErrors(rowErrors);
    }
  }

  private handleSubmitDocumentErrors(error: unknown): string | null {
    const documentMessage = this.extractDocumentErrorMessage(error);
    if (documentMessage) {
      this.documentErrorMessage.set(documentMessage);
    }
    return documentMessage;
  }

  private handleSubmitStructuralError(error: unknown, documentMessage: string | null): void {
    const message = this.extractErrorMessage(error) ?? documentMessage ?? 'Failed to submit update.';
    this.utilityService.triggerSnackbar(message, 'snackbar-danger');
  }

  private applySubmitRowErrors(rowErrors: readonly EulbPostSubmissionUpdateSubmitRowError[]): void {
    this.validationState.set('INVALID');
    this.rows.update((rows) => this.rowState.applySubmitRowErrors(rowErrors, rows));
  }

  private extractSubmitRowErrors(error: unknown): EulbPostSubmissionUpdateSubmitRowError[] {
    const body = this.extractErrorBody(error);
    if (!body) return [];

    const data = body['data'];
    if (!isRecord(data)) return [];

    const rowErrors = data['rowErrors'];
    if (!Array.isArray(rowErrors)) return [];

    const parsed: EulbPostSubmissionUpdateSubmitRowError[] = [];
    for (const rowError of rowErrors) {
      if (!isRecord(rowError)) continue;

      const rowId = rowError['rowId'];
      const rowNumber = rowError['rowNumber'];
      const censusCode = rowError['censusCode'];
      const ulbName = rowError['ulbName'];
      const errors = rowError['errors'];

      if (
        typeof rowId !== 'string' ||
        typeof rowNumber !== 'number' ||
        typeof censusCode !== 'string' ||
        typeof ulbName !== 'string' ||
        !Array.isArray(errors)
      ) {
        continue;
      }

      parsed.push({
        rowId,
        rowNumber,
        censusCode,
        ulbName,
        errors: errors.flatMap((fieldError: unknown) => this.parsePostUpdateRowError(fieldError)),
      });
    }

    return parsed;
  }

  private parsePostUpdateRowError(error: unknown): EulbPostSubmissionUpdateSubmitRowError['errors'] {
    if (!isRecord(error)) return [];
    const message = error['message'];
    if (typeof message !== 'string') return [];

    return [
      {
        field: typeof error['field'] === 'string' ? error['field'] : undefined,
        code: typeof error['code'] === 'string' ? error['code'] : undefined,
        message,
        value: error['value'],
      },
    ];
  }

  private extractDocumentErrorMessage(error: unknown): string | null {
    const body = this.extractErrorBody(error);
    const errors = body?.['errors'];
    if (!isRecord(errors)) return null;

    const documentErrors = errors['document'];
    if (!Array.isArray(documentErrors)) return null;

    for (const documentError of documentErrors) {
      if (isRecord(documentError) && typeof documentError['message'] === 'string') {
        return documentError['message'];
      }
    }

    return null;
  }

  private extractErrorMessage(error: unknown): string | null {
    const body = this.extractErrorBody(error);
    const message = body?.['message'];
    return typeof message === 'string' ? message : null;
  }

  // Angular's HTTP client nests the parsed JSON body under error.error for non-2xx responses.
  private extractErrorBody(error: unknown): Record<string, unknown> | null {
    if (!isRecord(error)) return null;
    const nested = error['error'];
    if (isRecord(nested)) return nested;
    return error;
  }

  private clearPostSubmitState(): void {
    this.rowState.clear();
    this.syncChangedRows();
    this.updateDocument.set(null);
    this.documentErrorMessage.set(null);
    this.validationState.set('NOT_VALIDATED');
    this.editingRowId.set(null);
    this.resetProofOfElectionInput();
  }

  private resetProofOfElectionInput(): void {
    this.proofOfElectionForm.patchValue({ proofOfElection: null });
  }

  private markValidationStaleAfterLocalChange(): void {
    this.validationState.set(this.rowState.nextValidationStateAfterLocalChange(this.validationState()));
  }

  private syncChangedRows(): void {
    this.changedRows.set(this.rowState.getChangedRows());
  }

  private setupFilterSubscription(): void {
    const { search, electedBodyStatus, validationStatus } = this.filterForm.controls;

    merge(
      search.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      electedBodyStatus.valueChanges,
      validationStatus.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.canView()) return;
        this.page.set(1);
        this.loadRows();
      });
  }

  /** Navigates to the elected-body-status sibling route. */
  goToElectedBodyForm(): void {
    void this.router.navigate(['elected-body-status'], { relativeTo: this.activatedRoute.parent });
  }
}
