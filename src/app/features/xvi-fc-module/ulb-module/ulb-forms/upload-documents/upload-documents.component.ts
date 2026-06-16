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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EMPTY, Subscription, firstValueFrom, interval, switchMap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { XVIFC_LS_KEYS } from '../../../shared/years-selection/years-selection.component';
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
}

export interface UploadPageConfig {
  type: 'audited' | 'provisional';
  description: string;
  confirmLabel: string;
  documents: ReadonlyArray<UploadDocumentDef>;
}

// ─── Testing knobs ────────────────────────────────────────────────────────────
// Change AUDITED_YEAR / PROVISIONAL_YEAR to update UI labels + the `year` param.
// Set TEST_AUDITED_YEAR_ID / TEST_PROVISIONAL_YEAR_ID to override the `yearId`
// param sent to the API (null = use the ID from localStorage / route as normal).
// Revert all four to production values when done testing.
const AUDITED_YEAR              = '2023-24';             // production: '2024-25'
const PROVISIONAL_YEAR          = '2024-25';             // production: '2025-26'
const TEST_AUDITED_YEAR_ID:     string | null = '606aafc14dff55e6c075d3ec'; // 2023-24
const TEST_PROVISIONAL_YEAR_ID: string | null = '606aafcf4dff55e6c075d424'; // 2024-25

export const UPLOAD_CONFIGS: Record<'audited' | 'provisional', UploadPageConfig> = {
  audited: {
    type: 'audited',
    description: `Upload your audited financial statement for FY ${AUDITED_YEAR}. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.`,
    confirmLabel: 'Confirm Audited Documents',
    documents: [
      // { id: 'receipts-payments',          title: 'Receipts and Payments Statement', subtitle: `FY ${AUDITED_YEAR} · PDF only` },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: `FY ${AUDITED_YEAR} · PDF only` },
      { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: `FY ${AUDITED_YEAR} · PDF only` },
      {
        id: 'income-expenditure',
        title: 'Income and Expenditure Statement',
        subtitle: `FY ${AUDITED_YEAR} · PDF only`,
      },
      {
        id: 'income-statement-schedules',
        title: 'Income Statement Schedules',
        subtitle: `FY ${AUDITED_YEAR} · PDF only`,
      },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: `FY ${AUDITED_YEAR} · PDF only` },
      { id: 'auditors-report', title: "Auditor's Report", subtitle: 'PDF only · CA-certified' },
    ],
  },
  provisional: {
    type: 'provisional',
    description: `Upload your provisional financial statement for FY ${PROVISIONAL_YEAR}. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.`,
    confirmLabel: 'Confirm Provisional Documents',
    documents: [
      // { id: 'receipts-payments',          title: 'Receipts and Payments Statement', subtitle: `FY ${PROVISIONAL_YEAR} · PDF only` },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: `FY ${PROVISIONAL_YEAR} · PDF only` },
      {
        id: 'balance-sheet-schedules',
        title: 'Balance Sheet Schedules',
        subtitle: `FY ${PROVISIONAL_YEAR} · PDF only`,
      },
      {
        id: 'income-expenditure',
        title: 'Income and Expenditure Statement',
        subtitle: `FY ${PROVISIONAL_YEAR} · PDF only`,
      },
      {
        id: 'income-statement-schedules',
        title: 'Income Statement Schedules',
        subtitle: `FY ${PROVISIONAL_YEAR} · PDF only`,
      },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: `FY ${PROVISIONAL_YEAR} · PDF only` },
    ],
  },
};

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
    file: { originalName: string; mimeType: string; pages: number; sizeKb: number };
    ocrInfo: BackendOcrInfo;
    userInfo: { userId: string; role: string } | null;
    uploadedAt: string;
  } | null;
}

interface BackendStatusSection {
  form_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW_BY_STATE';
  yearId: string;
  year: string;
  documents: BackendStatusDoc[];
}

interface BackendStatusResponse {
  annualAccountId: string;
  auditedData: BackendStatusSection | null;
  unauditedData: BackendStatusSection | null;
}

// Shape returned by POST /upload
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
  };
}

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './upload-documents.component.html',
  styleUrl: './upload-documents.component.scss',
})
export class UploadDocumentsComponent implements OnInit, OnDestroy {
  private readonly location = inject(Location);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissions = inject(AuthPermissionService);

  readonly canUpload  = () => this.permissions.canUploadDocuments();
  readonly canDelete  = () => this.permissions.canDeleteDocuments();
  readonly canConfirm = () => this.permissions.canSubmitToStateDma();

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: string | null = null;
  private pollingSub: Subscription | null = null;

  readonly config: UploadPageConfig = this.route.snapshot.data['config'] as UploadPageConfig;

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly isLoadingExisting = signal(true);
  readonly documents = signal<UploadDocument[]>(this.config.documents.map(emptyDoc));

  // annualAccountId is known after first successful upload or on initial load
  readonly annualAccountId = signal<string | null>(null);

  // True when this section has been submitted to State DMA — locks all edits for all roles
  readonly sectionLocked = signal(false);

  readonly passedCount = computed(() => this.documents().filter((d) => d.status === 'passed').length);
  readonly totalCount = this.config.documents.length;
  readonly progressPct = computed(() => Math.round((this.passedCount() / this.totalCount) * 100));
  readonly allPassed = computed(() => this.passedCount() === this.totalCount);
  readonly hasProcessingDocs = computed(() =>
    this.documents().some((d) => d.status === 'processing' || d.status === 'uploading'),
  );

  // Used by deactivate guard — warn user if OCR is still running
  readonly hasUnsavedUploads = this.hasProcessingDocs;

  async ngOnInit(): Promise<void> {
    await this.loadExistingData();
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

  triggerUpload(docId: string): void {
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
    const docDef = this.config.documents.find((d) => d.id === docId)!;

    const validationMsg = await this.checkFileValidity(file, docId);
    if (validationMsg) {
      this.setDocError(docId, validationMsg);
      return;
    }

    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...emptyDoc(docDef), status: 'uploading', fileName: file.name } : d)),
    );

    try {
      const ulbId = this.resolveUlbId();
      const designYearId = this.resolveDesignYearId();
      if (!ulbId || !designYearId) throw new Error('Missing ulbId or designYearId');

      const yearId = this.config.type === 'audited' ? TEST_AUDITED_YEAR_ID! : TEST_PROVISIONAL_YEAR_ID!;
      const year   = this.config.type === 'audited' ? AUDITED_YEAR : PROVISIONAL_YEAR;
      const section = this.config.type === 'audited' ? 'auditedData' : 'unauditedData';

      const form = new FormData();
      form.append('file', file, file.name);
      form.append('ulbId', ulbId);
      form.append('designYearId', designYearId);
      form.append('section', section);
      form.append('docId', docId);
      form.append('yearId', yearId);
      form.append('year', year);

      const result = await firstValueFrom(
        this.http.post<{ success: boolean; data: UploadResponse }>(`${API}xvi-fc/annual-account/upload`, form),
      );

      const upload = result.data;
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

  async previewFile(doc: UploadDocument): Promise<void> {
    if (doc.localPreviewUrl) {
      window.open(doc.localPreviewUrl, '_blank', 'noopener');
      return;
    }
    if (!doc.uploadId || !this.annualAccountId()) return;
    try {
      const result = await firstValueFrom(
        this.http.get<{ success: boolean; data: { url: string } }>(
          `${API}xvi-fc/annual-account/${this.annualAccountId()}/documents/${doc.uploadId}/signed-url`,
        ),
      );
      window.open(result.data.url, '_blank', 'noopener');
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
        { label: 'Remove and re-upload', result: 'remove', variant: 'flat', bgColor: '#e53935' },
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

    this.documents.update((docs) =>
      docs.map((d) => {
        if (d.id !== docId) return d;
        if (d.localPreviewUrl) URL.revokeObjectURL(d.localPreviewUrl);
        return emptyDoc(this.config.documents.find((def) => def.id === docId)!);
      }),
    );
  }

  async confirmDocuments(): Promise<void> {
    const rows = this.documents()
      .filter((d) => d.status === 'passed')
      .map((d) => ({
        title: d.title,
        fileName: d.fileName,
        version: d.versionLabel,
        uploaderLabel: this.uploaderLabel(d),
        byTeammate: !!d.uploaderUserId && d.uploaderUserId !== this.getLoggedInUserId(),
      }));

    const confirmData: UlbFormsDialogData = {
      title: 'Review before submitting',
      description:
        'All documents have passed validation. Check that each document is correct before submitting to State DMA.',
      table: rows,
      buttons: [
        { label: 'Go back', result: 'back', variant: 'stroked' },
        { label: 'Submit to State DMA', result: 'submit', variant: 'flat' },
      ],
    };

    const result = await firstValueFrom(
      this.dialog
        .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(UlbFormsDialogComponent, {
          data: confirmData,
          disableClose: true,
          width: '600px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          panelClass: ULB_FORMS_DIALOG_PANEL_CLASS,
        })
        .afterClosed(),
    );

    if (result !== 'submit') return;

    const accountId = this.annualAccountId();
    if (!accountId) return;

    const section = this.config.type === 'audited' ? 'auditedData' : 'unauditedData';

    try {
      await firstValueFrom(
        this.http.post(`${API}xvi-fc/annual-account/${accountId}/submit`, { section }),
      );
      this.location.back();
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

  // Converts a raw failed-check string like "ulb_name_mismatch: expected 'X' extracted 'Y'"
  // into a human-readable label.
  formatCheckLabel(raw: string): string {
    const colonIdx = raw.indexOf(':');
    if (colonIdx === -1) return raw;
    const key = raw.slice(0, colonIdx).trim().replace(/_/g, ' ');
    const detail = raw.slice(colonIdx + 1).trim();
    return `${key.charAt(0).toUpperCase()}${key.slice(1)} — ${detail}`;
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
        this.http.get<{ success: boolean; data: BackendStatusResponse | null }>(
          `${API}xvi-fc/annual-account/by-ulb/${ulbId}/${designYearId}`,
        ),
      );

      const statusData = result.data;
      if (!statusData) return;

      this.annualAccountId.set(statusData.annualAccountId?.toString() ?? null);

      const section = this.config.type === 'audited' ? statusData.auditedData : statusData.unauditedData;
      this.sectionLocked.set(section?.form_status === 'UNDER_REVIEW_BY_STATE');
      if (!section?.documents?.length) return;

      this.documents.update((docs) =>
        docs.map((doc) => {
          const saved = section.documents.find((d) => d.docId === doc.id);
          if (!saved?.currentUpload) return doc;

          const cu = saved.currentUpload;
          const status = this.backendStatusToLocal(saved.processingStatus);

          return {
            ...doc,
            status,
            fileName: cu.file.originalName,
            fileSize: null,
            sizeKb: cu.file.sizeKb,
            localPreviewUrl: null,
            pageCount: cu.file.pages,
            mimeType: cu.file.mimeType,
            versionLabel: cu.versionLabel,
            uploadedAt: new Date(cu.uploadedAt),
            uploaderUserId: cu.userInfo?.userId ?? null,
            uploaderRole: cu.userInfo?.role ?? null,
            uploadId: cu.uploadId,
            ocrProgressStep: cu.ocrInfo.progressStep,
            validationStatus: cu.ocrInfo.validationStatus ?? null,
            validationDetails: cu.ocrInfo.validationDetails ?? null,
            failedChecks: cu.ocrInfo.failedChecks ?? [],
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
            ? this.http.get<{ success: boolean; data: BackendStatusResponse }>(
                `${API}xvi-fc/annual-account/${accountId}/status`,
              )
            : EMPTY,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          const section = this.config.type === 'audited' ? result.data.auditedData : result.data.unauditedData;
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
                ocrProgressStep: remote.currentUpload.ocrInfo.progressStep,
                validationStatus: remote.currentUpload.ocrInfo.validationStatus ?? null,
                validationDetails: remote.currentUpload.ocrInfo.validationDetails ?? null,
                failedChecks: remote.currentUpload.ocrInfo.failedChecks ?? [],
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

  private async checkFileValidity(file: File, docId: string): Promise<string | null> {
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExt) {
      return 'Please upload a PDF file only.';
    }

    if (file.size === 0) {
      return 'The selected file is empty. Please upload a valid PDF.';
    }

    if (file.size > 50 * 1024 * 1024) {
      return 'File size exceeds 50 MB. Please compress or split the PDF and try again.';
    }

    // Fast header check — confirm %PDF- signature before reading the whole file
    try {
      const headerBuf = await file.slice(0, 5).arrayBuffer();
      const h = new Uint8Array(headerBuf);
      if (!(h[0] === 0x25 && h[1] === 0x50 && h[2] === 0x44 && h[3] === 0x46 && h[4] === 0x2d)) {
        return 'Please upload a PDF file only.';
      }
    } catch {
      // ignore — pdf.js will also reject a corrupt file
    }

    // Render-based blank detection via pdf.js.
    // Heuristics (scanning raw bytes for /Font etc.) cannot detect blank scanned pages
    // because they look identical to real scans at the byte level.
    // Rendering at low resolution and checking pixel brightness is the only reliable approach.
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url,
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (pdf.numPages === 0) {
        return 'This PDF has no pages. Please upload a valid document.';
      }

      // Render page 1 at scale 0.15 (~96×136 px for A4) — fast, enough for blank detection
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.15 });

      const canvas = document.createElement('canvas');
      canvas.width  = Math.ceil(viewport.width);
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

      const totalPixels = canvas.width * canvas.height;
      if (nonWhite / totalPixels < 0.005) {
        return 'This PDF appears to be blank. Please upload a document with content.';
      }

      // Page-count check only after confirming the document is a valid, non-blank PDF
      if (docId === 'auditors-report' && pdf.numPages < 2) {
        return "A valid Auditor's Report must contain more than one page.";
      }
    } catch (err) {
      // pdf.js failed to load or render — let the backend validate instead
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
      'ULB-EDITOR': 'ULB Editor',
      'ULB-VIEWER': 'ULB Viewer',
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
