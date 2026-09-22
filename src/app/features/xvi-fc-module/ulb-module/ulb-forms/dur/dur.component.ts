import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuthPermissionService } from '../../../../../core/auth/auth-permission.service';
import { UtilityService } from '../../../../../core/services/utility.service';
import { FileService } from '../../../../../shared/dynamic-form/components/file/file.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { SUPPRESS_ERROR_TOAST } from '../../../../../core/security/custom-http.interceptor';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subscription, catchError, firstValueFrom, interval, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import { DocumentActionRowComponent } from '../../../../../shared/components/document-action-row/document-action-row.component';
import type {
  ActionGate,
  DocumentRuntimeState,
  ResolvedDocumentAction,
} from '../../../../../shared/components/document-action-row/document-action-row.types';
import {
  UlbFormsDialogComponent,
  ULB_FORMS_DIALOG_PANEL_CLASS,
  type UlbFormsDialogData,
} from '../upload-documents/ulb-forms-dialog.component';
import { checkPdfHasContent } from '../../../../../shared/dynamic-form/utils/pdf-blank-check.util';
import { getMaxPageCountError } from '../upload-documents/upload-documents.component';

// ─── Model types ───────────────────────────────────────────────────────────

export type DurDocId = 'tiedGrant' | 'untiedGrant';

interface DurDocDef {
  /** Compact label shown in the step-3 upload list ("Tied grant *"). */
  shortLabel: string;
  templateLabel: string;
  templateUrl: string;
  allowedFileTypes: string[];
  maxFileSizeKb: number;
}

/** Field config fetched from GET xvi-fc/dur/form-config (formjson formId 36) — same shape used
 *  by Annual Account's upload-config (key/label/placeholder/required/allowedFileTypes/
 *  maxFileSize), plus `supportingContent` for the template-download link (the same mechanism
 *  FieldConfig already reserves for "template-download... action" — see field-config.type.ts). */
interface DurApiFieldConfig {
  key: DurDocId;
  label: string;
  placeholder?: string;
  required?: boolean;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  supportingContent?: Array<{ type?: string; label?: string; url?: string }>;
}

/** Safety net used until the formjson fetch resolves, and if it ever fails — keeps the page
 *  usable rather than blocking on a fetch for what is fundamentally 2 fixed document slots. */
const FALLBACK_DUR_DOC_DEFS: Record<DurDocId, DurDocDef> = {
  tiedGrant: {
    shortLabel: 'Tied grant',
    templateLabel: 'Tied Grant Template',
    templateUrl: '',
    allowedFileTypes: ['pdf'],
    maxFileSizeKb: 5120,
  },
  untiedGrant: {
    shortLabel: 'Untied grant',
    templateLabel: 'Untied Grant Template',
    templateUrl: '',
    allowedFileTypes: ['pdf'],
    maxFileSizeKb: 5120,
  },
};
const DUR_DOC_IDS: DurDocId[] = ['tiedGrant', 'untiedGrant'];

type DocumentStatus = 'pending' | 'uploading' | 'processing' | 'passed' | 'failed' | 'error';

interface DurDocument {
  id: DurDocId;
  status: DocumentStatus;
  fileName: string | null;
  sizeKb: number | null;
  fileUrl: string | null;
  localPreviewUrl: string | null;
  versionLabel: string | null;
  version: number | null;
  uploadedAt: Date | null;
  uploadId: string | null;
  ocrProgressStep: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  validationError: string | null;
  manualReviewDecision: { status: 'APPROVED' | 'RETURNED'; note: string | null } | null;
  isManualReviewRequested: boolean;
  manualReviewError: string | null;
  postRejectionAttemptsUsed: number;
  manualReviewRejectionCount: number;
  uploadBlockedUntil: Date | null;
}

function emptyDoc(id: DurDocId): DurDocument {
  return {
    id,
    status: 'pending',
    fileName: null,
    sizeKb: null,
    fileUrl: null,
    localPreviewUrl: null,
    versionLabel: null,
    version: null,
    uploadedAt: null,
    uploadId: null,
    ocrProgressStep: null,
    validationDetails: null,
    failedChecks: [],
    validationError: null,
    manualReviewDecision: null,
    isManualReviewRequested: false,
    manualReviewError: null,
    postRejectionAttemptsUsed: 0,
    manualReviewRejectionCount: 0,
    uploadBlockedUntil: null,
  };
}

// Numeric FORM_STATUS values (src/common/constants/form-status.constants.ts on the backend) in
// which the ULB may still edit — mirrors canUlbEditForm.
const ULB_EDITABLE_STATUS_IDS: ReadonlySet<number> = new Set([1, 2, 4, 6]);
const LOCKED_BANNER_MESSAGE: Readonly<Record<number, string>> = {
  3: 'This form has been submitted to State DMA and is now locked for review.',
  8: 'This form has been approved by your State DMA and is awaiting MoHUA review.',
  5: 'This form has been approved by the state and is now under review by MoHUA.',
  7: 'This form has been acknowledged by MoHUA. No further changes are needed.',
};

const API = `${environment.api.url2}`;
const POLL_INTERVAL_MS = 5000;
const MAX_PDF_PAGES = 1000;
const MAX_MANUAL_REVIEW_ATTEMPTS = 3;
const MANUAL_REVIEW_COOLDOWN_DAYS = 7;
const MANUAL_REVIEW_SUPPORT_EMAIL = '16fc.grant@cityfinance.in';
const PROCESSING_POLL_TIMEOUT_MS = 20 * 60 * 1000;

function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && 'data' in r ? r['data'] : r) as T;
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

@Component({
  selector: 'app-dur',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    DocumentActionRowComponent,
  ],
  templateUrl: './dur.component.html',
  styleUrls: ['./dur.component.scss', '../upload-documents/upload-documents.component.scss'],
})
export class DurComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissions = inject(AuthPermissionService);
  private readonly utilityService = inject(UtilityService);
  private readonly fileService = inject(FileService);

  readonly canUpload = () => this.permissions.canUploadDocuments();
  readonly canSubmit = () => this.permissions.canSubmitToStateDma();

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: DurDocId | null = null;
  private pollingSub: Subscription | null = null;

  readonly isLoadingExisting = signal(true);
  readonly statusError = signal(false);
  readonly documents = signal<DurDocument[]>(DUR_DOC_IDS.map(emptyDoc));
  readonly durId = signal<string | null>(null);
  readonly currentFormStatusId = signal<number>(1);
  readonly currentFormStatusLabel = signal<string>('Not Started');
  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());

  readonly actionGates = signal<readonly ActionGate[]>([]);
  readonly docConfig = signal<Record<DurDocId, DurDocDef>>(FALLBACK_DUR_DOC_DEFS);

  readonly durDocIds = DUR_DOC_IDS;

  docDef(id: DurDocId): DurDocDef {
    return this.docConfig()[id];
  }

  cancel(): void {
    this.router.navigate(['ulb-forms'], { relativeTo: this.route.parent });
  }

  readonly sectionLocked = computed(() => !ULB_EDITABLE_STATUS_IDS.has(this.currentFormStatusId()));
  readonly lockedBannerMessage = computed(
    () => LOCKED_BANNER_MESSAGE[this.currentFormStatusId()] ?? 'This form is currently locked for review.',
  );

  isAwaitingManualReview(doc: DurDocument): boolean {
    return doc.isManualReviewRequested && !doc.manualReviewDecision;
  }

  isEligibleForManualReview(doc: DurDocument): boolean {
    return (doc.version ?? 1) > 1 && doc.status === 'failed';
  }

  isUploadBlocked(doc: DurDocument): boolean {
    return !!doc.uploadBlockedUntil && doc.uploadBlockedUntil.getTime() > Date.now();
  }

  manualReviewAttemptsExhausted(doc: DurDocument): boolean {
    return doc.postRejectionAttemptsUsed >= MAX_MANUAL_REVIEW_ATTEMPTS;
  }

  readonly maxManualReviewAttempts = MAX_MANUAL_REVIEW_ATTEMPTS;
  readonly manualReviewCooldownDays = MANUAL_REVIEW_COOLDOWN_DAYS;
  readonly manualReviewSupportEmail = MANUAL_REVIEW_SUPPORT_EMAIL;

  canRequestManualReview(doc: DurDocument): boolean {
    if (doc.isManualReviewRequested) return false;
    if (this.isUploadBlocked(doc)) return false;
    if (doc.manualReviewDecision?.status === 'RETURNED') {
      return this.manualReviewAttemptsExhausted(doc);
    }
    return this.isEligibleForManualReview(doc);
  }

  private isProcessingTimedOut(doc: DurDocument): boolean {
    return !!doc.uploadedAt && Date.now() - doc.uploadedAt.getTime() > PROCESSING_POLL_TIMEOUT_MS;
  }

  private hasActivePolling(docs: readonly DurDocument[]): boolean {
    return docs.some((d) => d.status === 'processing' && !this.isProcessingTimedOut(d));
  }

  toRuntimeState(doc: DurDocument): DocumentRuntimeState {
    const processingStatusMap: Record<DocumentStatus, DocumentRuntimeState['processingStatus']> = {
      pending: 'NOT_STARTED',
      uploading: 'NOT_STARTED',
      error: 'NOT_STARTED',
      processing: 'PROCESSING',
      passed: 'PASSED',
      failed: 'FAILED',
    };
    return {
      docKey: doc.id,
      required: true,
      hasFile: doc.fileName !== null,
      processingStatus: processingStatusMap[doc.status],
      latestDecision: null,
      isStale: false,
      manualReviewReturned: doc.manualReviewDecision?.status === 'RETURNED',
      isAwaitingManualReview: this.isAwaitingManualReview(doc),
      isEligibleForManualReview: this.isEligibleForManualReview(doc),
      manualReviewAttemptsExhausted: this.manualReviewAttemptsExhausted(doc),
      isUploadBlocked: this.isUploadBlocked(doc),
    };
  }

  onDocAction(event: { action: ResolvedDocumentAction['action']; docKey: string }): void {
    const doc = this.documents().find((d) => d.id === event.docKey);
    if (doc && this.isAwaitingManualReview(doc) && (event.action === 'reupload' || event.action === 'retry')) return;
    if (doc && this.isUploadBlocked(doc) && (event.action === 'reupload' || event.action === 'retry')) return;

    switch (event.action) {
      case 'upload':
      case 'reupload':
        if (!this.canUpload()) return;
        this.triggerUpload(event.docKey as DurDocId);
        return;
      case 'retry':
        if (!this.canUpload()) return;
        void this.retryUpload(event.docKey as DurDocId);
        return;
      default:
        return;
    }
  }

  readonly passedCount = computed(() => this.documents().filter((d) => d.status === 'passed').length);
  readonly totalCount = computed(() => this.documents().length);
  readonly progressPct = computed(() => Math.round((this.passedCount() / this.totalCount()) * 100));
  readonly allPassed = computed(() => this.passedCount() === this.totalCount());
  readonly hasProcessingDocs = computed(() =>
    this.documents().some((d) => d.status === 'processing' || d.status === 'uploading'),
  );
  readonly canConfirmSubmit = computed(() => this.allPassed());

  readonly hasUnsavedUploads = this.hasProcessingDocs;

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadFormConfig(), this.loadActionGates(), this.loadExistingData()]);
  }

  private async loadActionGates(): Promise<void> {
    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API}xvi-fc/dur/action-gates`));
      this.actionGates.set(unwrap<ActionGate[]>(result) ?? []);
    } catch (err) {
      console.error('[dur] failed to load action gates', err);
    }
  }

  /** Fetches document-slot labels/limits/template links from formjson (formId 36). Falls back to
   *  FALLBACK_DUR_DOC_DEFS on failure — this endpoint is a small, low-risk read (2 fixed fields),
   *  so a stale local copy is a better failure mode than blocking the whole upload page. */
  private async loadFormConfig(): Promise<void> {
    const designYearId = this.resolveDesignYearId();
    if (!designYearId) return;

    try {
      const result = await firstValueFrom(
        this.http.get<unknown>(`${API}xvi-fc/dur/form-config?yearId=${designYearId}`),
      );
      const cfg = unwrap<{ data: DurApiFieldConfig[] }>(result);
      const mapped = { ...FALLBACK_DUR_DOC_DEFS };
      for (const field of cfg?.data ?? []) {
        if (field.key !== 'tiedGrant' && field.key !== 'untiedGrant') continue;
        const template = field.supportingContent?.find((s) => s.type === 'template-download');
        mapped[field.key] = {
          shortLabel: field.label,
          templateLabel: template?.label ?? FALLBACK_DUR_DOC_DEFS[field.key].templateLabel,
          templateUrl: template?.url ?? '',
          allowedFileTypes: field.allowedFileTypes ?? FALLBACK_DUR_DOC_DEFS[field.key].allowedFileTypes,
          maxFileSizeKb: field.maxFileSize ?? FALLBACK_DUR_DOC_DEFS[field.key].maxFileSizeKb,
        };
      }
      this.docConfig.set(mapped);
    } catch (err) {
      console.error('[dur] failed to load form config, using fallback defs', err);
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasProcessingDocs()) event.preventDefault();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.documents().forEach((d) => {
      if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
    });
  }

  triggerUpload(docId: DurDocId): void {
    this.pendingDocId = docId;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pendingDocId) return;

    const docId = this.pendingDocId;
    this.pendingDocId = null;
    const existingDoc = this.documents().find((d) => d.id === docId);
    if (existingDoc && this.isAwaitingManualReview(existingDoc)) return;
    if (existingDoc && this.isUploadBlocked(existingDoc)) return;

    const validationMsg = await this.checkFileValidity(file, docId);
    if (validationMsg) {
      this.setDocError(docId, validationMsg);
      return;
    }

    this.documents.update((docs) =>
      docs.map((d) =>
        d.id === docId
          ? {
              ...emptyDoc(docId),
              status: 'uploading',
              fileName: file.name,
              manualReviewDecision: d.manualReviewDecision,
              postRejectionAttemptsUsed: d.postRejectionAttemptsUsed,
              manualReviewRejectionCount: d.manualReviewRejectionCount,
              uploadBlockedUntil: d.uploadBlockedUntil,
            }
          : d,
      ),
    );

    try {
      const ulbId = this.resolveUlbId();
      const stateId = this.resolveStateId();
      const designYearId = this.resolveDesignYearId();
      const financialYear = this.resolveFinancialYear();
      if (!ulbId || !stateId || !designYearId) throw new Error('Missing ulbId, stateId or designYearId');

      const uploadId = crypto.randomUUID();
      const folder = `xvi-fc/dur/${ulbId}/${designYearId}/${docId}`;
      const [presignData] = await firstValueFrom(
        this.fileService.getSignedUrls([
          { fileName: file.name, folder, mimeType: 'application/pdf', uploadId, expiresIn: 300 },
        ]),
      );
      const presignedUrl = presignData.url;
      const s3Key = presignData.path!;

      const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Response.ok) throw new Error(`S3 upload failed: ${s3Response.status}`);

      const confirmResult = await firstValueFrom(
        this.http.post<unknown>(`${API}xvi-fc/dur/confirm-upload`, {
          uploadId,
          s3Key,
          ulbId,
          stateId,
          designYearId,
          docId,
          financialYear,
          originalName: file.name,
          fileSize: file.size,
        }),
      );

      const upload = unwrap<{
        durId: string;
        uploadId: string;
        version: number;
        versionLabel: string;
        uploadedAt: string;
      }>(confirmResult);
      this.durId.set(upload.durId);

      const localPreviewUrl = URL.createObjectURL(file);

      this.documents.update((docs) =>
        docs.map((d) => {
          if (d.id !== docId) return d;
          if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
          return {
            ...d,
            status: 'processing' as DocumentStatus,
            fileName: file.name,
            sizeKb: Math.round((file.size / 1024) * 10) / 10,
            localPreviewUrl,
            versionLabel: upload.versionLabel,
            version: upload.version,
            uploadId: upload.uploadId,
            uploadedAt: new Date(upload.uploadedAt),
            ocrProgressStep: null,
            validationDetails: null,
            failedChecks: [],
          };
        }),
      );

      this.startPolling();
    } catch (err) {
      console.error('[dur-upload] failed', err);
      this.setDocError(docId);
    }
  }

  async retryUpload(docId: DurDocId): Promise<void> {
    const doc = this.documents().find((d) => d.id === docId);
    if (!doc?.uploadId || !this.durId()) return;
    if (this.isAwaitingManualReview(doc)) return;
    if (this.isUploadBlocked(doc)) return;

    this.documents.update((docs) =>
      docs.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'processing',
              uploadedAt: new Date(),
              ocrProgressStep: null,
              validationDetails: null,
              failedChecks: [],
              isManualReviewRequested: false,
              manualReviewError: null,
            }
          : d,
      ),
    );

    try {
      await firstValueFrom(this.http.post(`${API}xvi-fc/dur/${this.durId()}/documents/${docId}/retry`, {}));
      this.startPolling();
    } catch (err) {
      console.error('[dur-retry] failed', err);
      this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, status: 'failed' } : d)));
    }
  }

  async requestManualReview(docId: DurDocId): Promise<void> {
    const durId = this.durId();
    if (!durId) return;

    const data: UlbFormsDialogData = {
      title: 'Request manual review?',
      icon: { name: 'support_agent', color: '#1976d2' },
      description:
        "Our team will verify this document manually and get back to you. Please expect a reply within 48 hours (weekends excluded). You'll receive an email notification too.",
      buttons: [
        { label: 'Cancel', result: 'cancel', variant: 'stroked' },
        { label: 'Request Manual Review', result: 'request', variant: 'flat' },
      ],
    };

    const result = await firstValueFrom(
      this.dialog
        .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(UlbFormsDialogComponent, {
          data,
          disableClose: true,
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: ULB_FORMS_DIALOG_PANEL_CLASS,
        })
        .afterClosed(),
    );
    if (result !== 'request') return;

    this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, manualReviewError: null } : d)));

    try {
      await firstValueFrom(
        this.http.post(
          `${API}xvi-fc/dur/${durId}/documents/${docId}/manual-review`,
          {},
          { context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true) },
        ),
      );
      this.documents.update((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, isManualReviewRequested: true, manualReviewDecision: null } : d)),
      );
    } catch (err) {
      console.error('[dur-manual-review] request failed', err);
      const message =
        err instanceof HttpErrorResponse && typeof err.error?.message === 'string'
          ? err.error.message
          : 'Failed to request manual review. Please try again.';
      this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, manualReviewError: message } : d)));
    }
  }

  previewFile(doc: DurDocument): void {
    const url = doc.localPreviewUrl ?? doc.fileUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  async submitToState(): Promise<void> {
    const durId = this.durId();
    if (!durId || !this.canConfirmSubmit()) return;

    const confirmData: UlbFormsDialogData = {
      title: 'Submit to State DMA?',
      description:
        "You're about to send this DUR form to the State DMA for review. Once submitted, it cannot be revised until the State DMA sends it back for corrections.",
      buttons: [
        { label: 'Cancel', result: 'cancel', variant: 'stroked' },
        { label: 'Submit to State DMA', result: 'submit', variant: 'flat' },
      ],
    };

    const result = await firstValueFrom(
      this.dialog
        .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(UlbFormsDialogComponent, {
          data: confirmData,
          disableClose: true,
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: ULB_FORMS_DIALOG_PANEL_CLASS,
        })
        .afterClosed(),
    );
    if (result !== 'submit') return;

    try {
      await firstValueFrom(this.http.post(`${API}xvi-fc/dur/${durId}/submit`, {}));
      await this.loadExistingData();
    } catch (err) {
      console.error('[dur-submit] failed', err);
      this.utilityService.triggerSnackbar('Unable to submit the DUR form. Please try again.', 'snackbar-danger');
    }
  }

  formatFileSize(sizeKb: number | null): string {
    if (sizeKb === null || sizeKb === undefined) return '';
    if (sizeKb < 1024) return `${sizeKb.toFixed(0)} KB`;
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async loadExistingData(): Promise<void> {
    const ulbId = this.resolveUlbId();
    const designYearId = this.resolveDesignYearId();
    if (!ulbId || !designYearId) {
      this.isLoadingExisting.set(false);
      return;
    }

    try {
      const result = await firstValueFrom(this.http.get<unknown>(`${API}xvi-fc/dur/by-ulb/${ulbId}/${designYearId}`));
      const status = unwrap<{
        id: string;
        currentFormStatus: number;
        currentFormStatusLabel: string;
        documents: Array<{
          docId: DurDocId;
          processingStatus: 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';
          currentUpload: {
            uploadId: string;
            version: number;
            versionLabel: string;
            file: { originalName: string; sizeKb: number; fileUrl?: string | null };
            ocrInfo: {
              progressStep: string | null;
              validationDetails: string | null;
              failedChecks: string[];
              isManualReviewRequested: boolean;
            };
            uploadedAt: string;
          } | null;
          manualReviewDecision: { status: 'APPROVED' | 'RETURNED'; note: string | null } | null;
          postRejectionAttemptsUsed: number;
          manualReviewRejectionCount: number;
          uploadBlockedUntil: string | null;
        }>;
      } | null>(result);

      if (!status) return;

      this.durId.set(status.id);
      this.currentFormStatusId.set(status.currentFormStatus);
      this.currentFormStatusLabel.set(status.currentFormStatusLabel);

      this.documents.update((docs) =>
        docs.map((doc) => {
          const saved = status.documents.find((d) => d.docId === doc.id);
          if (!saved?.currentUpload) return doc;
          const cu = saved.currentUpload;
          return {
            ...doc,
            status: this.backendStatusToLocal(saved.processingStatus),
            fileName: cu.file.originalName,
            sizeKb: cu.file.sizeKb,
            fileUrl: cu.file.fileUrl ?? null,
            versionLabel: cu.versionLabel,
            version: cu.version,
            uploadId: cu.uploadId,
            uploadedAt: new Date(cu.uploadedAt),
            ocrProgressStep: cu.ocrInfo?.progressStep ?? null,
            validationDetails: cu.ocrInfo?.validationDetails ?? null,
            failedChecks: cu.ocrInfo?.failedChecks ?? [],
            isManualReviewRequested: cu.ocrInfo?.isManualReviewRequested ?? false,
            manualReviewDecision: saved.manualReviewDecision,
            postRejectionAttemptsUsed: saved.postRejectionAttemptsUsed ?? 0,
            manualReviewRejectionCount: saved.manualReviewRejectionCount ?? 0,
            uploadBlockedUntil: saved.uploadBlockedUntil ? new Date(saved.uploadBlockedUntil) : null,
          };
        }),
      );

      this.statusError.set(false);
      if (this.hasActivePolling(this.documents())) this.startPolling();
    } catch (err: unknown) {
      if ((err as { status?: number })?.status !== 404) {
        console.error('[dur-load] failed to load existing data', err);
        this.statusError.set(true);
      }
    } finally {
      this.isLoadingExisting.set(false);
    }
  }

  async retryLoadStatus(): Promise<void> {
    this.statusError.set(false);
    this.isLoadingExisting.set(true);
    await this.loadExistingData();
  }

  private startPolling(): void {
    if (this.pollingSub && !this.pollingSub.closed) return;
    const durId = this.durId();
    if (!durId) return;

    this.pollingSub = interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => {
          if (!this.hasActivePolling(this.documents())) {
            this.stopPolling();
            return EMPTY;
          }
          return this.http.get<unknown>(`${API}xvi-fc/dur/${durId}/status`).pipe(
            catchError((err) => {
              console.error('[dur-poll] status check failed', err);
              this.statusError.set(true);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.statusError.set(false);
          const status = unwrap<{
            documents: Array<{
              docId: DurDocId;
              processingStatus: string;
              currentUpload: {
                uploadId: string;
                ocrInfo: {
                  progressStep: string | null;
                  validationDetails: string | null;
                  failedChecks: string[];
                  isManualReviewRequested: boolean;
                };
              } | null;
              manualReviewDecision: { status: 'APPROVED' | 'RETURNED'; note: string | null } | null;
              postRejectionAttemptsUsed: number;
              manualReviewRejectionCount: number;
              uploadBlockedUntil: string | null;
            }>;
          }>(result);
          if (!status?.documents) return;

          this.documents.update((docs) =>
            docs.map((doc) => {
              if (doc.status !== 'processing') return doc;
              const remote = status.documents.find((d) => d.docId === doc.id);
              if (!remote?.currentUpload || remote.currentUpload.uploadId !== doc.uploadId) return doc;

              const newStatus = this.backendStatusToLocal(
                remote.processingStatus as 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED',
              );
              const newUploadBlockedUntil = remote.uploadBlockedUntil ? new Date(remote.uploadBlockedUntil) : null;

              const unchanged =
                newStatus === doc.status &&
                (remote.currentUpload.ocrInfo?.progressStep ?? null) === doc.ocrProgressStep &&
                (remote.currentUpload.ocrInfo?.validationDetails ?? null) === doc.validationDetails &&
                (remote.currentUpload.ocrInfo?.isManualReviewRequested ?? false) === doc.isManualReviewRequested &&
                (remote.postRejectionAttemptsUsed ?? 0) === doc.postRejectionAttemptsUsed &&
                (remote.manualReviewRejectionCount ?? 0) === doc.manualReviewRejectionCount &&
                newUploadBlockedUntil?.getTime() === doc.uploadBlockedUntil?.getTime() &&
                remote.manualReviewDecision?.status === doc.manualReviewDecision?.status;
              if (unchanged) return doc;

              return {
                ...doc,
                status: newStatus,
                ocrProgressStep: remote.currentUpload.ocrInfo?.progressStep ?? null,
                validationDetails: remote.currentUpload.ocrInfo?.validationDetails ?? null,
                failedChecks: remote.currentUpload.ocrInfo?.failedChecks ?? [],
                isManualReviewRequested: remote.currentUpload.ocrInfo?.isManualReviewRequested ?? false,
                manualReviewDecision: remote.manualReviewDecision,
                postRejectionAttemptsUsed: remote.postRejectionAttemptsUsed ?? 0,
                manualReviewRejectionCount: remote.manualReviewRejectionCount ?? 0,
                uploadBlockedUntil: newUploadBlockedUntil,
              };
            }),
          );

          if (!this.hasActivePolling(this.documents())) this.stopPolling();
        },
        error: (err) => {
          console.error('[dur-poll] status check failed', err);
          this.statusError.set(true);
        },
      });
  }

  private stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
  }

  private backendStatusToLocal(ps: 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED'): DocumentStatus {
    if (ps === 'PASSED') return 'passed';
    if (ps === 'FAILED') return 'failed';
    if (ps === 'PROCESSING') return 'processing';
    return 'pending';
  }

  private setDocError(docId: DurDocId, message: string | null = null): void {
    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...d, status: 'error', fileName: null, validationError: message } : d)),
    );
  }

  private async checkFileValidity(file: File, docId: DurDocId): Promise<string | null> {
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) return 'Please upload a PDF file only.';

    if (file.size === 0) return 'The selected file is empty. Please upload a valid file.';

    const maxFileSizeKb = this.docDef(docId).maxFileSizeKb;
    const maxFileSizeMb = maxFileSizeKb / 1024;
    const maxBytes = maxFileSizeKb * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxFileSizeMb} MB. Please compress or split the file and try again.`;
    }

    try {
      const headerBuf = await file.slice(0, 5).arrayBuffer();
      const h = new Uint8Array(headerBuf);
      if (!(h[0] === 0x25 && h[1] === 0x50 && h[2] === 0x44 && h[3] === 0x46 && h[4] === 0x2d)) {
        return 'Please upload a PDF file only.';
      }
    } catch {
      /* ignore — pdf.js will reject a corrupt file */
    }

    const result = await checkPdfHasContent(file);
    if (result.fatalError === 'password')
      return 'This PDF is password-protected. Please remove the password and try again.';
    if (result.fatalError === 'invalid') return 'This PDF is corrupted or unreadable. Please upload a valid PDF file.';
    if (result.pageCount === 0) return 'This PDF has no pages. Please upload a valid document.';
    if (!result.hasContent) return 'This PDF appears to be blank. Please upload a document with content.';

    const maxPagesError = getMaxPageCountError(result.pageCount, MAX_PDF_PAGES);
    if (maxPagesError) return maxPagesError;

    return null;
  }

  private resolveDesignYearId(): string | null {
    let current: ActivatedRoute | null = this.route;
    while (current) {
      const yearId = current.snapshot.paramMap.get('yearId');
      if (yearId) return yearId;
      current = current.parent;
    }
    return localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
  }

  /** DUR reports on FY 2025-26 — the final year of the 15th FC award — regardless of which
   *  16th-FC design year (e.g. 2026-27) is currently selected in the portal. Deriving this from
   *  the selected-year localStorage key was the bug: it sent the wrong "expected" year to the
   *  validation API, which correctly extracted '2025-26' from the document and reported a
   *  financial_year_mismatch against our (wrong) '2026-27'. */
  private resolveFinancialYear(): string {
    return '2025-26';
  }

  private resolveUlbId(): string | null {
    let current: ActivatedRoute | null = this.route;
    while (current) {
      const entityId = current.snapshot.paramMap.get('entityId');
      if (entityId) return entityId;
      current = current.parent;
    }
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      return (JSON.parse(raw) as { ulb?: string }).ulb ?? null;
    } catch {
      return null;
    }
  }

  private resolveStateId(): string | null {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      return (JSON.parse(raw) as { state?: string }).state ?? null;
    } catch {
      return null;
    }
  }

  private loadUlbDetails(): UlbDetails | null {
    try {
      const raw = localStorage.getItem('xvifc_ulb_details');
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<UlbDetails>;
      if (!parsed.ulbName || !parsed.stateName || !parsed.selectedYear) return null;
      return { ulbName: parsed.ulbName, stateName: parsed.stateName, selectedYear: parsed.selectedYear };
    } catch {
      return null;
    }
  }
}
