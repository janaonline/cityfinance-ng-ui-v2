import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  computed,
  inject,
  signal,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Location, NgClass } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PDFDocument } from 'pdf-lib';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment';
import { XVIFC_LS_KEYS, type XvifcDocumentYears } from '../../../shared/years-selection/years-selection.component';
import {
  UlbFormsDialogComponent,
  ULB_FORMS_DIALOG_PANEL_CLASS,
  type UlbFormsDialogData,
} from './ulb-forms-dialog.component';

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

export const UPLOAD_CONFIGS: Record<'audited' | 'provisional', UploadPageConfig> = {
  audited: {
    type: 'audited',
    description:
      'Upload your audited financial statement for FY 2024-25. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.',
    confirmLabel: 'Confirm Audited Documents',
    documents: [
      { id: 'receipts-payments', title: 'Receipts and Payments Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'income-expenditure', title: 'Income and Expenditure Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'income-statement-schedules', title: 'Income Statement Schedules', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: 'FY 2024-25 · PDF only' },
      { id: 'auditors-report', title: "Auditor's Report", subtitle: 'PDF only · CA-certified' },
    ],
  },
  provisional: {
    type: 'provisional',
    description:
      'Upload your provisional financial statement for FY 2025-26. You may upload documents in any order. The system will automatically verify that each document is readable and meets the required checks.',
    confirmLabel: 'Confirm Provisional Documents',
    documents: [
      { id: 'receipts-payments', title: 'Receipts and Payments Statement', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'balance-sheet', title: 'Balance Sheet', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'balance-sheet-schedules', title: 'Balance Sheet Schedules', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'income-expenditure', title: 'Income and Expenditure Statement', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'income-statement-schedules', title: 'Income Statement Schedules', subtitle: 'FY 2025-26 · PDF only' },
      { id: 'cash-flow', title: 'Cash Flow Statement', subtitle: 'FY 2025-26 · PDF only' },
    ],
  },
};

const YEAR_BY_TYPE: Record<'audited' | 'provisional', string> = {
  audited: '2024-25',
  provisional: '2025-26',
};

type DocumentStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

interface UploadDocument extends UploadDocumentDef {
  status: DocumentStatus;
  fileName: string | null;
  fileSize: number | null;
  previewUrl: string | null;
  s3FileUrl: string | null;
  s3Path: string | null;
  pageCount: number | null;
  mimeType: string | null;
  version: string | null;
  uploadedAt: Date | null;
  uploaderUserId: string | null;
  uploaderName: string | null;
  uploaderRole: string | null;
}

interface UlbDetails {
  ulbName: string;
  stateName: string;
  selectedYear: string;
}

interface S3SignedUrlResult {
  url: string;
  fileAlias: string;
  fileUrl: string;
  path: string;
  fileSize: number | null | undefined;
  pages: number | undefined;
}

interface DbDocument {
  docId: string;
  type: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  pages: number;
  mimeType: string;
  filePath: string;
  version: string;
  userInfo: { userId: string | { _id: string; name: string }; role: string };
  uploadedAt: string;
}

interface DbYearSection {
  yearId: string;
  year: string;
  documents: DbDocument[];
}

interface AnnualAccountRecord {
  auditedData?: DbYearSection;
  unauditedData?: DbYearSection;
}

const S3_UPLOAD_FOLDER = 'ulb-forms/2026';

function emptyDoc(def: UploadDocumentDef): UploadDocument {
  return {
    ...def,
    status: 'pending',
    fileName: null,
    fileSize: null,
    previewUrl: null,
    s3FileUrl: null,
    s3Path: null,
    pageCount: null,
    mimeType: null,
    version: null,
    uploadedAt: null,
    uploaderUserId: null,
    uploaderName: null,
    uploaderRole: null,
  };
}

@Component({
  selector: 'app-upload-documents',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './upload-documents.component.html',
  styleUrl: './upload-documents.component.scss',
})
export class UploadDocumentsComponent implements OnInit, OnDestroy {
  private readonly location = inject(Location);
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('fileInput') private readonly fileInputRef!: ElementRef<HTMLInputElement>;
  private pendingDocId: string | null = null;

  readonly config: UploadPageConfig = this.route.snapshot.data['config'] as UploadPageConfig;

  readonly ulbDetails = signal<UlbDetails | null>(this.loadUlbDetails());
  readonly isLoadingExisting = signal(true);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  private readonly isSaved = signal(false);
  private readonly loggedInUserId = this.getLoggedInUserId();

  readonly documents = signal<UploadDocument[]>(this.config.documents.map(emptyDoc));

  readonly readyCount = computed(() => this.documents().filter((d) => d.status === 'uploaded').length);
  readonly totalCount = this.config.documents.length;
  readonly progressPct = computed(() => Math.round((this.readyCount() / this.totalCount) * 100));
  readonly allReady = computed(() => this.readyCount() === this.totalCount);
  readonly hasUnsavedUploads = computed(() => this.readyCount() > 0 && !this.isSaved());

  async ngOnInit(): Promise<void> {
    await this.loadExistingData();
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedUploads()) {
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.documents().forEach((d) => {
      if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
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

    console.log(`[upload] step 0 — file selected`, { docId, name: file.name, size: file.size, type: file.type });

    this.documents.update((docs) =>
      docs.map((d) => (d.id === docId ? { ...d, status: 'uploading', fileName: file.name } : d)),
    );

    try {
      const pageCount = await this.readPdfPageCount(file);
      console.log(`[upload] step 1 — PDF page count`, { pageCount });

      const s3Result = await firstValueFrom(
        this.http
          .post<{ success: boolean; data: S3SignedUrlResult[] }>(
            `${environment.api.url2}s3/signed-url`,
            [{ fileName: file.name, fileUrl: '', fileSize: file.size, pages: pageCount ?? 0, mimeType: file.type, folder: S3_UPLOAD_FOLDER }],
          )
          .pipe(map((res) => res.data[0])),
      );
      console.log(`[upload] step 2 — presigned URL received`, { s3Result });

      await firstValueFrom(
        this.http.put(s3Result.url, file, {
          headers: new HttpHeaders({ 'Content-Type': file.type }),
          responseType: 'text',
        }),
      );
      console.log(`[upload] step 3 — S3 upload complete ✓`);

      const previewUrl = URL.createObjectURL(file);

      this.documents.update((docs) =>
        docs.map((d) => {
          if (d.id !== docId) return d;
          if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
          return {
            ...d,
            status: 'uploaded',
            fileName: file.name,
            fileSize: file.size,
            previewUrl,
            s3FileUrl: s3Result.fileUrl,
            s3Path: s3Result.path,
            pageCount,
            mimeType: file.type,
            version: null,       // version assigned server-side on save
            uploadedAt: new Date(),
            uploaderUserId: this.loggedInUserId,
            uploaderName: null,
            uploaderRole: null,
          };
        }),
      );

      this.isSaved.set(false);
    } catch (err) {
      console.error('[upload] FAILED', err);
      this.documents.update((docs) =>
        docs.map((d) => (d.id === docId ? { ...d, status: 'error', fileName: null } : d)),
      );
    }
  }

  async removeDocument(docId: string): Promise<void> {
    const removeData: UlbFormsDialogData = {
      title: 'Remove this document?',
      icon: { name: 'warning_amber', color: '#e53935' },
      description:
        'This document has already passed validation. Removing it will clear the current verification result — the system will run the checks again on your replacement file.',
      buttons: [
        { label: 'Cancel',             result: 'cancel', variant: 'stroked' },
        { label: 'Remove and re-upload', result: 'remove', variant: 'flat', bgColor: '#e53935' },
      ],
    };

    const result = await firstValueFrom(
      this.dialog
        .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(
          UlbFormsDialogComponent,
          { data: removeData, disableClose: true, width: '500px', maxWidth: '95vw', maxHeight: '90vh', panelClass: ULB_FORMS_DIALOG_PANEL_CLASS },
        )
        .afterClosed(),
    );

    if (result !== 'remove') return;

    this.documents.update((docs) =>
      docs.map((d) => {
        if (d.id !== docId) return d;
        if (d.previewUrl) URL.revokeObjectURL(d.previewUrl);
        return emptyDoc(this.config.documents.find((def) => def.id === docId)!);
      }),
    );

    this.isSaved.set(false);
  }

  previewFile(doc: UploadDocument): void {
    const url = doc.s3FileUrl ?? doc.previewUrl;
    if (url) window.open(url, '_blank', 'noopener');
  }

  async saveDraft(): Promise<void> {
    await this.persistToDb();
  }

  async confirmDocuments(): Promise<void> {
    const rows = this.documents()
      .filter((d) => d.status === 'uploaded')
      .map((d) => ({
        title: d.title,
        fileName: d.fileName,
        version: d.version,
        uploaderLabel: this.uploaderLabel(d),
        byTeammate: !!d.uploaderUserId && d.uploaderUserId !== this.loggedInUserId,
      }));

    const confirmData: UlbFormsDialogData = {
      title: 'Review before submitting',
      description:
        'Check that each document is correct. Rows highlighted in amber were uploaded by a teammate — verify them before confirming. Once submitted, files are locked until State DMA responds.',
      table: rows,
      buttons: [
        { label: 'Go back',            result: 'back',   variant: 'stroked' },
        { label: 'Submit to State DMA', result: 'submit', variant: 'flat' },
      ],
    };

    const result = await firstValueFrom(
      this.dialog
        .open<UlbFormsDialogComponent, UlbFormsDialogData, string>(
          UlbFormsDialogComponent,
          { data: confirmData, disableClose: true, width: '600px', maxWidth: '95vw', maxHeight: '90vh', panelClass: ULB_FORMS_DIALOG_PANEL_CLASS },
        )
        .afterClosed(),
    );

    if (result !== 'submit') return;
    await this.persistToDb();
  }

  uploaderLabel(doc: UploadDocument): string {
    if (!doc.uploaderUserId) return '';
    if (doc.uploaderUserId === this.loggedInUserId) return 'You';
    return doc.uploaderName ?? (doc.uploaderRole ? this.roleLabel(doc.uploaderRole) : 'Another user');
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
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  }

  formatFileSize(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private async loadExistingData(): Promise<void> {
    const yearId = this.resolveYearId();
    const ulbId = this.resolveUlbId();

    if (!yearId || !ulbId) {
      this.isLoadingExisting.set(false);
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: AnnualAccountRecord }>(
          `${environment.api.url2}xvi-fc/annual-account/${ulbId}/${yearId}`,
        ),
      );

      const section =
        this.config.type === 'audited'
          ? response.data?.auditedData
          : response.data?.unauditedData;

      if (section?.documents?.length) {
        this.documents.update((docs) =>
          docs.map((doc) => {
            const saved = section.documents.find((d) => d.docId === doc.id);
            if (!saved) return doc;

            const rawUserId = saved.userInfo?.userId;
            const uploaderUserId = typeof rawUserId === 'object' ? rawUserId._id : (rawUserId ?? null);
            const uploaderName   = typeof rawUserId === 'object' ? rawUserId.name : null;

            return {
              ...doc,
              status: 'uploaded' as DocumentStatus,
              fileName: saved.fileName ?? this.extractDisplayName(saved.filePath),
              fileSize: saved.fileSize ?? null,
              previewUrl: null,
              s3FileUrl: saved.fileUrl ?? null,
              s3Path: saved.filePath,
              pageCount: saved.pages,
              mimeType: saved.mimeType,
              version: saved.version,
              uploadedAt: new Date(saved.uploadedAt),
              uploaderUserId,
              uploaderName,
              uploaderRole: saved.userInfo?.role ?? null,
            };
          }),
        );

        this.isSaved.set(true);
      }
    } catch (err: unknown) {
      if ((err as { status?: number })?.status !== 404) {
        console.error('[load] failed to load existing data', err);
      }
    } finally {
      this.isLoadingExisting.set(false);
    }
  }

  private async persistToDb(): Promise<void> {
    const designYear = this.resolveYearId();
    const ulbId = this.resolveUlbId();

    if (!designYear || !ulbId) {
      console.error('[save] missing yearId or ulbId', { designYear, ulbId });
      this.saveError.set('Session context is missing. Please reload the page.');
      return;
    }

    const docYear = this.resolveDocumentYear();
    const year = docYear?.year ?? YEAR_BY_TYPE[this.config.type];
    const docYearId = docYear?._id ?? designYear;

    const uploadedDocs = this.documents().filter((d) => d.status === 'uploaded');
    if (uploadedDocs.length === 0) return;

    const documents = uploadedDocs.map((d) => ({
      docId: d.id,
      type: d.title,
      fileName: d.fileName ?? undefined,
      fileSize: d.fileSize ?? undefined,
      pages: d.pageCount ?? 0,
      mimeType: d.mimeType ?? 'application/pdf',
      filePath: d.s3Path ?? d.s3FileUrl ?? '',
      fileUrl: d.s3FileUrl ?? undefined,
    }));

    const sectionKey = this.config.type === 'audited' ? 'auditedData' : 'unauditedData';
    const payload = {
      ulb: ulbId,
      design_year: designYear,
      [sectionKey]: { yearId: docYearId, year, documents },
    };

    this.isSaving.set(true);
    this.saveError.set(null);

    try {
      await firstValueFrom(
        this.http.post<{ success: boolean; data: unknown }>(
          `${environment.api.url2}xvi-fc/annual-account`,
          payload,
        ),
      );
      this.isSaved.set(true);
      await this.loadExistingData(); // refresh to get server-assigned version numbers
    } catch (err) {
      console.error('[save] failed', err);
      this.saveError.set('Failed to save documents. Please try again.');
      throw err;
    } finally {
      this.isSaving.set(false);
    }
  }

  private async readPdfPageCount(file: File): Promise<number | null> {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return pdf.getPageCount();
    } catch {
      return null;
    }
  }

  private resolveYearId(): string | null {
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

  private resolveDocumentYear(): { _id: string; year: string } | null {
    try {
      const raw = localStorage.getItem(XVIFC_LS_KEYS.documentYears);
      if (!raw) return null;
      return (JSON.parse(raw) as XvifcDocumentYears)[this.config.type] ?? null;
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
      'ULB': 'ULB User',
      'ULB-EDITOR': 'ULB Editor',
      'ULB-VIEWER': 'ULB Viewer',
      'STATE': 'State User',
    };
    return map[role] ?? role;
  }

  private extractDisplayName(filePath: string): string {
    const filename = filePath.split('/').pop() ?? filePath;
    return filename.replace(/_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[^.]+)$/, '$1');
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
