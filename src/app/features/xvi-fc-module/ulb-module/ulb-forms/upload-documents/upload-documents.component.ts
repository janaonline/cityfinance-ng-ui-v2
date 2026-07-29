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
import { UploadDocumentsService } from './upload-documents.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subscription, firstValueFrom, interval, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
import { PageErrorStateComponent } from '../../../shared/page-error-state/page-error-state.component';
import {
  UlbFormsDialogComponent,
  ULB_FORMS_DIALOG_PANEL_CLASS,
  type UlbFormsDialogData,
} from './ulb-forms-dialog.component';

// ─── Public model types (used in template + guard) ───────────────────────────

export interface UploadDocumentDef {
  id: string;
  title: string;
  subtitle: string;
  allowedFileTypes: string[];
  maxFileSize: number;  // MB
  minPages?: number;
}

export interface UploadPageConfig {
  type: 'audited' | 'provisional';
  description: string;
  confirmLabel: string;
  documentYearId: string;
  documentYear: string;
  documents: ReadonlyArray<UploadDocumentDef>;
}

// ─── Internal types ───────────────────────────────────────────────────────────

// uploading → multipart POST in-flight
// processing → backend received file, OCR running
// passed → OCR PASSED
// failed → OCR FAILED (with validation details)
// error → network/validation error during upload
type DocumentStatus = 'pending' | 'uploading' | 'processing' | 'passed' | 'failed' | 'error';

interface UploadDocument extends UploadDocumentDef {
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number | null;
  sizeKb: number | null;
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
  // Client-side only — true once this doc's OCR has failed and the ULB has retried at least
  // once this session. Gates the "Request Manual Review" button; resets on reload.
  hasRetried: boolean;
  isManualReviewRequested: boolean;
  manualReviewError: string | null;
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
interface BackendDecision {
  status: 'APPROVED' | 'RETURNED';
  note: string | null;
  decidedAt: string;
}

// Shape returned by GET /xvi-fc/annual-account/:id/status (and by-ulb lookup)
interface BackendStatusDoc {
  docId: string;
  uploadStatus: string;
  processingStatus: 'NOT_STARTED' | 'PROCESSING' | 'PASSED' | 'FAILED';
  currentUpload: {
    uploadId: string;
    version: number;
    versionLabel: string;
    file: { originalName: string; mimeType: string; pageCount: number; sizeKb: number };
    ocrInfo: BackendOcrInfo;
    userInfo: { userId: string; role: string } | null;
    uploadedAt: string;
  } | null;
  // Every state decision recorded against this document, oldest first — last entry is current.
  stateDecision: BackendDecision[];
}

type AnnualAccountFormStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW_BY_STATE'
  | 'RETURNED_BY_STATE'
  | 'UNDER_REVIEW_BY_MOHUA'
  | 'RETURNED_BY_MOHUA'
  | 'SUBMISSION_ACKNOWLEDGED_BY_MOHUA';

// Statuses in which the ULB may still upload/edit/submit — mirrors the backend's canUlbEditForm allow-list.
const ULB_EDITABLE_STATUSES: ReadonlySet<AnnualAccountFormStatus> = new Set([
  'NOT_STARTED',
  'IN_PROGRESS',
  'RETURNED_BY_STATE',
  'RETURNED_BY_MOHUA',
]);

const LOCKED_BANNER_MESSAGE: Readonly<Partial<Record<AnnualAccountFormStatus, string>>> = {
  UNDER_REVIEW_BY_STATE: 'This section has been submitted to State DMA and is now locked for review.',
  UNDER_REVIEW_BY_MOHUA: 'This section has been approved by the state and is now under review by MoHUA.',
  SUBMISSION_ACKNOWLEDGED_BY_MOHUA: 'This section has been approved by MoHUA. No further changes are needed.',
};

interface BackendStatusSection {
  form_status: AnnualAccountFormStatus;
  yearId: string;
  year: string;
  documents: BackendStatusDoc[];
  stateDecision: BackendDecision | null;
  mohuaDecision: BackendDecision | null;
}

interface BackendStatusResponse {
  annualAccountId: string;
  auditedData: BackendStatusSection | null;
  unauditedData: BackendStatusSection | null;
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
    hasRetried: false,
    isManualReviewRequested: false,
    manualReviewError: null,
  };
}

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatTooltipModule, PageErrorStateComponent],
  templateUrl: './upload-documents.component.html',
  styleUrl: './upload-documents.component.scss',
})
export class UploadDocumentsComponent implements OnInit, OnDestroy {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissions = inject(AuthPermissionService);
  private readonly uploadDocumentsService = inject(UploadDocumentsService);

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

  readonly passedCount = computed(() => this.documents().filter((d) => d.status === 'passed').length);
  readonly totalCount = computed(() => this.config()?.documents.length ?? 0);
  readonly progressPct = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.passedCount() / total) * 100);
  });
  /** A returned document stays blocking even after OCR passes again — it must be resolved (re-decided or re-uploaded) first. */
  readonly hasReturnedDocs = computed(() => this.documents().some((d) => d.latestDecision?.status === 'RETURNED'));

  readonly allPassed = computed(() => {
    const total = this.totalCount();
    return total > 0 && this.passedCount() === total && !this.hasReturnedDocs();
  });
  readonly hasProcessingDocs = computed(() =>
    this.documents().some((d) => d.status === 'processing' || d.status === 'uploading'),
  );

  private static readonly SUPPORT_EMAIL = '16fcgrant@cityfinance.in';

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

  goBack(): void {
    this.location.back();
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

      // Step 1 — Get presigned PUT URL from generic S3 endpoint
      const uploadId = crypto.randomUUID();
      const folder = `xvi-fc/annual-accounts/${ulbId}/${designYearId}/${section}/${docId}`;
      const presignResult = await firstValueFrom(
        this.http.post<unknown>(`${API}s3/signed-url`, [
          { fileName: file.name, folder, mimeType: 'application/pdf', uploadId, expiresIn: 300 },
        ]),
      );
      const [presignData] = unwrap<Array<{ url: string; path: string }>>(presignResult);
      const presignedUrl = presignData.url;
      const s3Key = presignData.path;

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
          uploadId, s3Key, ulbId, stateId, designYearId, section, docId, yearId, year,
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
              hasRetried: true,
              isManualReviewRequested: false,
              manualReviewError: null,
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
        this.http.post(`${API}xvi-fc/annual-account/${accountId}/documents/${docId}/manual-review?section=${section}`, {}),
      );
      this.documents.update((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, isManualReviewRequested: true } : d)),
      );
    } catch (err) {
      console.error('[manual-review] request failed', err);
      this.documents.update((docs) =>
        docs.map((d) =>
          d.id === docId ? { ...d, manualReviewError: 'Failed to request manual review. Please try again.' } : d,
        ),
      );
    }
  }

  async previewFile(doc: UploadDocument): Promise<void> {
    if (doc.localPreviewUrl) {
      window.open(doc.localPreviewUrl, '_blank', 'noopener');
      return;
    }
    if (!doc.uploadId || !this.annualAccountId()) return;
    try {
      const result = await firstValueFrom(
        this.http.get<unknown>(
          `${API}xvi-fc/annual-account/${this.annualAccountId()}/documents/${doc.uploadId}/signed-url`,
        ),
      );
      window.open(unwrap<{ url: string }>(result).url, '_blank', 'noopener');
    } catch (err) {
      console.error('[preview] failed to get signed URL', err);
    }
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
      this.router.navigate(['../ulb-forms'], { relativeTo: this.route });
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
      const result = await firstValueFrom(
        this.http.get<unknown>(`${API}xvi-fc/annual-account/by-ulb/${ulbId}/${designYearId}`),
      );

      const statusData = unwrap<BackendStatusResponse | null>(result);
      if (!statusData) return;

      this.annualAccountId.set(statusData.annualAccountId?.toString() ?? null);

      const section = this.config()!.type === 'audited' ? statusData.auditedData : statusData.unauditedData;
      this.sectionStatus.set(section?.form_status ?? null);
      this.sectionReturnNote.set(
        (section?.form_status === 'RETURNED_BY_STATE'
          ? section.stateDecision?.note
          : section?.form_status === 'RETURNED_BY_MOHUA'
            ? section.mohuaDecision?.note
            : null) ?? null,
      );
      if (!section?.documents?.length) return;

      this.documents.update((docs) =>
        docs.map((doc) => {
          const saved = section.documents.find((d) => d.docId === doc.id);
          if (!saved) return doc;

          const rawLatestDecision = saved.stateDecision.length
            ? saved.stateDecision[saved.stateDecision.length - 1]
            : null;

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

          return {
            ...doc,
            status,
            fileName: cu.file.originalName,
            fileSize: null,
            sizeKb: cu.file.sizeKb,
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
            latestDecision,
          };
        }),
      );

      // Start polling if any doc is still processing
      if (this.documents().some((d) => d.status === 'processing')) {
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

    this.pollingSub = interval(POLL_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          this.documents().some((d) => d.status === 'processing')
            ? this.http.get<unknown>(`${API}xvi-fc/annual-account/${accountId}/status`)
            : EMPTY,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          const payload = unwrap<BackendStatusResponse>(result);
          const section = this.config()!.type === 'audited' ? payload.auditedData : payload.unauditedData;
          if (!section?.documents) return;

          this.documents.update((docs) =>
            docs.map((doc) => {
              if (doc.status !== 'processing') return doc;

              const remote = section.documents.find((d) => d.docId === doc.id);
              // Guard: must match the specific uploadId being tracked
              if (!remote?.currentUpload || remote.currentUpload.uploadId !== doc.uploadId) return doc;

              const newStatus = this.backendStatusToLocal(remote.processingStatus);
              if (newStatus === doc.status) return doc;

              return {
                ...doc,
                status: newStatus,
                ocrProgressStep: remote.currentUpload.ocrInfo?.progressStep ?? null,
                validationStatus: remote.currentUpload.ocrInfo.validationStatus ?? null,
                validationDetails: remote.currentUpload.ocrInfo.validationDetails ?? null,
                failedChecks: remote.currentUpload.ocrInfo.failedChecks ?? [],
                isManualReviewRequested: remote.currentUpload.ocrInfo.isManualReviewRequested ?? false,
              };
            }),
          );

          if (!this.documents().some((d) => d.status === 'processing')) {
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
    } catch { /* ignore — pdf.js will reject a corrupt file */ }

    // Render-based blank detection via pdf.js.
    // Rendering at low resolution and checking pixel brightness is the only reliable approach
    // for detecting blank scanned pages (raw byte heuristics cannot distinguish them).
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (pdf.numPages === 0) return 'This PDF has no pages. Please upload a valid document.';

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.15 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let nonWhite = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 240 || data[i + 1] < 240 || data[i + 2] < 240) nonWhite++;
      }
      if (nonWhite / (canvas.width * canvas.height) < 0.005) {
        return 'This PDF appears to be blank. Please upload a document with content.';
      }

      // Min page count — driven by API config (e.g. Auditor's Report requires >= 2 pages)
      if (doc.minPages && pdf.numPages < doc.minPages) {
        return `This document must contain at least ${doc.minPages} page${doc.minPages > 1 ? 's' : ''}.`;
      }
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name;
      if (name === 'PasswordException') {
        return 'This PDF is password-protected. Please remove the password and try again.';
      }
      if (name === 'InvalidPDFException') {
        return 'This PDF is corrupted or unreadable. Please upload a valid PDF file.';
      }
      console.warn('[pdf-check] render check skipped:', err);
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
