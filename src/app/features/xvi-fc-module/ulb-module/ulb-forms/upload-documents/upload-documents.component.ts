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
import { UploadDocumentsService } from './upload-documents.service';
import { FileService } from '../../../../../shared/dynamic-form/components/file/file.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subscription, catchError, firstValueFrom, interval, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import { PageErrorStateComponent } from '../../../shared/page-error-state/page-error-state.component';
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
} from './ulb-forms-dialog.component';
import { checkPdfHasContent } from '../../../../../shared/dynamic-form/utils/pdf-blank-check.util';

// ─── Public model types (used in template + guard) ───────────────────────────

export interface UploadDocumentDef {
  id: string;
  title: string;
  subtitle: string;
  /** false → optional document; does not block submission and shows no required asterisk. */
  required: boolean;
  allowedFileTypes: string[];
  maxFileSize: number; // MB
  minPages?: number;
}

export interface UploadPageConfig {
  type: 'audited' | 'provisional';
  description: string;
  confirmLabel: string;
  documentYearId: string;
  documentYear: string;
  actionGates: ReadonlyArray<ActionGate>;
  documents: ReadonlyArray<UploadDocumentDef>;
}

// ─── Internal types ───────────────────────────────────────────────────────────

// uploading → multipart POST in-flight
// processing → backend received file, OCR running
// passed → OCR PASSED
// failed → OCR FAILED (with validation details)
// error → network/validation error during upload
type DocumentStatus = 'pending' | 'uploading' | 'processing' | 'passed' | 'failed' | 'error';

export interface UploadDocument extends UploadDocumentDef {
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number | null;
  sizeKb: number | null;
  /** Short-lived signed download URL for the uploaded file, from the backend — null until loaded. */
  fileUrl: string | null;
  localPreviewUrl: string | null;
  pageCount: number | null;
  mimeType: string | null;
  versionLabel: string | null;
  uploadedAt: Date | null;
  uploaderUserId: string | null;
  uploaderRole: string | null;
  uploadId: string | null;
  ocrProgressStep: string | null;
  validationStatus: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  validationError: string | null;
  // Most recent state decision against this specific document — null if never decided.
  latestDecision: BackendDecision | null;
  // ADMIN's verdict on a manual-review request for this document — null if never requested/decided.
  manualReviewDecision: BackendDecision | null;
  // How many times the ULB has retried OCR on this exact uploaded file — persisted server-side,
  // so it survives a reload. Gates the "Request Manual Review" button (retried at least once).
  retryValidationCount: number;
  // When the most recent retry was kicked off — null if never retried. Used (falling back to
  // uploadedAt) as the reference point for the stuck-processing poll timeout.
  retryValidationAt: Date | null;
  isManualReviewRequested: boolean;
  manualReviewError: string | null;
  /** True once a PROCESSING document has been stuck long enough to offer Retry/Re-upload. */
  isStale: boolean;
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

// Shape of ocrInfo inside currentUpload from backend status API
interface BackendOcrInfo {
  jobId: string | null;
  status: string | null;
  progressStep: string | null;
  validationStatus: string | null;
  validationDetails: string | null;
  failedChecks: string[];
  isManualReviewRequested: boolean;
}

// A state/MoHUA approve-or-return call, as recorded on the backend.
export interface BackendDecision {
  status: 'APPROVED' | 'RETURNED';
  note: string | null;
  decidedAt: string;
}

// Shape returned by GET /xvi-fc/annual-account/:id/status (and by-ulb lookup)
interface BackendStatusDoc {
  docId: string;
  uploadStatus: string;
  processingStatus: 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';
  /** True once a PROCESSING document has been stuck long enough to offer Retry/Re-upload. */
  isStale: boolean;
  currentUpload: {
    uploadId: string;
    version: number;
    versionLabel: string;
    file: { originalName: string; mimeType: string; pageCount: number; sizeKb: number; fileUrl: string | null };
    ocrInfo: BackendOcrInfo;
    userInfo: { userId: string; role: string } | null;
    uploadedAt: string;
    /** How many times the ULB has retried OCR on this exact uploaded file — persisted server-side. */
    retryValidationCount: number;
    /** When the most recent retry was kicked off — null if never retried. */
    retryValidationAt: string | null;
  } | null;
  // STATE's current decision on this document, or null if undecided/undone.
  stateDecision: BackendDecision | null;
  // ADMIN's verdict on a manual-review request for this document, or null if never requested/decided.
  manualReviewDecision: BackendDecision | null;
}

type AnnualAccountFormStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW_BY_STATE'
  | 'RETURNED_BY_STATE'
  | 'UNDER_REVIEW_BY_MOHUA'
  | 'RETURNED_BY_MOHUA'
  | 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA'
  | 'APPROVED_BY_STATE'
  | 'AWAITING_CLAIM_LETTER';

// Statuses in which the ULB may still upload/edit/submit — mirrors the backend's canUlbEditForm allow-list.
const ULB_EDITABLE_STATUSES: ReadonlySet<AnnualAccountFormStatus> = new Set([
  'NOT_STARTED',
  'IN_PROGRESS',
  'RETURNED_BY_STATE',
  'RETURNED_BY_MOHUA',
]);

const LOCKED_BANNER_MESSAGE: Readonly<Partial<Record<AnnualAccountFormStatus, string>>> = {
  UNDER_REVIEW_BY_STATE: 'This section has been submitted to State DMA and is now locked for review.',
  APPROVED_BY_STATE: 'This section has been approved by your State DMA and is now locked.',
  AWAITING_CLAIM_LETTER:
    'This section has been approved by your State DMA and is awaiting claim letter generation before moving to MoHUA.',
  UNDER_REVIEW_BY_MOHUA: 'This section has been approved by the state and is now under review by MoHUA.',
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 'This section has been approved by MoHUA. No further changes are needed.',
};

interface BackendStatusSection {
  form_status: AnnualAccountFormStatus;
  form_status_id: number;
  yearId: string;
  year: string;
  documents: BackendStatusDoc[];
  stateDecision: BackendDecision | null;
  mohuaDecision: BackendDecision | null;
}

interface BackendStatusResponse {
  annualAccountId: string;
  data: BackendStatusSection | null;
}

// Shape returned by POST /confirm-upload
interface UploadResponse {
  annualAccountId: string;
  uploadId: string;
  section: string;
  docId: string;
  version: number;
  versionLabel: string;
  processingStatus: string;
  uploadedAt: string;
}

const API = `${environment.api.url2}`;
const POLL_INTERVAL_MS = 5000;
/** Stop polling a document that's been stuck PROCESSING this long — the backend's cron fallback
 *  will eventually settle it, and a full page reload will pick up the final status. */
const PROCESSING_POLL_TIMEOUT_MS = 20 * 60 * 1000;

// The dev backend may return bare objects instead of { success, data } wrappers.
// This helper extracts the payload from either shape.
function unwrap<T>(response: unknown): T {
  const r = response as Record<string, unknown>;
  return (r && 'data' in r ? r['data'] : r) as T;
}

function emptyDoc(def: UploadDocumentDef): UploadDocument {
  return {
    ...def,
    status: 'pending',
    fileName: null,
    fileSize: null,
    sizeKb: null,
    fileUrl: null,
    localPreviewUrl: null,
    pageCount: null,
    mimeType: null,
    versionLabel: null,
    uploadedAt: null,
    uploaderUserId: null,
    uploaderRole: null,
    uploadId: null,
    ocrProgressStep: null,
    validationStatus: null,
    validationDetails: null,
    failedChecks: [],
    validationError: null,
    latestDecision: null,
    manualReviewDecision: null,
    retryValidationCount: 0,
    retryValidationAt: null,
    isManualReviewRequested: false,
    manualReviewError: null,
    isStale: false,
  };
}

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    PageErrorStateComponent,
    DocumentActionRowComponent,
  ],
  templateUrl: './upload-documents.component.html',
  styleUrl: './upload-documents.component.scss',
})
export class UploadDocumentsComponent implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissions = inject(AuthPermissionService);
  private readonly uploadDocumentsService = inject(UploadDocumentsService);
  private readonly utilityService = inject(UtilityService);
  private readonly fileService = inject(FileService);

  readonly canUpload = () => this.permissions.canUploadDocuments();
  readonly canDelete = () => this.permissions.canDeleteDocuments();
  readonly canConfirm = () => this.permissions.canSubmitToStateDma();

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: string | null = null;
  private pollingSub: Subscription | null = null;

  private readonly uploadType = this.route.snapshot.data['uploadType'] as 'audited' | 'provisional';

  readonly config = signal<UploadPageConfig | null>(null);
  readonly isLoadingConfig = signal(true);
  readonly configError = signal(false);
  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly isLoadingExisting = signal(true);
  readonly documents = signal<UploadDocument[]>([]);

  // annualAccountId is known after first successful upload or on initial load
  readonly annualAccountId = signal<string | null>(null);

  // Current section status as last reported by the backend — null until first load.
  readonly sectionStatus = signal<AnnualAccountFormStatus | null>(null);
  // Numeric form_status_id — what the document-action-row gate is actually keyed on.
  readonly sectionStatusId = signal<number | null>(null);

  /** Action-row gates fetched alongside the upload config — a UI-visibility hint only. */
  readonly actionGates = computed<readonly ActionGate[]>(() => this.config()?.actionGates ?? []);

  // True whenever the section is in any non-editable status (under review or fully acknowledged) —
  // locks all edits for all roles, not just while under state review.
  readonly sectionLocked = computed(() => {
    const status = this.sectionStatus();
    return status !== null && !ULB_EDITABLE_STATUSES.has(status);
  });

  readonly lockedBannerMessage = computed(() => {
    const status = this.sectionStatus();
    return (status && LOCKED_BANNER_MESSAGE[status]) ?? 'This section is currently locked for review.';
  });

  // Note attached to the state/MoHUA decision that most recently returned this section, if any.
  private readonly sectionReturnNote = signal<string | null>(null);

  // Shown when the section was just reopened (RETURNED_BY_STATE/RETURNED_BY_MOHUA) — explains why,
  // even though the section itself is editable again at that point.
  readonly returnNotice = computed(() => {
    const status = this.sectionStatus();
    if (status !== 'RETURNED_BY_STATE' && status !== 'RETURNED_BY_MOHUA') return null;
    const actor = status === 'RETURNED_BY_STATE' ? 'the state' : 'MoHUA';
    const note = this.sectionReturnNote();
    return note ? `Returned by ${actor}: ${note}` : `This section was returned by ${actor} for correction.`;
  });

  /** An individually state-approved document stays locked from re-upload even while the rest of the section is open. */
  isDocLocked(doc: UploadDocument): boolean {
    return doc.latestDecision?.status === 'APPROVED';
  }

  /** True while a manual-review request is outstanding and ADMIN hasn't decided yet — mirrors the
   *  backend's isAwaitingManualReviewDecision guard, which blocks re-upload/retry until then. */
  isAwaitingManualReview(doc: UploadDocument): boolean {
    return doc.isManualReviewRequested && !doc.manualReviewDecision;
  }

  /** True once a PROCESSING document has been stuck long enough that polling it further is
   *  pointless — the backend's cron fallback will settle it eventually. Measured from the most
   *  recent retry if there's been one, since a retry restarts the OCR attempt from scratch —
   *  otherwise a retry on an old upload would look timed-out the instant it's kicked off. */
  private isProcessingTimedOut(doc: UploadDocument): boolean {
    const referenceTime = doc.retryValidationAt ?? doc.uploadedAt;
    return !!referenceTime && Date.now() - referenceTime.getTime() > PROCESSING_POLL_TIMEOUT_MS;
  }

  /** Docs that should keep the polling loop alive — PROCESSING and not yet timed out. */
  private hasActivePolling(docs: readonly UploadDocument[]): boolean {
    return docs.some((d) => d.status === 'processing' && !this.isProcessingTimedOut(d));
  }

  /** Runtime facts the shared action-row component needs to resolve which button(s) to show. */
  toRuntimeState(doc: UploadDocument): DocumentRuntimeState {
    const processingStatusMap: Record<UploadDocument['status'], DocumentRuntimeState['processingStatus']> = {
      pending: 'NOT_STARTED',
      uploading: 'NOT_STARTED',
      error: 'NOT_STARTED',
      processing: 'PROCESSING',
      passed: 'PASSED',
      failed: 'FAILED',
    };
    return {
      docKey: doc.id,
      required: doc.required !== false,
      hasFile: doc.fileName !== null,
      processingStatus: processingStatusMap[doc.status],
      latestDecision: doc.latestDecision ? { status: doc.latestDecision.status } : null,
      isStale: doc.isStale,
      manualReviewReturned: doc.manualReviewDecision?.status === 'RETURNED',
      isAwaitingManualReview: this.isAwaitingManualReview(doc),
    };
  }

  /** Routes the shared action-row component's click event to the existing handlers — the
   *  gate/resolver only decide what to show; permission is re-checked here at the point of action. */
  onDocAction(event: { action: ResolvedDocumentAction['action']; docKey: string }): void {
    const doc = this.documents().find((d) => d.id === event.docKey);
    if (doc && this.isAwaitingManualReview(doc) && (event.action === 'reupload' || event.action === 'retry')) return;

    switch (event.action) {
      case 'upload':
      case 'reupload':
        if (!this.canUpload()) return;
        this.triggerUpload(event.docKey);
        return;
      case 'retry':
        if (!this.canUpload()) return;
        void this.retryUpload(event.docKey);
        return;
      case 'delete':
        if (!this.canDelete()) return;
        void this.removeDocument(event.docKey);
        return;
      default:
        return; // approve/return/undo/*Section are STATE-only — never emitted on this page
    }
  }

  /** Optional documents never gate progress/submission — mirrors the backend's submitSection check. */
  readonly requiredDocuments = computed(() => this.documents().filter((d) => d.required !== false));
  readonly passedCount = computed(() => this.requiredDocuments().filter((d) => d.status === 'passed').length);
  readonly totalCount = computed(() => this.requiredDocuments().length);
  readonly progressPct = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.passedCount() / total) * 100);
  });
  /** A returned document stays blocking even after OCR passes again — it must be resolved (re-decided or re-uploaded) first. */
  readonly hasReturnedDocs = computed(() =>
    this.requiredDocuments().some((d) => d.latestDecision?.status === 'RETURNED'),
  );

  readonly allPassed = computed(() => {
    const total = this.totalCount();
    return total > 0 && this.passedCount() === total && !this.hasReturnedDocs();
  });
  readonly hasProcessingDocs = computed(() =>
    this.documents().some((d) => d.status === 'processing' || d.status === 'uploading'),
  );

  private static readonly SUPPORT_EMAIL = '16fc.grant@cityfinance.in';

  readonly supportMailto = computed(() => {
    const details = this.ulbDetails();
    const cfg = this.config();

    const ulbName = details?.ulbName ?? 'N/A';
    const documentSet = cfg
      ? `${cfg.type === 'audited' ? 'Audited' : 'Provisional'} Financial Statements (FY ${cfg.documentYear})`
      : 'N/A';

    const subject = `Document upload issue – ${ulbName}`;
    const body = [
      `ULB: ${ulbName}`,
      `State: ${details?.stateName ?? 'N/A'}`,
      `Grant year: ${details?.selectedYear ?? 'N/A'}`,
      `Document set: ${documentSet}`,
      '',
      "Please describe the issue you're facing:",
      '',
    ].join('\r\n');

    // encodeURIComponent (not URLSearchParams) — mailto: expects %20 for spaces, not '+'
    return `mailto:${UploadDocumentsComponent.SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  // Used by deactivate guard — warn user if OCR is still running
  readonly hasUnsavedUploads = this.hasProcessingDocs;

  async ngOnInit(): Promise<void> {
    await this.loadConfig();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasProcessingDocs()) {
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.documents().forEach((d) => {
      if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
    });
  }

  async retryLoadConfig(): Promise<void> {
    this.configError.set(false);
    this.isLoadingConfig.set(true);
    await this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    const designYearId = this.resolveDesignYearId();
    if (!designYearId) {
      this.configError.set(true);
      this.isLoadingConfig.set(false);
      return;
    }

    await new Promise<void>((resolve) => {
      this.uploadDocumentsService
        .getUploadConfig(this.uploadType, designYearId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (cfg) => {
            this.config.set(cfg);
            this.documents.set(cfg.documents.map(emptyDoc));
            this.isLoadingConfig.set(false);
            resolve();
          },
          error: () => {
            this.configError.set(true);
            this.isLoadingConfig.set(false);
            resolve();
          },
        });
    });

    if (this.configError()) return;
    await this.loadExistingData();
  }

  triggerUpload(docId: string): void {
    this.pendingDocId = docId;
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.pendingDocId || !this.config()) return;

    const docId = this.pendingDocId;
    this.pendingDocId = null;
    const existingDoc = this.documents().find((d) => d.id === docId);
    if (existingDoc && this.isAwaitingManualReview(existingDoc)) return;
    const docDef = this.config()!.documents.find((d) => d.id === docId)!;

    const validationMsg = await this.checkFileValidity(file, docDef);
    if (validationMsg) {
      this.setDocError(docId, validationMsg);
      return;
    }

    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...emptyDoc(docDef), status: 'uploading', fileName: file.name } : d)),
    );

    try {
      const ulbId = this.resolveUlbId();
      const stateId = this.resolveStateId();
      const designYearId = this.resolveDesignYearId();
      if (!ulbId || !stateId || !designYearId) throw new Error('Missing ulbId, stateId or designYearId');

      const cfg = this.config()!;
      const yearId = cfg.documentYearId;
      const year = cfg.documentYear;
      const section = cfg.type === 'audited' ? 'auditedData' : 'unauditedData';
      const auditType = cfg.type === 'audited' ? 'AUDITED' : 'UNAUDITED';

      // Step 1 — Get presigned PUT URL from generic S3 endpoint
      const uploadId = crypto.randomUUID();
      const folder = `xvi-fc/annual-accounts/${ulbId}/${designYearId}/${section}/${docId}`;
      const [presignData] = await firstValueFrom(
        this.fileService.getSignedUrls([
          { fileName: file.name, folder, mimeType: 'application/pdf', uploadId, expiresIn: 300 },
        ]),
      );
      const presignedUrl = presignData.url;
      const s3Key = presignData.path!;

      // Step 2 — Upload directly to S3 using fetch (bypasses Angular interceptors — auth headers must not reach S3)
      const s3Response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/pdf' },
      });
      if (!s3Response.ok) throw new Error(`S3 upload failed: ${s3Response.status}`);

      // Step 3 — Confirm upload to NestJS (saves metadata + triggers OCR)
      const confirmResult = await firstValueFrom(
        this.http.post<unknown>(`${API}xvi-fc/annual-account/confirm-upload`, {
          uploadId,
          s3Key,
          ulbId,
          stateId,
          designYearId,
          section,
          auditType,
          docId,
          yearId,
          year,
          originalName: file.name,
          fileSize: file.size,
        }),
      );

      const upload = unwrap<UploadResponse>(confirmResult);
      this.annualAccountId.set(upload.annualAccountId);

      const localPreviewUrl = URL.createObjectURL(file);

      this.documents.update((docs) =>
        docs.map((d) => {
          if (d.id !== docId) return d;
          if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
          return {
            ...d,
            status: 'processing' as DocumentStatus,
            fileName: file.name,
            fileSize: file.size,
            sizeKb: Math.round((file.size / 1024) * 10) / 10,
            localPreviewUrl,
            mimeType: file.type,
            versionLabel: upload.versionLabel,
            uploadId: upload.uploadId,
            uploadedAt: new Date(upload.uploadedAt),
            uploaderUserId: this.getLoggedInUserId(),
            uploaderRole: null,
            ocrProgressStep: null,
            validationStatus: null,
            validationDetails: null,
            failedChecks: [],
          };
        }),
      );

      this.startPolling();
    } catch (err) {
      console.error('[upload] failed', err);
      this.setDocError(docId);
    }
  }

  async retryUpload(docId: string): Promise<void> {
    const doc = this.documents().find((d) => d.id === docId);
    if (!doc?.uploadId || !this.annualAccountId()) return;
    if (this.isAwaitingManualReview(doc)) return;

    this.documents.update((docs) =>
      docs.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: 'processing',
              ocrProgressStep: null,
              validationStatus: null,
              validationDetails: null,
              failedChecks: [],
              retryValidationCount: d.retryValidationCount + 1,
              retryValidationAt: new Date(),
              isManualReviewRequested: false,
              manualReviewError: null,
              isStale: false,
            }
          : d,
      ),
    );

    try {
      await firstValueFrom(
        this.http.post(`${API}xvi-fc/annual-account/${this.annualAccountId()}/documents/${doc.uploadId}/retry`, {}),
      );
      this.startPolling();
    } catch (err) {
      console.error('[retry] failed', err);
      this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, status: 'failed' } : d)));
    }
  }

  async requestManualReview(docId: string): Promise<void> {
    const doc = this.documents().find((d) => d.id === docId);
    const accountId = this.annualAccountId();
    if (!doc || !accountId) return;

    const data: UlbFormsDialogData = {
      title: 'Request manual review?',
      icon: { name: 'support_agent', color: '#1976d2' },
      description:
        'This document has failed automated verification. Our team will manually review it instead — this can take longer than the automated checks. You will not be able to request this again for this document until you retry or re-upload it.',
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

    const section = this.config()!.type === 'audited' ? 'auditedData' : 'unauditedData';
    this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, manualReviewError: null } : d)));

    try {
      await firstValueFrom(
        this.http.post(
          `${API}xvi-fc/annual-account/${accountId}/documents/${docId}/manual-review?section=${section}`,
          {},
        ),
      );
      this.documents.update((docs) => docs.map((d) => (d.id === docId ? { ...d, isManualReviewRequested: true } : d)));
    } catch (err) {
      console.error('[manual-review] request failed', err);
      this.documents.update((docs) =>
        docs.map((d) =>
          d.id === docId ? { ...d, manualReviewError: 'Failed to request manual review. Please try again.' } : d,
        ),
      );
    }
  }

  previewFile(doc: UploadDocument): void {
    const url = doc.localPreviewUrl ?? doc.fileUrl;
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  async removeDocument(docId: string): Promise<void> {
    const data: UlbFormsDialogData = {
      title: 'Remove this document?',
      icon: { name: 'warning_amber', color: '#e53935' },
      description:
        'This document has already passed validation. Removing it will clear the current verification result — the system will run the checks again on your replacement file.',
      buttons: [
        { label: 'Cancel', result: 'cancel', variant: 'stroked' },
        { label: 'Remove and re-upload', result: 'remove', variant: 'flat', color: 'warn' },
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

    if (result !== 'remove') return;

    const accountId = this.annualAccountId();
    if (accountId) {
      const section = this.config()!.type === 'audited' ? 'auditedData' : 'unauditedData';
      try {
        await firstValueFrom(
          this.http.delete(`${API}xvi-fc/annual-account/${accountId}/documents/${docId}?section=${section}`),
        );
      } catch (err) {
        console.error('[remove] failed to delete document from server', err);
        this.utilityService.triggerSnackbar('Unable to remove the document. Please try again.', 'snackbar-danger');
        return;
      }
    }

    this.documents.update((docs) =>
      docs.map((d) => {
        if (d.id !== docId) return d;
        if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
        return emptyDoc(this.config()!.documents.find((def) => def.id === docId)!);
      }),
    );
  }

  async confirmDocuments(): Promise<void> {
    const confirmData: UlbFormsDialogData = {
      title: 'Submit to State DMA?',
      description:
        "You're about to send this document set to the State DMA for review. Once submitted, the documents cannot be revised until the State DMA sends back for corrections.",
      declaration: {
        heading: 'Self-declaration by the Executive Officer / Municipal Commissioner of the ULB.',
        body: 'I certify that the uploaded financial statements are true, accurate, and verified by me, and I authorize this information to be made available for public disclosure on the CityFinance website.',
      },
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

    const accountId = this.annualAccountId();
    if (!accountId) return;

    const section = this.config()!.type === 'audited' ? 'auditedData' : 'unauditedData';

    try {
      await firstValueFrom(
        this.http.post(`${API}xvi-fc/annual-account/${accountId}/submit`, { section, selfDeclared: true }),
      );
      // Stay on this page — refresh the section's status/lock state in place instead of
      // navigating back to the conditions overview.
      await this.loadExistingData();
    } catch (err) {
      console.error('[submit] failed to submit section', err);
    }
  }

  uploaderLabel(doc: UploadDocument): string {
    if (!doc.uploaderUserId) return '';
    if (doc.uploaderUserId === this.getLoggedInUserId()) return 'You';
    return doc.uploaderRole ? this.roleLabel(doc.uploaderRole) : 'Another user';
  }

  timeAgo(date: Date | null): string {
    if (!date) return '';
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  }

  formatFileSize(sizeKb: number | null): string {
    if (sizeKb === null || sizeKb === undefined) return '';
    if (sizeKb < 1024) return `${sizeKb.toFixed(0)} KB`;
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  }

  formatCheckLabel(raw: string): string {
    return raw;
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
      const section = this.config()!.type === 'audited' ? 'auditedData' : 'unauditedData';
      const result = await firstValueFrom(
        this.http.get<unknown>(`${API}xvi-fc/annual-account/by-ulb/${ulbId}/${designYearId}?section=${section}`),
      );

      const statusData = unwrap<BackendStatusResponse | null>(result);
      if (!statusData) {
        // No annual-account document exists yet for this ULB/year — same as the
        // backend's own default for a section with no data (NOT_STARTED).
        this.sectionStatusId.set(1);
        return;
      }

      this.annualAccountId.set(statusData.annualAccountId?.toString() ?? null);

      const sectionData = statusData.data;
      this.sectionStatus.set(sectionData?.form_status ?? null);
      this.sectionStatusId.set(sectionData?.form_status_id ?? null);
      this.sectionReturnNote.set(
        (sectionData?.form_status === 'RETURNED_BY_STATE'
          ? sectionData.stateDecision?.note
          : sectionData?.form_status === 'RETURNED_BY_MOHUA'
            ? sectionData.mohuaDecision?.note
            : null) ?? null,
      );
      if (!sectionData?.documents?.length) return;

      // Per-document decisions are provisional and undoable until STATE finalizes the whole
      // section (Approve Section/Return Section) — mask them from the ULB until then, so an
      // in-progress "Returned"/"Approved" verdict that might still get undone never leaks.
      const decisionsVisible = sectionData.form_status !== 'UNDER_REVIEW_BY_STATE';

      this.documents.update((docs) =>
        docs.map((doc) => {
          const saved = sectionData.documents.find((d) => d.docId === doc.id);
          if (!saved) return doc;

          const rawLatestDecision = decisionsVisible ? saved.stateDecision : null;

          if (!saved.currentUpload) return { ...doc, latestDecision: rawLatestDecision };

          const cu = saved.currentUpload;
          const status = this.backendStatusToLocal(saved.processingStatus);

          // A decision only counts against the file it was made on. If this file was
          // (re-)uploaded after that decision, the old APPROVED/RETURNED verdict is stale —
          // treat the document as freshly pending review again until STATE re-decides it.
          const latestDecision =
            rawLatestDecision && new Date(cu.uploadedAt).getTime() > new Date(rawLatestDecision.decidedAt).getTime()
              ? null
              : rawLatestDecision;

          // Same staleness convention for ADMIN's manual-review verdict — a re-upload after the
          // decision supersedes it, even though the backend doesn't clear it on plain retry.
          const manualReviewDecision =
            saved.manualReviewDecision &&
            new Date(cu.uploadedAt).getTime() > new Date(saved.manualReviewDecision.decidedAt).getTime()
              ? null
              : saved.manualReviewDecision;

          return {
            ...doc,
            status,
            fileName: cu.file.originalName,
            fileSize: null,
            sizeKb: cu.file.sizeKb,
            fileUrl: cu.file.fileUrl ?? null,
            localPreviewUrl: null,
            pageCount: cu.file.pageCount,
            mimeType: cu.file.mimeType,
            versionLabel: cu.versionLabel,
            uploadedAt: new Date(cu.uploadedAt),
            uploaderUserId: cu.userInfo?.userId ?? null,
            uploaderRole: cu.userInfo?.role ?? null,
            uploadId: cu.uploadId,
            ocrProgressStep: cu.ocrInfo?.progressStep ?? null,
            validationStatus: cu.ocrInfo.validationStatus ?? null,
            validationDetails: cu.ocrInfo.validationDetails ?? null,
            failedChecks: cu.ocrInfo.failedChecks ?? [],
            isManualReviewRequested: cu.ocrInfo.isManualReviewRequested ?? false,
            retryValidationCount: cu.retryValidationCount ?? 0,
            retryValidationAt: cu.retryValidationAt ? new Date(cu.retryValidationAt) : null,
            isStale: saved.isStale,
            latestDecision,
            manualReviewDecision,
          };
        }),
      );

      // Start polling if any doc is still processing (and hasn't already timed out)
      if (this.hasActivePolling(this.documents())) {
        this.startPolling();
      }
    } catch (err: unknown) {
      if ((err as { status?: number })?.status !== 404) {
        console.error('[load] failed to load existing data', err);
      }
    } finally {
      this.isLoadingExisting.set(false);
    }
  }

  private startPolling(): void {
    if (this.pollingSub && !this.pollingSub.closed) return;

    const accountId = this.annualAccountId();
    if (!accountId) return;

    const section = this.config()!.type === 'audited' ? 'auditedData' : 'unauditedData';

    this.pollingSub = interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() => {
          if (!this.hasActivePolling(this.documents())) {
            // Nothing left worth polling for (either resolved, or timed out) — tear the
            // interval down instead of ticking forever with nothing to do.
            this.stopPolling();
            return EMPTY;
          }
          return this.http.get<unknown>(`${API}xvi-fc/annual-account/${accountId}/status?section=${section}`).pipe(
            // A transient failure here must not kill the outer interval subscription — swallow
            // it and let the next tick retry, rather than leaving documents stuck "processing"
            // until something else happens to call startPolling() again.
            catchError((err) => {
              console.error('[poll] status check failed', err);
              return EMPTY;
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          const payload = unwrap<BackendStatusResponse>(result);
          const sectionData = payload.data;
          if (!sectionData?.documents) return;

          this.documents.update((docs) =>
            docs.map((doc) => {
              if (doc.status !== 'processing') return doc;

              const remote = sectionData.documents.find((d) => d.docId === doc.id);
              // Guard: must match the specific uploadId being tracked
              if (!remote?.currentUpload || remote.currentUpload.uploadId !== doc.uploadId) return doc;

              const newStatus = this.backendStatusToLocal(remote.processingStatus);
              // Re-check even when the status itself hasn't changed — isStale flips to true purely
              // from time passing while still PROCESSING, so a status-only comparison would miss it.
              if (newStatus === doc.status && remote.isStale === doc.isStale) return doc;

              return {
                ...doc,
                status: newStatus,
                ocrProgressStep: remote.currentUpload.ocrInfo?.progressStep ?? null,
                validationStatus: remote.currentUpload.ocrInfo.validationStatus ?? null,
                validationDetails: remote.currentUpload.ocrInfo.validationDetails ?? null,
                failedChecks: remote.currentUpload.ocrInfo.failedChecks ?? [],
                isManualReviewRequested: remote.currentUpload.ocrInfo.isManualReviewRequested ?? false,
                retryValidationCount: remote.currentUpload.retryValidationCount ?? 0,
                retryValidationAt: remote.currentUpload.retryValidationAt
                  ? new Date(remote.currentUpload.retryValidationAt)
                  : null,
                isStale: remote.isStale,
              };
            }),
          );

          if (!this.hasActivePolling(this.documents())) {
            this.stopPolling();
          }
        },
        error: (err) => console.error('[poll] status check failed', err),
      });
  }

  private stopPolling(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
  }

  private backendStatusToLocal(ps: string): DocumentStatus {
    if (ps === 'PASSED') return 'passed';
    if (ps === 'FAILED') return 'failed';
    if (ps === 'PROCESSING') return 'processing';
    return 'pending';
  }

  private setDocError(docId: string, message: string | null = null): void {
    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...d, status: 'error', fileName: null, validationError: message } : d)),
    );
  }

  private async checkFileValidity(file: File, doc: UploadDocumentDef): Promise<string | null> {
    const isPdf = doc.allowedFileTypes.includes('pdf');

    if (isPdf) {
      const isPdfMime = file.type === 'application/pdf';
      const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
      if (!isPdfMime && !isPdfExt) return 'Please upload a PDF file only.';
    }

    if (file.size === 0) return 'The selected file is empty. Please upload a valid file.';

    const maxBytes = doc.maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${doc.maxFileSize} MB. Please compress or split the file and try again.`;
    }

    if (!isPdf) return null;

    // Fast %PDF- header check
    try {
      const headerBuf = await file.slice(0, 5).arrayBuffer();
      const h = new Uint8Array(headerBuf);
      if (!(h[0] === 0x25 && h[1] === 0x50 && h[2] === 0x44 && h[3] === 0x46 && h[4] === 0x2d)) {
        return 'Please upload a PDF file only.';
      }
    } catch {
      /* ignore — pdf.js will reject a corrupt file */
    }

    // Render-based blank detection via pdf.js — see checkPdfHasContent for why failures fail open.
    const result = await checkPdfHasContent(file);
    if (result.fatalError === 'password') {
      return 'This PDF is password-protected. Please remove the password and try again.';
    }
    if (result.fatalError === 'invalid') {
      return 'This PDF is corrupted or unreadable. Please upload a valid PDF file.';
    }
    if (result.pageCount === 0) {
      return 'This PDF has no pages. Please upload a valid document.';
    }
    if (!result.hasContent) {
      return 'This PDF appears to be blank. Please upload a document with content.';
    }

    // Min page count — driven by API config (e.g. Auditor's Report requires >= 2 pages)
    if (doc.minPages && result.pageCount !== null && result.pageCount < doc.minPages) {
      return `This document must contain at least ${doc.minPages} page${doc.minPages > 1 ? 's' : ''}.`;
    }

    return null;
  }

  private resolveDesignYearId(): string | null {
    const stored = localStorage.getItem(XVIFC_LS_KEYS.selectedYearId);
    if (stored) return stored;
    let current: ActivatedRoute | null = this.route;
    while (current) {
      const yearId = current.snapshot.paramMap.get('yearId');
      if (yearId) return yearId;
      current = current.parent;
    }
    return null;
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

  private getLoggedInUserId(): string | null {
    try {
      const raw = localStorage.getItem('userData');
      if (!raw) return null;
      return (JSON.parse(raw) as { _id?: string })._id ?? null;
    } catch {
      return null;
    }
  }

  private roleLabel(role: string): string {
    const map: Record<string, string> = {
      ULB: 'ULB User',
      STATE: 'State User',
    };
    return map[role] ?? role;
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
